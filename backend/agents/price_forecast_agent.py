"""
Agent 1: Mandi Price Forecasting Agent
Ingests historical mandi prices and forecasts next 7/15/30 day prices.
"""
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional
from .granite_client import granite_generate

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "mandi_prices.csv")


def load_mandi_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH, parse_dates=["date"])
    return df


def moving_average_forecast(series: pd.Series, window: int = 7, periods: int = 7) -> List[float]:
    """Simple moving average forecast with trend adjustment."""
    if len(series) < window:
        window = max(1, len(series))

    ma = series.rolling(window=window).mean().dropna()
    if len(ma) < 2:
        last_price = float(series.iloc[-1]) if len(series) > 0 else 5500.0
        return [last_price] * periods

    # Calculate trend (slope per day)
    recent = ma.tail(min(14, len(ma)))
    x = np.arange(len(recent))
    slope, intercept = np.polyfit(x, recent.values, 1)

    # Cap trend at ±1.5% per day for realism
    last_val = float(series.iloc[-1])
    max_daily_change = last_val * 0.015
    slope = np.clip(slope, -max_daily_change, max_daily_change)

    # Seasonal factor: slight weekend dip (arrivals lower on holidays)
    forecast = []
    for i in range(periods):
        day_offset = len(recent) + i
        predicted = float(intercept) + slope * day_offset
        # Add small noise band for realism
        noise = np.random.normal(0, last_val * 0.005)
        predicted += noise
        forecast.append(round(max(predicted, 1000), 0))

    return forecast


def calculate_confidence(series: pd.Series, window: int = 7) -> float:
    """Compute confidence based on price volatility."""
    if len(series) < 3:
        return 0.55
    recent = series.tail(14)
    cv = float(recent.std() / recent.mean()) if recent.mean() != 0 else 0.5
    # Lower volatility → higher confidence
    confidence = max(0.45, min(0.92, 1.0 - cv * 5))
    return round(confidence, 2)


def get_key_drivers(df_filtered: pd.DataFrame) -> List[str]:
    """Generate data-driven key drivers for the forecast."""
    drivers = []
    if len(df_filtered) < 7:
        return ["Insufficient historical data for driver analysis"]

    recent = df_filtered.tail(7)
    earlier = df_filtered.tail(14).head(7)

    # Arrivals trend
    recent_arrivals = recent["arrivals_quintal"].mean()
    earlier_arrivals = earlier["arrivals_quintal"].mean()
    if earlier_arrivals > 0:
        arrivals_change = ((recent_arrivals - earlier_arrivals) / earlier_arrivals) * 100
        if arrivals_change < -10:
            drivers.append(f"Arrivals down {abs(arrivals_change):.0f}% — supply tightening, upward price pressure")
        elif arrivals_change > 10:
            drivers.append(f"Arrivals up {arrivals_change:.0f}% — increased supply, downward price pressure")
        else:
            drivers.append("Arrivals stable — balanced supply-demand")

    # Price momentum
    recent_price = recent["modal_price"].mean()
    earlier_price = earlier["modal_price"].mean()
    if earlier_price > 0:
        price_change = ((recent_price - earlier_price) / earlier_price) * 100
        if price_change > 2:
            drivers.append(f"Prices up {price_change:.1f}% in past 7 days — bullish momentum")
        elif price_change < -2:
            drivers.append(f"Prices down {abs(price_change):.1f}% in past 7 days — bearish momentum")

    drivers.append("MSP (Minimum Support Price) acts as price floor")
    drivers.append("Export demand and oil mill procurement levels influence groundnut prices")

    return drivers[:3]


async def run_price_forecast_agent(
    crop: str,
    mandi: str,
    district: Optional[str] = None,
    forecast_days: int = 7,
) -> dict:
    """
    Main entry point for Price Forecasting Agent.
    Returns structured forecast + LLM-generated explanation.
    """
    df = load_mandi_data()

    # Filter by crop and mandi
    crop_lower = crop.lower()
    mandi_lower = mandi.lower()
    df_filtered = df[
        (df["crop"].str.lower() == crop_lower) &
        (df["mandi"].str.lower() == mandi_lower)
    ].sort_values("date")

    # Fallback to just crop if mandi not found
    if len(df_filtered) < 5:
        df_filtered = df[df["crop"].str.lower() == crop_lower].sort_values("date")

    if len(df_filtered) == 0:
        return {
            "error": f"No data found for {crop} at {mandi}. Available mandis: Rajkot, Junagadh, Surendranagar, Gondal, Amreli",
            "crop": crop,
            "mandi": mandi,
        }

    prices = df_filtered["modal_price"]
    last_date = df_filtered["date"].max()
    last_price = float(prices.iloc[-1])

    # Generate forecast
    forecast_values = moving_average_forecast(prices, window=7, periods=forecast_days)
    confidence = calculate_confidence(prices)
    key_drivers = get_key_drivers(df_filtered)

    # Build forecast list
    forecast_list = []
    for i, pred_price in enumerate(forecast_values):
        forecast_date = last_date + timedelta(days=i + 1)
        forecast_list.append({
            "date": forecast_date.strftime("%Y-%m-%d"),
            "predicted_price": pred_price,
            "confidence": confidence,
        })

    # MSP reference prices (2024)
    msp_reference = {
        "cotton": 7020,   # MSP for medium staple cotton
        "groundnut": 6377,  # MSP for groundnut-in-shell
    }
    msp = msp_reference.get(crop_lower, 0)

    # Trend summary
    avg_forecast = np.mean(forecast_values)
    trend_pct = ((avg_forecast - last_price) / last_price) * 100 if last_price > 0 else 0
    trend_label = "RISING" if trend_pct > 1 else ("FALLING" if trend_pct < -1 else "STABLE")

    # Build LLM prompt
    prompt = f"""You are KhedutMitra AI, an AI assistant for Gujarat farmers. Analyze this price forecast data and generate a short, clear explanation in English (2-3 sentences). 

Crop: {crop.title()}
Mandi: {mandi.title()}  
Current modal price: ₹{last_price:.0f}/quintal
7-day average forecast: ₹{avg_forecast:.0f}/quintal
Trend: {trend_label} ({trend_pct:+.1f}%)
MSP: ₹{msp}/quintal
Key drivers: {', '.join(key_drivers[:2])}

Write a farmer-friendly recommendation. Always add: "This is a forecast — confirm with local mandi before major decisions."

Explanation:"""

    llm_explanation = await granite_generate(prompt, max_new_tokens=200)

    return {
        "crop": crop.title(),
        "mandi": mandi.title(),
        "last_known_price": last_price,
        "msp_reference": msp,
        "forecast_days": forecast_days,
        "trend": trend_label,
        "trend_pct": round(trend_pct, 2),
        "forecast": forecast_list,
        "key_drivers": key_drivers,
        "confidence": confidence,
        "llm_explanation": llm_explanation,
        "data_source": "SAMPLE/DEMO data based on Agmarknet-format structure",
        "disclaimer": "This is a forecast, not a financial guarantee. Confirm with local mandi officials before major selling decisions.",
    }
