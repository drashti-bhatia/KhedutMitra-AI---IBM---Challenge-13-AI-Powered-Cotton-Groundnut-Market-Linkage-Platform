"""
Agent 5: Farmer Income Dashboard Agent
Aggregates transaction history, compares with mandi averages, and generates insights.
"""
import os
import pandas as pd
from typing import Optional
from .granite_client import granite_generate

TRANSACTIONS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "transactions.csv")
MANDI_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "mandi_prices.csv")
FARMERS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "farmers.csv")


def load_data():
    transactions = pd.read_csv(TRANSACTIONS_PATH, parse_dates=["date"])
    mandi_prices = pd.read_csv(MANDI_PATH, parse_dates=["date"])
    farmers = pd.read_csv(FARMERS_PATH)
    return transactions, mandi_prices, farmers


async def run_income_dashboard_agent(farmer_id: str) -> dict:
    """
    Main entry point for Farmer Income Dashboard Agent.
    """
    transactions, mandi_prices, farmers = load_data()

    # Get farmer info
    farmer_row = farmers[farmers["farmer_id"] == farmer_id]
    farmer_name = farmer_row.iloc[0]["name"] if not farmer_row.empty else "Farmer"
    farmer_district = farmer_row.iloc[0]["district"] if not farmer_row.empty else "Gujarat"

    # Get farmer transactions
    farmer_txns = transactions[transactions["farmer_id"] == farmer_id].copy()

    if farmer_txns.empty:
        return {
            "error": f"No transactions found for farmer {farmer_id}",
            "available_farmers": list(farmers["farmer_id"].unique()),
        }

    # Merge with mandi prices to get mandi average on sale date
    enriched = farmer_txns.copy()
    enriched["mandi_avg_price"] = None

    for idx, row in enriched.iterrows():
        mandi_on_date = mandi_prices[
            (mandi_prices["crop"].str.lower() == row["crop"].lower()) &
            (mandi_prices["date"] == row["date"])
        ]
        if not mandi_on_date.empty:
            enriched.at[idx, "mandi_avg_price"] = float(mandi_on_date["modal_price"].mean())
        else:
            # Use nearest available date
            crop_data = mandi_prices[mandi_prices["crop"].str.lower() == row["crop"].lower()]
            if not crop_data.empty:
                nearest = crop_data.iloc[(crop_data["date"] - row["date"]).abs().argsort()[:1]]
                enriched.at[idx, "mandi_avg_price"] = float(nearest["modal_price"].iloc[0])

    enriched["mandi_avg_price"] = pd.to_numeric(enriched["mandi_avg_price"], errors="coerce").fillna(
        enriched["price_realized"]
    )

    # Compute performance vs mandi
    enriched["vs_mandi_pct"] = ((enriched["price_realized"] - enriched["mandi_avg_price"]) / enriched["mandi_avg_price"] * 100).round(2)
    enriched["income"] = enriched["price_realized"] * enriched["quantity_quintal"]
    enriched["mandi_income"] = enriched["mandi_avg_price"] * enriched["quantity_quintal"]
    enriched["savings_vs_mandi"] = enriched["income"] - enriched["mandi_income"]

    # Summary stats
    total_income = float(enriched["income"].sum())
    total_quantity = float(enriched["quantity_quintal"].sum())
    avg_price_realized = float(enriched["price_realized"].mean())
    avg_mandi_price = float(enriched["mandi_avg_price"].mean())
    avg_vs_mandi_pct = float(enriched["vs_mandi_pct"].mean())
    total_savings = float(enriched["savings_vs_mandi"].sum())
    direct_sales_count = int(enriched[enriched["direct_sale"] == True].shape[0])
    total_transactions = len(enriched)

    # Monthly trend
    enriched["month"] = enriched["date"].dt.to_period("M").astype(str)
    monthly = enriched.groupby("month").agg(
        total_income=("income", "sum"),
        quantity=("quantity_quintal", "sum"),
        avg_price=("price_realized", "mean"),
        avg_vs_mandi=("vs_mandi_pct", "mean"),
    ).reset_index()
    monthly_data = monthly.to_dict("records")

    # Per-crop breakdown
    crop_breakdown = enriched.groupby("crop").agg(
        total_income=("income", "sum"),
        quantity=("quantity_quintal", "sum"),
        avg_price=("price_realized", "mean"),
        avg_vs_mandi_pct=("vs_mandi_pct", "mean"),
        transactions=("transaction_id", "count"),
    ).reset_index().to_dict("records")

    # Transaction details
    txn_details = []
    for _, row in enriched.iterrows():
        txn_details.append({
            "transaction_id": row["transaction_id"],
            "date": row["date"].strftime("%Y-%m-%d"),
            "crop": row["crop"].title(),
            "quantity": row["quantity_quintal"],
            "price_realized": row["price_realized"],
            "mandi_avg_price": round(row["mandi_avg_price"], 0),
            "vs_mandi_pct": row["vs_mandi_pct"],
            "income": round(row["income"], 0),
            "savings": round(row["savings_vs_mandi"], 0),
            "direct_sale": bool(row["direct_sale"]),
        })

    # LLM-generated insight
    best_crop = max(crop_breakdown, key=lambda x: x["avg_vs_mandi_pct"])
    prompt = f"""You are KhedutMitra AI. Write one insightful sentence for farmer {farmer_name} about their trading performance this season.

Farmer: {farmer_name}, District: {farmer_district}
Total income: ₹{total_income:,.0f}
Average price vs mandi: {avg_vs_mandi_pct:+.1f}%
Total savings from direct deals: ₹{total_savings:,.0f}
Best performing crop: {best_crop['crop'].title()} ({best_crop['avg_vs_mandi_pct']:+.1f}% vs mandi avg)
Direct sales: {direct_sales_count} of {total_transactions} transactions

Give a positive, actionable insight.

Insight:"""

    llm_insight = await granite_generate(prompt, max_new_tokens=120)

    return {
        "farmer_id": farmer_id,
        "farmer_name": farmer_name,
        "farmer_district": farmer_district,
        "summary": {
            "total_income": round(total_income, 0),
            "total_quantity_quintal": round(total_quantity, 1),
            "avg_price_realized": round(avg_price_realized, 0),
            "avg_mandi_price": round(avg_mandi_price, 0),
            "avg_vs_mandi_pct": round(avg_vs_mandi_pct, 2),
            "total_savings_vs_mandi": round(total_savings, 0),
            "direct_sales_count": direct_sales_count,
            "total_transactions": total_transactions,
            "direct_sales_pct": round((direct_sales_count / total_transactions) * 100, 1) if total_transactions > 0 else 0,
        },
        "monthly_trend": monthly_data,
        "crop_breakdown": crop_breakdown,
        "transactions": txn_details,
        "llm_insight": llm_insight,
    }
