# ⚡ ElectriCast — Delhi Electricity Demand Forecasting

A full-stack web app for short-term electricity demand prediction across Delhi's distribution zones.  
Built with Flask + React (Vite + Tailwind). Final Year Project.

---

## 📁 Project Structure

```
electricity-demand/
├── backend/
│   ├── app.py               # Flask API
│   ├── requirements.txt
│   └── models/              # <-- Place your trained .pkl files here
│       ├── DELHI_xgboost.pkl
│       ├── DELHI_lightgbm.pkl
│       ├── DELHI_catboost.pkl
│       ├── DELHI_weights.pkl
│       ├── ... (all 6 regions × 4 files = 24 files)
│       └── metadata.pkl
└── frontend/
    ├── src/
    │   ├── pages/           # Home, Prediction, About
    │   ├── components/      # Navbar
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Setup & Run

### 1. Backend (Flask)

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy your trained models
# Place all .pkl files into backend/models/

# Run
python app.py
# → Runs on http://localhost:5000
```

> **Without models**: The app runs in "mock mode" — predictions are generated using a simple heuristic based on typical Delhi demand patterns.

### 2. Frontend (React + Vite)

```bash
cd frontend

npm install
npm run dev
# → Runs on http://localhost:5173
```

The Vite dev server proxies `/api/*` → `http://localhost:5000`.

---

## 🔌 API Endpoints

### `POST /api/predict`
```json
Request:  { "date": "2025-06-15", "region": "DELHI" }
Response: {
  "date": "2025-06-15",
  "region": "DELHI",
  "hours": [0, 1, ..., 23],
  "predictions": [3200.5, 3100.2, ...],
  "weather": [{ "temp": 28.1, "humidity": 65, ... }, ...],
  "summary": {
    "peak_demand_mw": 4500.3,
    "peak_hour": 14,
    "avg_demand_mw": 3800.1,
    "total_demand_mwh": 91202.4
  }
}
```

### `GET /api/regions` — List all regions  
### `GET /api/health` — Backend health check

---

## 🌍 Weather API
- **Past dates** → `archive-api.open-meteo.com`  
- **Future dates** → `api.open-meteo.com`  
- Location: Delhi (28.6139°N, 77.2090°E), Timezone: Asia/Kolkata

---

## 🧠 Models
- XGBoost, LightGBM, CatBoost — trained separately per region
- Ensemble via inverse-MAE weighting on validation set
- Train: Jan 2022 – Dec 2025 | Test: Jan–Apr 2026

---

## 📦 Model Files Needed (from your notebook)

Place these in `backend/models/`:
```
DELHI_xgboost.pkl    BRPL_xgboost.pkl    BYPL_xgboost.pkl
DELHI_lightgbm.pkl   BRPL_lightgbm.pkl   BYPL_lightgbm.pkl
DELHI_catboost.pkl   BRPL_catboost.pkl   BYPL_catboost.pkl
DELHI_weights.pkl    BRPL_weights.pkl    BYPL_weights.pkl
NDPL_xgboost.pkl     NDMC_xgboost.pkl    MES_xgboost.pkl
NDPL_lightgbm.pkl    NDMC_lightgbm.pkl   MES_lightgbm.pkl
NDPL_catboost.pkl    NDMC_catboost.pkl   MES_catboost.pkl
NDPL_weights.pkl     NDMC_weights.pkl    MES_weights.pkl
metadata.pkl
```
