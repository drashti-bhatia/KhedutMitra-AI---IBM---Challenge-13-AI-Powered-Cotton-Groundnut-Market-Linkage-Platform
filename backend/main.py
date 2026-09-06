"""
KhedutMitra AI — FastAPI Backend
AI-Powered Cotton & Groundnut Market Linkage Platform
Challenge 13 | IBM Granite LLM | watsonx.ai
"""
import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from agents import (
    run_price_forecast_agent,
    run_buyer_matching_agent,
    run_storage_advisor_agent,
    run_quality_grading_agent,
    run_income_dashboard_agent,
    run_orchestrator,
)

app = FastAPI(
    title="KhedutMitra AI API",
    description="AI-Powered Cotton & Groundnut Market Linkage Platform for Gujarat Farmers",
    version="1.0.0",
)

# Allow React frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request Models ────────────────────────────────────────────────────────────

class PriceForecastRequest(BaseModel):
    crop: str = "groundnut"
    mandi: str = "Rajkot"
    district: Optional[str] = None
    forecast_days: int = 7


class BuyerMatchRequest(BaseModel):
    crop: str = "groundnut"
    quantity_quintal: float = 100.0
    quality_grade: str = "FAQ"
    farmer_district: str = "Rajkot"
    min_acceptable_price: float = 5500.0
    farmer_name: Optional[str] = "Farmer"


class StorageAdvisorRequest(BaseModel):
    crop: str = "groundnut"
    mandi: str = "Rajkot"
    quantity_quintal: float = 100.0
    current_price: Optional[float] = None
    urgent_cash_need: bool = False
    storage_days_available: int = 30


class QualityGradingRequest(BaseModel):
    crop: str = "groundnut"
    moisture_pct: float = 10.0
    foreign_matter_pct: float = 2.0
    photo_description: Optional[str] = None
    quantity_quintal: Optional[float] = None
    reference_price: Optional[float] = None


class OrchestratorRequest(BaseModel):
    query: str
    language: str = "english"


# ─── Health Check ──────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "KhedutMitra AI API",
        "version": "1.0.0",
        "status": "running",
        "agents": [
            "price_forecast",
            "buyer_matching",
            "storage_advisor",
            "quality_grading",
            "income_dashboard",
            "orchestrator",
        ],
        "llm": os.getenv("GRANITE_MODEL_ID", "ibm/granite-3-8b-instruct"),
        "powered_by": "IBM Granite LLM + watsonx.ai",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "KhedutMitra AI"}


# ─── Agent Endpoints ───────────────────────────────────────────────────────────

@app.post("/api/price-forecast")
async def price_forecast(req: PriceForecastRequest):
    """
    Agent 1: Mandi Price Forecasting
    Returns 7/15/30-day price forecast with key drivers and LLM explanation.
    """
    result = await run_price_forecast_agent(
        crop=req.crop,
        mandi=req.mandi,
        district=req.district,
        forecast_days=req.forecast_days,
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.post("/api/buyer-matching")
async def buyer_matching(req: BuyerMatchRequest):
    """
    Agent 2: Buyer-Farmer Matching
    Returns top 3 ranked buyers with negotiation starters.
    """
    result = await run_buyer_matching_agent(
        crop=req.crop,
        quantity_quintal=req.quantity_quintal,
        quality_grade=req.quality_grade,
        farmer_district=req.farmer_district,
        min_acceptable_price=req.min_acceptable_price,
        farmer_name=req.farmer_name,
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.post("/api/storage-advisor")
async def storage_advisor(req: StorageAdvisorRequest):
    """
    Agent 3: Storage & Selling Timing Advisor
    Returns SELL_NOW / STORE_N_DAYS recommendation with trade-off analysis.
    """
    result = await run_storage_advisor_agent(
        crop=req.crop,
        mandi=req.mandi,
        quantity_quintal=req.quantity_quintal,
        current_price=req.current_price,
        urgent_cash_need=req.urgent_cash_need,
        storage_days_available=req.storage_days_available,
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.post("/api/quality-grading")
async def quality_grading(req: QualityGradingRequest):
    """
    Agent 4: Quality Grading Assistance
    Returns estimated grade with confidence and improvement suggestions.
    """
    result = await run_quality_grading_agent(
        crop=req.crop,
        moisture_pct=req.moisture_pct,
        foreign_matter_pct=req.foreign_matter_pct,
        photo_description=req.photo_description,
        quantity_quintal=req.quantity_quintal,
        reference_price=req.reference_price,
    )
    return result


@app.post("/api/quality-grading-photo")
async def quality_grading_photo(
    crop: str = Form("groundnut"),
    moisture_pct: float = Form(10.0),
    foreign_matter_pct: float = Form(2.0),
    quantity_quintal: Optional[float] = Form(None),
    reference_price: Optional[float] = Form(None),
    photo: Optional[UploadFile] = File(None),
):
    """
    Agent 4 (with photo upload): Quality Grading with image.
    """
    has_photo = photo is not None
    photo_description = None
    if has_photo:
        photo_description = f"Uploaded photo: {photo.filename}"

    result = await run_quality_grading_agent(
        crop=crop,
        moisture_pct=moisture_pct,
        foreign_matter_pct=foreign_matter_pct,
        has_photo=has_photo,
        photo_description=photo_description,
        quantity_quintal=quantity_quintal,
        reference_price=reference_price,
    )
    return result


@app.get("/api/income-dashboard/{farmer_id}")
async def income_dashboard(farmer_id: str):
    """
    Agent 5: Farmer Income Dashboard
    Returns aggregated income, vs-mandi comparison, and LLM insight.
    """
    result = await run_income_dashboard_agent(farmer_id=farmer_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.post("/api/orchestrator")
async def orchestrator(req: OrchestratorRequest):
    """
    Orchestrator Agent: routes query to correct specialist agents.
    """
    result = await run_orchestrator(query=req.query, language=req.language)
    return result


# ─── Reference Data Endpoints ──────────────────────────────────────────────────

@app.get("/api/mandis")
async def get_mandis():
    """List available mandis in the system."""
    import pandas as pd
    df = pd.read_csv("data/mandi_prices.csv")
    mandis = df[["mandi", "district", "crop"]].drop_duplicates().to_dict("records")
    return {"mandis": mandis}


@app.get("/api/farmers")
async def get_farmers():
    """List available farmers (for demo)."""
    import pandas as pd
    df = pd.read_csv("data/farmers.csv")
    farmers = df.to_dict("records")
    return {"farmers": farmers}


@app.get("/api/buyers")
async def get_buyers():
    """List registered buyers."""
    import pandas as pd
    df = pd.read_csv("data/buyers.csv")
    buyers = df.to_dict("records")
    return {"buyers": buyers}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
