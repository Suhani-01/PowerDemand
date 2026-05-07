# ⚡ Delhi Electricity Demand Prediction System

A machine learning-powered web application that predicts electricity demand for Delhi and its surrounding regions. Built with a React frontend and Flask backend, leveraging ensemble models trained on historical demand and weather data.
 

---

## 🔗 Live Demo

👉 [https://power-demand-fi6iq210t-suhani-01s-projects.vercel.app/](https://power-demand-fi6iq210t-suhani-01s-projects.vercel.app/)

---

## 📁 Project Structure

├── electricity-demand/
│   ├── frontend/                                  # React frontend application
│   └── backend/                                   # Flask backend API server
│
├── DataSet_Training/                              # Data collection, preprocessing, training & analysis
│   ├── Training-80-20-Final.ipynb                 # Train/test split training and model evaluation
│   ├── FullDataTrainingFinal.ipynb                # Final training on complete dataset
│   ├── WEATHER DATA FETCH AND CONVERSION.ipynb    # Fetch and preprocess weather data
│   ├── SLDC DATA FETCH.ipynb                      # Fetch Delhi electricity demand data
│   ├── Delhi_Weather_5M.csv                       # Processed weather dataset
│   ├── delhi_sldc_5min_2022_2026.csv              # Electricity demand dataset
│   └── ...
│
└── .python-version                                # Python 3.11 (CatBoost compatibility)


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

bash
cd electricity-demand/backend
pip install -r requirements.txt
python app.py


### Frontend Setup

bash
cd electricity-demand/frontend
npm install
npm run dev


The frontend will start on http://localhost:5173

# Thank You
