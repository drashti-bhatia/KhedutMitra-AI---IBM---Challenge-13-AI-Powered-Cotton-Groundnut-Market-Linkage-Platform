"""
Agent 2: Direct Buyer-Farmer Matching Agent
Matches farmer's lot to verified buyers by price, distance, and reliability.
"""
import os
import math
import pandas as pd
from typing import Optional
from .granite_client import granite_generate

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "buyers.csv")

# Approximate district centroids (lat, lon) for distance calculation
DISTRICT_COORDS = {
    "rajkot": (22.3039, 70.8022),
    "junagadh": (21.5222, 70.4579),
    "surendranagar": (22.7271, 71.6407),
    "amreli": (21.6033, 71.2169),
    "ahmedabad": (23.0225, 72.5714),
    "bhavnagar": (21.7645, 72.1519),
    "morbi": (22.8170, 70.8378),
    "porbandar": (21.6427, 69.6093),
    "jamnagar": (22.4707, 70.0577),
    "surat": (21.1702, 72.8311),
    "gondal": (21.9641, 70.8027),
    "anand": (22.5645, 72.9289),
    "navsari": (20.9517, 72.9520),
    "vadodara": (22.3072, 73.1812),
}


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    """Calculate distance in km between two lat/lon points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def load_buyers() -> pd.DataFrame:
    return pd.read_csv(DATA_PATH)


def score_buyer(buyer: dict, farmer_min_price: float, farmer_qty: float, farmer_district: str, crop: str) -> float:
    """Score a buyer based on price premium, distance, reliability, and quantity fit."""
    score = 0.0

    # 1. Price premium (weight: 40%)
    price_gap = buyer["max_price_offered"] - farmer_min_price
    price_score = min(1.0, max(0.0, price_gap / (farmer_min_price * 0.15)))  # 15% range
    score += price_score * 0.40

    # 2. Reliability score (weight: 30%)
    reliability_score = (buyer["reliability_score"] - 1) / 4.0  # normalize 1-5 to 0-1
    score += reliability_score * 0.30

    # 3. Quantity match (weight: 20%)
    if farmer_qty >= buyer["min_qty_quintal"]:
        qty_score = 1.0
    else:
        qty_score = farmer_qty / buyer["min_qty_quintal"]
    score += qty_score * 0.20

    # 4. Distance proximity (weight: 10%)
    farmer_coords = DISTRICT_COORDS.get(farmer_district.lower(), (22.3039, 70.8022))
    buyer_coords = DISTRICT_COORDS.get(buyer["district"].lower(), (22.3039, 70.8022))
    distance_km = haversine_km(*farmer_coords, *buyer_coords)
    distance_score = max(0.0, 1.0 - distance_km / 500)  # 500km max range
    score += distance_score * 0.10

    return round(score, 4)


async def run_buyer_matching_agent(
    crop: str,
    quantity_quintal: float,
    quality_grade: str,
    farmer_district: str,
    min_acceptable_price: float,
    farmer_name: Optional[str] = "Farmer",
) -> dict:
    """
    Main entry point for Buyer-Farmer Matching Agent.
    Returns top 3 buyer matches with negotiation starters.
    """
    buyers_df = load_buyers()

    # Filter by crop interest
    crop_buyers = buyers_df[buyers_df["crop_interest"].str.lower() == crop.lower()].copy()

    if crop_buyers.empty:
        return {
            "error": f"No registered buyers for {crop}. Available crops: cotton, groundnut",
            "crop": crop,
        }

    # Score all buyers
    crop_buyers["score"] = crop_buyers.apply(
        lambda row: score_buyer(row.to_dict(), min_acceptable_price, quantity_quintal, farmer_district, crop),
        axis=1,
    )

    # Sort and take top 3
    top_buyers = crop_buyers.nlargest(3, "score").to_dict("records")

    matches = []
    for rank, buyer in enumerate(top_buyers, 1):
        distance_km = 0
        farmer_coords = DISTRICT_COORDS.get(farmer_district.lower(), (22.3039, 70.8022))
        buyer_coords = DISTRICT_COORDS.get(buyer["district"].lower(), (22.3039, 70.8022))
        distance_km = round(haversine_km(*farmer_coords, *buyer_coords), 1)

        price_premium = buyer["max_price_offered"] - min_acceptable_price
        price_premium_pct = (price_premium / min_acceptable_price) * 100 if min_acceptable_price > 0 else 0

        # Generate negotiation message via LLM
        prompt = f"""Write a short negotiation starter message in English (2 sentences) that farmer {farmer_name} can send to {buyer['name']} at {buyer['company']}.
Farmer has {quantity_quintal} quintals of {quality_grade} grade {crop} from {farmer_district}.
Buyer's current offer is ₹{buyer['max_price_offered']}/quintal. Be polite, professional, and mention the quality grade.

Message:"""

        neg_message = await granite_generate(prompt, max_new_tokens=100)

        reason = f"Offers ₹{price_premium:+.0f} above your minimum ({price_premium_pct:.1f}% premium). Reliability: {buyer['reliability_score']}/5. Distance: {distance_km} km."

        matches.append({
            "rank": rank,
            "buyer_id": buyer["buyer_id"],
            "name": buyer["name"],
            "company": buyer["company"],
            "buyer_type": buyer["buyer_type"],
            "price_offered": buyer["max_price_offered"],
            "price_premium_above_min": round(price_premium, 0),
            "price_premium_pct": round(price_premium_pct, 1),
            "location": buyer["location"],
            "district": buyer["district"],
            "distance_km": distance_km,
            "reliability_score": buyer["reliability_score"],
            "contact_phone": str(buyer["contact_phone"]),
            "match_score": buyer["score"],
            "reason": reason,
            "negotiation_starter": neg_message,
        })

    return {
        "crop": crop.title(),
        "quantity_quintal": quantity_quintal,
        "quality_grade": quality_grade,
        "farmer_district": farmer_district,
        "min_acceptable_price": min_acceptable_price,
        "matches": matches,
        "note": "Buyer reliability scores are based on platform feedback. Always verify buyer credentials before finalizing a deal.",
    }
