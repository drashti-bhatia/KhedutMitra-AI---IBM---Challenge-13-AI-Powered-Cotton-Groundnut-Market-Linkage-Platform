"""
Agent 3: Storage & Selling Timing Advisor Agent
Combines price forecast + storage cost + farmer cash need to advise sell/store.
"""
from typing import Optional
from .granite_client import granite_generate
from .price_forecast_agent import run_price_forecast_agent

# Storage cost parameters (₹ per quintal per day)
STORAGE_COSTS = {
    "cotton": {
        "cost_per_quintal_per_day": 2.5,
        "spoilage_rate_per_week_pct": 0.3,  # cotton is stable
        "max_safe_storage_days": 180,
    },
    "groundnut": {
        "cost_per_quintal_per_day": 3.0,
        "spoilage_rate_per_week_pct": 1.2,  # groundnut more perishable
        "max_safe_storage_days": 90,
    },
}


async def run_storage_advisor_agent(
    crop: str,
    mandi: str,
    quantity_quintal: float,
    current_price: Optional[float] = None,
    urgent_cash_need: bool = False,
    storage_days_available: int = 30,
) -> dict:
    """
    Main entry point for Storage & Selling Timing Advisor Agent.
    """
    crop_lower = crop.lower()

    # Get price forecast
    forecast_result = await run_price_forecast_agent(crop, mandi, forecast_days=30)

    if "error" in forecast_result:
        return {"error": forecast_result["error"]}

    # Use last known price if not provided
    if current_price is None:
        current_price = forecast_result["last_known_price"]

    forecast_list = forecast_result["forecast"]
    storage_params = STORAGE_COSTS.get(crop_lower, STORAGE_COSTS["cotton"])

    # Analyse breakeven storage periods
    storage_analysis = []
    for target_days in [7, 14, 21, 30]:
        if target_days > storage_days_available:
            continue
        if target_days > storage_params["max_safe_storage_days"]:
            continue

        # Forecast price at target date
        if target_days <= len(forecast_list):
            forecast_price = forecast_list[target_days - 1]["predicted_price"]
        else:
            forecast_price = forecast_list[-1]["predicted_price"]

        # Storage costs
        storage_cost = storage_params["cost_per_quintal_per_day"] * target_days
        spoilage_loss = (storage_params["spoilage_rate_per_week_pct"] / 100) * (target_days / 7) * current_price
        total_cost = storage_cost + spoilage_loss

        # Net benefit per quintal
        price_gain = forecast_price - current_price
        net_benefit = price_gain - total_cost
        net_benefit_total = net_benefit * quantity_quintal

        storage_analysis.append({
            "days": target_days,
            "forecast_price": forecast_price,
            "price_gain_per_quintal": round(price_gain, 0),
            "storage_cost_per_quintal": round(storage_cost, 1),
            "spoilage_loss_per_quintal": round(spoilage_loss, 1),
            "total_cost_per_quintal": round(total_cost, 1),
            "net_benefit_per_quintal": round(net_benefit, 1),
            "net_benefit_total": round(net_benefit_total, 0),
        })

    # Determine recommendation
    recommendation = "SELL_NOW"
    recommended_days = 0
    best_option = None

    if storage_analysis:
        # Find the best net benefit option
        positive_options = [x for x in storage_analysis if x["net_benefit_per_quintal"] > 0]
        if positive_options and not urgent_cash_need:
            best_option = max(positive_options, key=lambda x: x["net_benefit_per_quintal"])
            recommended_days = best_option["days"]

            if best_option["net_benefit_per_quintal"] > 50:
                recommendation = f"STORE_{recommended_days}_DAYS"
            elif best_option["net_benefit_per_quintal"] > 20:
                # Partial sell recommendation
                recommendation = "SELL_PARTIAL"
        elif urgent_cash_need:
            recommendation = "SELL_NOW"
            recommended_days = 0

    # Build LLM explanation prompt
    best_summary = ""
    if best_option:
        best_summary = (
            f"Storing {recommended_days} days: forecast price ₹{best_option['forecast_price']:.0f} "
            f"(gain ₹{best_option['price_gain_per_quintal']:.0f}/quintal minus costs ₹{best_option['total_cost_per_quintal']:.1f}/quintal = "
            f"net ₹{best_option['net_benefit_per_quintal']:.1f}/quintal, ₹{best_option['net_benefit_total']:.0f} total)"
        )
    else:
        best_summary = "No profitable storage window identified in the next 30 days"

    prompt = f"""You are KhedutMitra AI advisor. Give a clear 2-3 sentence storage recommendation in English.

Crop: {crop.title()}, Mandi: {mandi.title()}
Quantity: {quantity_quintal} quintals
Current price: ₹{current_price:.0f}/quintal
Recommendation: {recommendation}
Urgent cash need: {urgent_cash_need}
Analysis: {best_summary}
Trend: {forecast_result['trend']} ({forecast_result['trend_pct']:+.1f}%)

Explain the recommendation clearly to a farmer. Mention the trade-off between price gain and storage cost. Be concise.

Advice:"""

    llm_advice = await granite_generate(prompt, max_new_tokens=200)

    return {
        "crop": crop.title(),
        "mandi": mandi.title(),
        "quantity_quintal": quantity_quintal,
        "current_price": current_price,
        "urgent_cash_need": urgent_cash_need,
        "recommendation": recommendation,
        "recommended_storage_days": recommended_days,
        "storage_analysis": storage_analysis,
        "price_trend": forecast_result["trend"],
        "trend_pct": forecast_result["trend_pct"],
        "llm_advice": llm_advice,
        "storage_params": {
            "cost_per_quintal_per_day": storage_params["cost_per_quintal_per_day"],
            "spoilage_rate_per_week_pct": storage_params["spoilage_rate_per_week_pct"],
            "max_safe_storage_days": storage_params["max_safe_storage_days"],
        },
        "disclaimer": "This is a data-informed recommendation. Final decision should consider your specific storage facility quality and local mandi conditions.",
    }
