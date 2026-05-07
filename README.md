# ⚡ Delhi Electricity Demand Prediction System

A machine learning-powered web application that predicts electricity demand for Delhi and its surrounding regions. Built with a React frontend and Flask backend, leveraging ensemble models trained on historical demand and weather data.
 

---

## 🔗 Live Demo

👉 [https://power-demand-fi6iq210t-suhani-01s-projects.vercel.app/](https://power-demand-fi6iq210t-suhani-01s-projects.vercel.app/)

---

## 📁 Project Structure

```
├── electricity-demand/
│   ├── frontend/                                  # React frontend application
│   └── backend/                                   # Flask backend API server
│
├── DataSet_Training/                              # Data collection, preprocessing, training & analysis
│   ├── Training-80-20-Final.ipynb                 # Model training using 80-20 train-test split
│   ├── FullDataTrainingFinal.ipynb                # Final model training on complete dataset
│   ├── WEATHER DATA FETCH AND CONVERSION.ipynb    # Weather data fetching and preprocessing scripts
│   ├── SLDC DATA FETCH.ipynb                      # Delhi electricity demand data fetching scripts
│   ├── Delhi_Weather_5M.csv                       # Processed weather dataset
│   ├── delhi_sldc_5min_2022_2026.csv              # Electricity demand dataset
│   └── ...
│
└── .python-version                                # Python 3.11 (required for CatBoost compatibility)
```

---

## 🧠 Models Used

The prediction system uses an *ensemble approach* combining multiple models with pre-calculated weights for improved accuracy.

| Details |
|---------|
| XGBoos |
| LightGBM |
| CatBoos |
| Ensemble is used with evaluated weight of each model |

> For specific model details and ensemble weights, visit the [live demo](https://power-demand-fi6iq210t-suhani-01s-projects.vercel.app/).

---

## 📊 Data Sources

| Data Type | Source |
|-----------|--------|
| Electricity Demand |Delhi SLDC Official Website| 
| Weather Data | [open-meteo.com](https://open-meteo.com) |

---

## 🛠️ Tech Stack

### Frontend
- *React* — component-based UI
- *Vercel* — deployment & hosting

### Backend
- *Python Flask* — server with API 

### ML
- *CatBoost*  
- *XGBoost*  
- *LightGBM*  

---

## 🚀 Getting Started


### Backend Setup

```
cd electricity-demand/backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```
cd electricity-demand/frontend
npm install
npm run dev
```

The frontend will start on http://localhost:5173

---
# Thank You
