# KhedutMitra AI — AI-Powered Cotton & Groundnut Market Linkage Platform
### Challenge 13 | IBM Hackathon 2024 | IBM Granite LLM + watsonx.ai

---

## 🌾 Overview

**KhedutMitra AI** is a multi-agent Agentic AI platform that empowers Gujarat cotton and groundnut farmers with:

- **Real-time mandi price intelligence** (AI forecasting)
- **Direct buyer-farmer connections** (skip the middleman)
- **Smart storage/selling timing advice** (maximize income)
- **Quality grading assistance** (standardized lot listings)
- **Income dashboard** (season-over-season tracking)

**Tech Stack:** IBM Granite LLM (`ibm/granite-3-8b-instruct`) | watsonx.ai | IBM Bob | FastAPI | React.js

---

## 🚀 Quick Start (Windows)

### Step 1 — Install Dependencies (first time only)
```
Double-click: INSTALL.bat
```

### Step 2 — Start the Application
```
Double-click: START_APP.bat
```
Opens automatically at **http://localhost:3000**

### Step 3 — Create Public URL (optional)
```
Double-click: CREATE_PUBLIC_URL.bat
```

### Stop the Application
```
Double-click: STOP_APP.bat
```

---

## 📁 Project Structure

```
kisaanconnect/
├── INSTALL.bat              ← Install all dependencies (run once)
├── START_APP.bat            ← Start frontend + backend
├── STOP_APP.bat             ← Stop all servers
├── CREATE_PUBLIC_URL.bat    ← Create ngrok public URL
│
├── backend/
│   ├── main.py              ← FastAPI application
│   ├── requirements.txt     ← Python dependencies
│   ├── .env                 ← Credentials (WATSONX_API_KEY, etc.)
│   ├── agents/
│   │   ├── granite_client.py          ← IBM Granite LLM client
│   │   ├── price_forecast_agent.py    ← Agent 1: Price Forecasting
│   │   ├── buyer_matching_agent.py    ← Agent 2: Buyer Matching
│   │   ├── storage_advisor_agent.py   ← Agent 3: Storage Advisor
│   │   ├── quality_grading_agent.py   ← Agent 4: Quality Grading
│   │   ├── income_dashboard_agent.py  ← Agent 5: Income Dashboard
│   │   └── orchestrator.py            ← Orchestrator Agent
│   └── data/
│       ├── mandi_prices.csv  ← Historical mandi price data (SAMPLE/DEMO)
│       ├── buyers.csv        ← Verified buyer registry
│       ├── farmers.csv       ← Farmer profiles
│       └── transactions.csv  ← Past transaction history
│
├── frontend/
│   ├── src/
│   │   ├── App.js            ← Main app with navigation
│   │   ├── pages/
│   │   │   ├── Home.js            ← Landing page
│   │   │   ├── PriceForecast.js   ← Price forecast UI
│   │   │   ├── BuyerMatching.js   ← Buyer matching UI
│   │   │   ├── StorageAdvisor.js  ← Storage advice UI
│   │   │   ├── QualityGrading.js  ← Quality grading UI
│   │   │   ├── IncomeDashboard.js ← Income dashboard UI
│   │   │   └── OrchestratorChat.js ← AI chat interface
│   │   └── services/api.js    ← Backend API calls
│   └── package.json
│
└── docs/                     ← Documentation package
```

---

## 🤖 AI Agents

| Agent | Purpose | LLM Role |
|-------|---------|----------|
| Price Forecasting | 7/15/30-day mandi price forecast | Explains forecast + key drivers |
| Buyer Matching | Ranks verified buyers by price/distance/reliability | Generates negotiation starters |
| Storage Advisor | Sell-now vs. store-N-days recommendation | Explains cost/gain trade-off |
| Quality Grading | Estimates lot grade (FAQ/A/B/C) | Explains grade + improvement tips |
| Income Dashboard | Season income vs. mandi average | Generates proactive insight |
| Orchestrator | Routes multi-intent queries | Routes to correct specialist agents |

---

## 🔐 Credentials Setup

Credentials are in `backend/.env`:
```
WATSONX_API_KEY= <your api key>
WATSONX_URL=<your-url>
WATSONX_PROJECT_ID=<your-project-id>
GRANITE_MODEL_ID=ibm/granite-3-8b-instruct
PORT=8000
```

> **Note:** Add your `WATSONX_PROJECT_ID` to enable live IBM Granite LLM responses.
> Without it, the system uses intelligent mock responses for demo purposes.

---

## 📡 API Endpoints

| Method | Endpoint | Agent |
|--------|---------|-------|
| POST | `/api/price-forecast` | Price Forecasting |
| POST | `/api/buyer-matching` | Buyer Matching |
| POST | `/api/storage-advisor` | Storage Advisor |
| POST | `/api/quality-grading` | Quality Grading |
| GET  | `/api/income-dashboard/{farmer_id}` | Income Dashboard |
| POST | `/api/orchestrator` | Orchestrator Chat |
| GET  | `/api/mandis` | List mandis |
| GET  | `/api/farmers` | List farmers |
| GET  | `/api/buyers` | List buyers |
| GET  | `/docs` | Interactive API docs (Swagger) |

---

## ⚠️ Important Disclaimer

Price forecasts and recommendations are **AI-generated data-informed guidance**, not financial guarantees.
Always confirm critical selling decisions with local mandi officials or agri-extension officers.
Sample/demo data is used — not a substitute for live Agmarknet/eNAM data in production.

---

## 🏆 Challenge 13 — IBM Hackathon Submission

- **Domain:** Economic Development / AgriTech
- **Technologies:** IBM Granite LLM, watsonx.ai, IBM Bob, IBM Cloud
- **Target Users:** Gujarat smallholder farmers, verified buyers, FPOs
- **Impact:** 15-30% price uplift by eliminating middlemen, real-time market intelligence
