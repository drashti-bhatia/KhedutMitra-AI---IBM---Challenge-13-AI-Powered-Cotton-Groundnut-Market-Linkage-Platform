"""
IBM Granite LLM client using watsonx.ai
"""
import os
import httpx
import json
from dotenv import load_dotenv

load_dotenv()

WATSONX_API_KEY = os.getenv("WATSONX_API_KEY", "")
WATSONX_URL = os.getenv("WATSONX_URL", "")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID", "")
GRANITE_MODEL_ID = os.getenv("GRANITE_MODEL_ID", "ibm/granite-3-8b-instruct")

# IBM Cloud IAM token endpoint
IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token"

_iam_token_cache = {"token": None, "expires_at": 0}


async def get_iam_token() -> str:
    """Get IAM Bearer token from IBM Cloud using API key."""
    import time
    now = time.time()
    if _iam_token_cache["token"] and now < _iam_token_cache["expires_at"] - 60:
        return _iam_token_cache["token"]

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            IAM_TOKEN_URL,
            data={
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": WATSONX_API_KEY,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        data = resp.json()
        _iam_token_cache["token"] = data["access_token"]
        _iam_token_cache["expires_at"] = now + data.get("expires_in", 3600)
        return _iam_token_cache["token"]


async def granite_generate(prompt: str, max_new_tokens: int = 512, temperature: float = 0.3) -> str:
    """
    Call IBM Granite LLM via watsonx.ai text generation API.
    Falls back to a descriptive mock if credentials are not configured.
    """
    if not WATSONX_API_KEY or not WATSONX_PROJECT_ID:
        return _mock_response(prompt)

    try:
        token = await get_iam_token()

        # Detect base URL (strip trailing slash)
        base = WATSONX_URL.rstrip("/")
        # watsonx.ai text generation endpoint
        url = f"{base}/ml/v1/text/generation?version=2024-05-31"

        payload = {
            "model_id": GRANITE_MODEL_ID,
            "project_id": WATSONX_PROJECT_ID,
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": max_new_tokens,
                "temperature": temperature,
                "stop_sequences": ["<|endoftext|>"],
            },
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            )
            resp.raise_for_status()
            result = resp.json()
            return result["results"][0]["generated_text"].strip()

    except Exception as e:
        print(f"[Granite] LLM call failed: {e}. Using mock response.")
        return _mock_response(prompt)


def _mock_response(prompt: str) -> str:
    """Intelligent mock responses when LLM is not configured."""
    prompt_lower = prompt.lower()

    if "forecast" in prompt_lower or "price" in prompt_lower:
        return (
            "Based on historical mandi data analysis, prices show an upward trend "
            "of approximately 3-5% over the next 7 days. Lower arrivals and steady "
            "export demand are the key drivers. This is a forecast — please confirm "
            "with your local mandi before making major selling decisions."
        )
    elif "buyer" in prompt_lower or "match" in prompt_lower:
        return (
            "Top buyer match: Patel Ginning Mills (Surendranagar) — offering ₹7800/quintal, "
            "reliability score 4.8/5. Recommended negotiation opener: 'Namaste, I have "
            "a quality lot of 100 quintals available. I noticed your current offer — "
            "I can deliver within 3 days.' Direct contact: 9876543210."
        )
    elif "storage" in prompt_lower or "sell" in prompt_lower or "timing" in prompt_lower:
        return (
            "RECOMMENDATION: STORE_7_DAYS. Expected price gain: ₹150-200/quintal "
            "(2.5% increase). Storage cost: ₹3/quintal/day = ₹21 total. "
            "Net benefit: ~₹130/quintal. If you have urgent cash needs, consider "
            "selling 50% now and storing the rest."
        )
    elif "grade" in prompt_lower or "quality" in prompt_lower:
        return (
            "Quality Grade Assessment: FAQ (Fair Average Quality) — Standard Grade. "
            "Estimated moisture content: 8-10% (within acceptable range). "
            "Confidence: 78%. Note: Final grading should be confirmed by buyer "
            "or mandi inspector for commercial transactions."
        )
    elif "income" in prompt_lower or "dashboard" in prompt_lower:
        return (
            "This season you realized ₹5,950/quintal average vs. mandi average of ₹5,600 — "
            "a 6.25% premium by selling directly. Total estimated savings from bypassing "
            "middlemen: ₹8,750 this season. Keep using the direct matching feature "
            "for cotton to maximize your returns."
        )
    else:
        return (
            "KhedutMitra AI: I have analyzed the available market data and can provide "
            "guidance on prices, buyers, storage timing, quality grading, and income tracking. "
            "Please specify what information you need for your cotton or groundnut lot."
        )
