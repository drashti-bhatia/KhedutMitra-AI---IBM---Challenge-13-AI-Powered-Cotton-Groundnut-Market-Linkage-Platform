"""
Agent 4: Quality Grading Assistance Agent
Estimates crop grade from moisture %, foreign matter %, and optional photo.
In production, a trained vision model replaces the rule-based classifier.
"""
from typing import Optional
from .granite_client import granite_generate

# Grading standards (rule-based for hackathon; replace with vision model in prod)
COTTON_GRADE_RULES = [
    {
        "grade": "Premium (S-6)",
        "description": "Extra long staple, clean, low moisture",
        "moisture_max": 8.0,
        "foreign_matter_max": 1.0,
        "min_score": 0.85,
    },
    {
        "grade": "FAQ (Fair Average Quality)",
        "description": "Standard quality, normal moisture, minor trash",
        "moisture_max": 10.0,
        "foreign_matter_max": 3.0,
        "min_score": 0.60,
    },
    {
        "grade": "Grade A",
        "description": "Good quality with minor imperfections",
        "moisture_max": 11.0,
        "foreign_matter_max": 4.0,
        "min_score": 0.45,
    },
    {
        "grade": "Grade B",
        "description": "Below average — higher moisture or trash content",
        "moisture_max": 13.0,
        "foreign_matter_max": 6.0,
        "min_score": 0.25,
    },
    {
        "grade": "Grade C (Low Grade)",
        "description": "Heavily discounted — high moisture, trash, or damage",
        "moisture_max": 99.0,
        "foreign_matter_max": 99.0,
        "min_score": 0.0,
    },
]

GROUNDNUT_GRADE_RULES = [
    {
        "grade": "Bold (Premium)",
        "description": "Uniform large pods, low moisture, minimal shrivelling",
        "moisture_max": 7.0,
        "foreign_matter_max": 1.0,
        "min_score": 0.85,
    },
    {
        "grade": "FAQ (Fair Average Quality)",
        "description": "Standard size pods, normal moisture",
        "moisture_max": 9.0,
        "foreign_matter_max": 2.5,
        "min_score": 0.65,
    },
    {
        "grade": "Grade A",
        "description": "Mixed sizes, acceptable moisture",
        "moisture_max": 11.0,
        "foreign_matter_max": 4.0,
        "min_score": 0.45,
    },
    {
        "grade": "Grade B",
        "description": "Small/shrivelled pods, elevated moisture",
        "moisture_max": 13.0,
        "foreign_matter_max": 6.0,
        "min_score": 0.25,
    },
    {
        "grade": "Rejected/Below Standard",
        "description": "Excessive moisture, aflatoxin risk, or heavy impurities",
        "moisture_max": 99.0,
        "foreign_matter_max": 99.0,
        "min_score": 0.0,
    },
]

# Price impact estimates per grade (relative to FAQ = 100%)
GRADE_PRICE_IMPACT = {
    "cotton": {
        "Premium (S-6)": 1.12,
        "FAQ (Fair Average Quality)": 1.00,
        "Grade A": 0.95,
        "Grade B": 0.88,
        "Grade C (Low Grade)": 0.78,
    },
    "groundnut": {
        "Bold (Premium)": 1.10,
        "FAQ (Fair Average Quality)": 1.00,
        "Grade A": 0.94,
        "Grade B": 0.85,
        "Rejected/Below Standard": 0.70,
    },
}


def compute_quality_score(moisture_pct: float, foreign_matter_pct: float, has_photo: bool) -> float:
    """
    Compute a quality score 0-1.
    Lower moisture and lower foreign matter → higher score.
    """
    moisture_score = max(0, 1 - (moisture_pct / 15))
    fm_score = max(0, 1 - (foreign_matter_pct / 8))
    photo_bonus = 0.05 if has_photo else 0.0  # Slight confidence boost with photo

    # Weighted score
    score = (moisture_score * 0.5) + (fm_score * 0.4) + (photo_bonus * 0.1)
    return min(1.0, max(0.0, round(score, 3)))


def classify_grade(crop: str, quality_score: float, moisture_pct: float, foreign_matter_pct: float) -> dict:
    """Rule-based grade classification."""
    rules = COTTON_GRADE_RULES if crop.lower() == "cotton" else GROUNDNUT_GRADE_RULES
    price_map = GRADE_PRICE_IMPACT.get(crop.lower(), {})

    for rule in rules:
        if (moisture_pct <= rule["moisture_max"] and
                foreign_matter_pct <= rule["foreign_matter_max"] and
                quality_score >= rule["min_score"]):
            return {
                "grade": rule["grade"],
                "description": rule["description"],
                "price_impact_factor": price_map.get(rule["grade"], 1.0),
            }

    # Fallback to lowest grade
    lowest = rules[-1]
    return {
        "grade": lowest["grade"],
        "description": lowest["description"],
        "price_impact_factor": price_map.get(lowest["grade"], 0.75),
    }


async def run_quality_grading_agent(
    crop: str,
    moisture_pct: float = 10.0,
    foreign_matter_pct: float = 2.0,
    has_photo: bool = False,
    photo_description: Optional[str] = None,
    quantity_quintal: Optional[float] = None,
    reference_price: Optional[float] = None,
) -> dict:
    """
    Main entry point for Quality Grading Assistance Agent.
    """
    # Compute quality score
    quality_score = compute_quality_score(moisture_pct, foreign_matter_pct, has_photo)

    # Classify grade
    grade_result = classify_grade(crop, quality_score, moisture_pct, foreign_matter_pct)

    # Confidence: lower with only defaults, higher with photo + measurements
    if has_photo and moisture_pct != 10.0:
        confidence = 0.82
    elif has_photo or moisture_pct != 10.0:
        confidence = 0.72
    else:
        confidence = 0.58

    # Estimated price impact
    price_note = ""
    if reference_price:
        estimated_price = reference_price * grade_result["price_impact_factor"]
        price_note = f"Estimated value: ₹{estimated_price:.0f}/quintal (FAQ base: ₹{reference_price:.0f})"

    # Improvement suggestions
    improvements = []
    if moisture_pct > 10:
        improvements.append(f"Reduce moisture from {moisture_pct}% to below 10% by sun-drying 1-2 days")
    if foreign_matter_pct > 2:
        improvements.append(f"Clean the lot to reduce foreign matter from {foreign_matter_pct}% to below 2%")
    if moisture_pct <= 8 and foreign_matter_pct <= 1:
        improvements.append("Your lot meets premium grade standards — maintain during transport/storage")

    # LLM prompt
    photo_context = f"Photo analysis: {photo_description}" if photo_description else "No photo provided"
    prompt = f"""You are a crop quality expert for KhedutMitra AI. Explain this grading result to a farmer in 2-3 simple sentences.

Crop: {crop.title()}
Moisture: {moisture_pct}%
Foreign matter: {foreign_matter_pct}%
Grade assigned: {grade_result['grade']}
{photo_context}
Confidence: {confidence:.0%}
{price_note}

Important: note that final grading must be confirmed by buyer or mandi inspector.

Explanation:"""

    llm_explanation = await granite_generate(prompt, max_new_tokens=180)

    return {
        "crop": crop.title(),
        "moisture_pct": moisture_pct,
        "foreign_matter_pct": foreign_matter_pct,
        "quality_score": quality_score,
        "grade": grade_result["grade"],
        "grade_description": grade_result["description"],
        "confidence": confidence,
        "price_impact_factor": grade_result["price_impact_factor"],
        "price_note": price_note,
        "improvement_suggestions": improvements,
        "llm_explanation": llm_explanation,
        "disclaimer": "Grade estimated from inputs. Final grading must be confirmed by buyer or certified mandi inspector before commercial transactions.",
        "production_note": "In production, a trained vision ML model would analyze the uploaded photo for more accurate grading.",
    }
