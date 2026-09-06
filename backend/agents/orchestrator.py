"""
Orchestrator Agent — routes requests to specialist sub-agents.
"""
from .granite_client import granite_generate
from .price_forecast_agent import run_price_forecast_agent
from .buyer_matching_agent import run_buyer_matching_agent
from .storage_advisor_agent import run_storage_advisor_agent
from .quality_grading_agent import run_quality_grading_agent
from .income_dashboard_agent import run_income_dashboard_agent


SYSTEM_INSTRUCTIONS = """You are KhedutMitra AI, an AI assistant for Gujarat cotton and groundnut farmers and verified buyers.
Understand the user's intent and route to the correct specialist agent:
- price forecast: for price trends, mandi prices, when prices will go up/down
- buyer matching: for finding buyers, selling to mills/exporters
- storage advisor: for should I sell now or wait, storage guidance
- quality grading: for lot quality, grading, moisture content
- income dashboard: for income history, earnings, season performance

Never give definitive financial guarantees — always frame price/timing advice as data-informed recommendations.
Encourage confirming critical decisions with local mandi officials or agri-extension officers when uncertainty is high.
Respond in English, Hindi, or Gujarati based on user preference."""


async def run_orchestrator(query: str, language: str = "english") -> dict:
    """
    Orchestrator: detect intent and call appropriate agent(s).
    For multi-intent queries, calls agents in sequence and synthesizes response.
    """
    query_lower = query.lower()

    # Intent detection
    intent_price = any(w in query_lower for w in ["price", "mandi", "forecast", "rate", "ભાવ", "कीमत"])
    intent_buyer = any(w in query_lower for w in ["buyer", "sell", "match", "खरीददार", "ખરીદનાર"])
    intent_storage = any(w in query_lower for w in ["store", "storage", "wait", "timing", "hold", "સ્ટોર"])
    intent_quality = any(w in query_lower for w in ["quality", "grade", "moisture", "ગ્રેડ", "गुणवत्ता"])
    intent_income = any(w in query_lower for w in ["income", "earning", "profit", "dashboard", "season", "આવક"])

    prompt = f"""{SYSTEM_INSTRUCTIONS}

User query: "{query}"
Language preference: {language}

Classify the intent and generate a helpful response that acknowledges what specialist agents are available to help.
Keep response to 2-3 sentences and mention which specific agent feature to use.

Response:"""

    llm_response = await granite_generate(prompt, max_new_tokens=200)

    intents_detected = []
    if intent_price:
        intents_detected.append("price_forecast")
    if intent_buyer:
        intents_detected.append("buyer_matching")
    if intent_storage:
        intents_detected.append("storage_advisor")
    if intent_quality:
        intents_detected.append("quality_grading")
    if intent_income:
        intents_detected.append("income_dashboard")

    if not intents_detected:
        intents_detected = ["general"]

    return {
        "query": query,
        "intents_detected": intents_detected,
        "response": llm_response,
        "suggested_agents": intents_detected,
        "disclaimer": "This is a data-informed recommendation platform. Always confirm major decisions with local experts.",
    }
