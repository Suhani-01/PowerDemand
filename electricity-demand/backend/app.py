from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import requests
from datetime import datetime, date
import joblib
import os
import time 

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
HISTORICAL_URL = "https://historical-forecast-api.open-meteo.com/v1/forecast"

# All supported Delhi power distribution regions
REGIONS = ['DELHI', 'BRPL', 'BYPL', 'NDPL', 'NDMC', 'MES']

# Public holidays in Delhi — used to mark holiday hours as a feature
DELHI_HOLIDAYS = set([
    '2022-01-26','2022-03-01','2022-03-18','2022-04-10','2022-04-14',
    '2022-04-15','2022-05-03','2022-05-16','2022-07-10','2022-08-09',
    '2022-08-15','2022-08-19','2022-10-02','2022-10-05','2022-10-09',
    '2022-10-24','2022-10-25','2022-10-26','2022-11-08','2022-12-25',
    '2023-01-26','2023-02-18','2023-03-08','2023-03-30','2023-04-07',
    '2023-04-14','2023-04-21','2023-04-22','2023-05-05','2023-06-29',
    '2023-07-29','2023-08-15','2023-09-06','2023-09-07','2023-09-19',
    '2023-10-02','2023-10-24','2023-11-13','2023-11-14','2023-11-15',
    '2023-11-27','2023-12-25',
    '2024-01-22','2024-01-26','2024-03-08','2024-03-25','2024-03-29',
    '2024-04-09','2024-04-11','2024-04-14','2024-04-17','2024-05-23',
    '2024-06-17','2024-07-17','2024-08-15','2024-08-26','2024-09-16',
    '2024-10-02','2024-10-12','2024-10-13','2024-11-01','2024-11-02',
    '2024-11-03','2024-11-15','2024-12-25',
    '2025-01-26','2025-02-26','2025-03-14','2025-03-31','2025-04-06',
    '2025-04-10','2025-04-14','2025-05-12','2025-06-07','2025-07-06',
    '2025-08-15','2025-08-16','2025-09-05','2025-10-02','2025-10-20',
    '2025-10-21','2025-11-05','2025-12-25',
    # 2026 - already in original set (Jan–Apr)
    '2026-01-26',  # Republic Day
    '2026-02-15',  # Maha Shivaratri
    '2026-03-04',  # Holi
    '2026-03-20',  # Id-ul-Fitr (Eid) - tentative, moon-sighting dependent
    '2026-03-22',  # (already in set)
    '2026-03-26',  # Ram Navami
    '2026-03-27',  # (already in set)
    '2026-03-29',  # (already in set)
    '2026-03-31',  # Mahavir Jayanti
    '2026-04-03',  # Good Friday
    '2026-04-14',  # Dr. Ambedkar Jayanti
    # 2026 - newly added (May onwards)
    '2026-05-01',  # Buddha Purnima
    '2026-05-27',  # Id-Uz-Zuha / Bakrid - tentative
    '2026-06-25',  # Muharram / Ashura - tentative
    '2026-08-15',  # Independence Day
    '2026-08-26',  # Maulud Nabi / Milad-un-Nabi - tentative
    '2026-09-04',  # Janmashtami
    '2026-10-02',  # Gandhi Jayanti
    '2026-10-21',  # Dussehra (approx)
    '2026-11-09',  # Diwali (approx)
    '2026-11-10',  # Diwali (approx)
    '2026-11-11',  # Govardhan Puja (approx)
    '2026-11-30',  # Guru Nanak Jayanti (approx)
    '2026-12-25',  # Christmas
])

# Exact feature order that the ML models were trained on — do not change
FEATURES = [
    'hour', 'day_of_week', 'month', 'year', 'day_of_year', 'week_of_year', 'year_norm',
    'hour_sin', 'hour_cos', 'month_sin', 'month_cos', 'dow_sin', 'dow_cos',
    'is_morning_peak', 'is_evening_peak',
    'is_weekend', 'is_holiday', 'is_monsoon', 'is_summer', 'is_winter',
    'Temperature (°C)', 'Relative Humidity (%)', 'feels_like',
    'Precipitation (mm)', 'Wind Speed (m/s)', 'Cloud Cover Total (%)'
]

 

# ─── In-memory weather cache: { date_str: (timestamp, weather_by_hour) } ───
_weather_cache = {}
CACHE_TTL = 1800  # 30 minutes — re-fetch if stale for cache

# Load models
models = {}
weights = {}
# ── Load models ──────────────────────────────────────────────────────────────
models_dir = os.path.join(os.path.dirname(__file__), 'models')  

def load_models():
    global models, weights
    if not os.path.exists(models_dir):
        print("⚠️  No models directory found — using mock predictions")
        return

    # Load ensemble weights from single file  ← changed
    try:
        all_weights = joblib.load(f'{models_dir}/ensemble_weights.pkl')
    except Exception as e:
        print(f"⚠️  Could not load ensemble_weights.pkl: {e}")
        all_weights = {}

    for region in REGIONS:
        try:
            models[region] = {
                'xgb': joblib.load(f'{models_dir}/{region}_xgb.pkl'),  # ← changed
                'lgb': joblib.load(f'{models_dir}/{region}_lgb.pkl'),  # ← changed
                'cat': joblib.load(f'{models_dir}/{region}_cat.pkl'),  # ← changed
            }
            weights[region] = all_weights.get(region, {'xgb': 1/3, 'lgb': 1/3, 'cat': 1/3})  # ← changed
            print(f"✅ Loaded models for {region}")
        except Exception as e:
            print(f"⚠️  Could not load {region}: {e}")

load_models()


# ─── Helpers ────────────────────────────────────────────────────────────────

def get_season(month):
    # Returns season name based on month 
    if month in [4, 5, 6]:        
        return 'Summer'
    elif month in [7, 8, 9]:      
        return 'Monsoon'
    elif month in [10,11,12,1,2]: 
        return 'Winter'
    else:                          
        return 'Spring'


def is_morning_peak(hour, season):
    # Peak window shifts based on season (winters peak earlier, summers peak later)
    if season == 'Winter':              
        return int(9  <= hour <= 11)
    elif season in ['Summer','Monsoon']:
        return int(11 <= hour <= 13)
    else:                               
        return int(10 <= hour <= 12)


def is_evening_peak(hour, season): 
    if season == 'Winter':              
        return int(17 <= hour <= 19)
    elif season in ['Summer','Monsoon']:
        return int(20 <= hour <= 23)
    else:                               
        return int(18 <= hour <= 21)


def build_features(dt, weather_row):
    # Build the full feature vector for one datetime + weather combination
    hour     = dt.hour
    dow      = dt.weekday()
    month    = dt.month
    year     = dt.year
    doy      = dt.timetuple().tm_yday
    woy      = dt.isocalendar()[1]
    date_str = dt.strftime('%Y-%m-%d')
    season   = get_season(month)

    feat = {
        # Raw time fields
        'hour': hour,
        'day_of_week': dow,
        'month': month,
        'year': year,
        'day_of_year': doy,
        'week_of_year': woy,
        'year_norm': (year - 2022) / 5,  # Normalize year so model sees a small number

        # Cyclic encoding — sin/cos so model knows hour 23 and hour 0 are close
        'hour_sin':  np.sin(2 * np.pi * hour  / 24),
        'hour_cos':  np.cos(2 * np.pi * hour  / 24),
        'month_sin': np.sin(2 * np.pi * month / 12),
        'month_cos': np.cos(2 * np.pi * month / 12),
        'dow_sin':   np.sin(2 * np.pi * dow   / 7),
        'dow_cos':   np.cos(2 * np.pi * dow   / 7),

        # Demand pattern flags
        'is_morning_peak': is_morning_peak(hour, season),
        'is_evening_peak': is_evening_peak(hour, season),
        'is_weekend': int(dow >= 5),
        'is_holiday': int(date_str in DELHI_HOLIDAYS),
        'is_monsoon': int(month in [7, 8, 9]),
        'is_summer':  int(month in [4, 5, 6]),
        'is_winter':  int(month in [10, 11, 12, 1, 2]),

        # Weather inputs from Open-Meteo
        'Temperature (°C)': weather_row['temperature_2m'],
        'Relative Humidity (%)': weather_row['relative_humidity_2m'],
        'feels_like': weather_row['apparent_temperature'],
        'Precipitation (mm)': weather_row['precipitation'],
        'Wind Speed (m/s)': weather_row['wind_speed_10m'],
        'Cloud Cover Total (%)': weather_row['cloud_cover'],
    }
    return [feat[f] for f in FEATURES]  # Return a list (converting dict to list) in exact order model expects


# ─── Weather fetch with caching + retry ─────────────────────────────────────


def fetch_weather(target_date_str: str) -> dict:
    """
    Weather fetching strategy:

    1. If target date is today/future:
       → use forecast API

    2. If forecast API fails:
       → use historical API with SAME DATE LAST YEAR

    3. If target date is already past:
       → directly use historical API

    No CSV fallback.
    No default weather.
    """

    now = time.time()

    # Return cached result if still fresh (within 30 min)
    if target_date_str in _weather_cache:
        cached_at, cached_data = _weather_cache[target_date_str]

        if now - cached_at < CACHE_TTL:
            print(f"[weather] cache hit for {target_date_str}")
            return cached_data

    target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
    today = date.today()

    # Variables we need from the weather API
    keys = [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'wind_speed_10m',
        'cloud_cover'
    ]

    def process_weather_response(data):
        # Parse API response into { hour: { variable: value } }
        hourly = data.get('hourly', {})
        times = hourly.get('time', [])

        if not times:
            raise ValueError("No hourly weather data")

        weather_by_hour = {}

        for i, t in enumerate(times):
            hr = int(t.split('T')[1].split(':')[0])

            weather_by_hour[hr] = {
                k: hourly[k][i]
                for k in keys
            }

        return weather_by_hour

    # ─────────────────────────────────────────────
    # CASE 1 → PAST DATE
    # ─────────────────────────────────────────────

    if target_date < today:

        print(f"[weather] using historical API for past date")

        params = {
            'latitude': 28.6139,
            'longitude': 77.2090,
            'hourly':
                'temperature_2m,relative_humidity_2m,'
                'apparent_temperature,precipitation,'
                'wind_speed_10m,cloud_cover',
            'timezone': 'Asia/Kolkata',
            'start_date': target_date_str,
            'end_date': target_date_str,
        }

        resp = requests.get(HISTORICAL_URL, params=params, timeout=20)
        resp.raise_for_status()

        weather_by_hour = process_weather_response(resp.json())

        _weather_cache[target_date_str] = (now, weather_by_hour)

        return weather_by_hour

    # ─────────────────────────────────────────────
    # CASE 2 → TODAY/FUTURE DATE
    # TRY FORECAST API
    # ─────────────────────────────────────────────

    forecast_params = {
        'latitude': 28.6139,
        'longitude': 77.2090,
        'hourly':
            'temperature_2m,relative_humidity_2m,'
            'apparent_temperature,precipitation,'
            'wind_speed_10m,cloud_cover',
        'timezone': 'Asia/Kolkata',
        'start_date': target_date_str,
        'end_date': target_date_str,
    }

    try:

        print(f"[weather] trying forecast API")

        resp = requests.get(
            FORECAST_URL,
            params=forecast_params,
            timeout=20
        )

        resp.raise_for_status()

        weather_by_hour = process_weather_response(resp.json())

        _weather_cache[target_date_str] = (now, weather_by_hour)

        return weather_by_hour

    except Exception as e:

        print(f"[weather] forecast failed: {e}")

        # ─────────────────────────────────────────
        # FALLBACK → SAME DATE LAST YEAR
        # ─────────────────────────────────────────

        target_dt = datetime.strptime(target_date_str, '%Y-%m-%d')

        last_year_date = target_dt.replace(year=target_dt.year - 1)

        last_year_str = last_year_date.strftime('%Y-%m-%d')

        print(f"[weather] using historical fallback: {last_year_str}")

        historical_params = {
            'latitude': 28.6139,
            'longitude': 77.2090,
            'hourly':
                'temperature_2m,relative_humidity_2m,'
                'apparent_temperature,precipitation,'
                'wind_speed_10m,cloud_cover',
            'timezone': 'Asia/Kolkata',
            'start_date': last_year_str,
            'end_date': last_year_str,
        }

        hist_resp = requests.get(
            HISTORICAL_URL,
            params=historical_params,
            timeout=20
        )

        hist_resp.raise_for_status()

        weather_by_hour = process_weather_response(hist_resp.json())

        _weather_cache[target_date_str] = (now, weather_by_hour)

        return weather_by_hour
    

# ─── Prediction logic ────────────────────────────────────────────────────────

def _run_model(region, feat_arr, wx, hour):
    """Run ensemble or mock prediction for one region/hour."""
    if region in models:
        # Weighted average of all three model predictions
        w = weights[region]
        p_xgb = models[region]['xgb'].predict(feat_arr)[0]
        p_lgb = models[region]['lgb'].predict(feat_arr)[0]
        p_cat = models[region]['cat'].predict(feat_arr)[0]
        return float(w['xgb'] * p_xgb + w['lgb'] * p_lgb + w['cat'] * p_cat)
    else:
        # No model loaded — return a simple mock based on temp and time of day
        base = {'DELHI':3500,'BRPL':900,'BYPL':700,'NDPL':1100,'NDMC':400,'MES':300}
        b    = base.get(region, 1000)
        temp = wx['temperature_2m']
        temp_factor = 1 + max(0, (temp - 25) * 0.02)  # Higher temp = higher load
        hour_factor = 0.7 + 0.3 * np.sin(np.pi * (hour - 6) / 12) if 6 <= hour <= 22 else 0.65
        return float(b * hour_factor * temp_factor + np.random.normal(0, 50))


def predict_for_date(target_date_str: str, region: str,
                     shared_weather: dict = None):
    # Use provided weather if available, otherwise fetch it
    weather_by_hour = shared_weather or fetch_weather(target_date_str)

    target_dt = datetime.strptime(target_date_str, '%Y-%m-%d')

    hourly_preds = []
    hourly_weather = []

    for hour in range(24):
        dt = target_dt.replace(hour=hour)
        wx = weather_by_hour[hour]
        fv = build_features(dt, wx)

        # 🔥 if model fails or weak confidence → fallback blend
        pred = _run_model(region, np.array([fv]), wx, hour)

        hourly_preds.append(round(pred, 1))

        # Collect cleaned weather data for this hour
        hourly_weather.append({
            'temp': round(wx['temperature_2m'], 1),
            'humidity': round(wx['relative_humidity_2m'], 1),
            'feels_like': round(wx['apparent_temperature'], 1),
            'precipitation': round(wx['precipitation'], 2),
            'wind_speed': round(wx['wind_speed_10m'], 1),
            'cloud_cover': round(wx['cloud_cover'], 1),
        })

    return hourly_preds, hourly_weather

def build_summary(hourly_preds):
    # Compute peak, least, average demand from the 24-hour predictions
    peak_demand = round(max(hourly_preds), 1)
    least_demand=round(min(hourly_preds),1);

    return {
        'total_demand_mwh': round(sum(hourly_preds), 1),
        'peak_demand_mw':   peak_demand,
        'peak_hour':        hourly_preds.index(peak_demand),
        'least_hour':hourly_preds.index(least_demand),
        'avg_demand_mw':    round(sum(hourly_preds) / 24, 1),
        'least_demand_mw':    least_demand,
    }


@app.route('/api/predict-multi', methods=['POST'])
def predict_multi():
    """
    Multi-region prediction — fetches weather ONCE, reuses for all regions.
    Body: { "date": "2025-06-15", "regions": ["DELHI","BYPL","BRPL"] }
    """
    try:
        body    = request.get_json()
        target_date  = body.get('date')
        req_regions  = body.get('regions')

        if not target_date:
            return jsonify({'error': 'date is required'}), 400

        # Reject unknown region names before doing any work
        invalid = [r for r in req_regions if r.upper() not in REGIONS]
        if invalid:
            return jsonify({'error': f'Unknown regions: {invalid}'}), 400

        # Fetch weather ONCE for all regions
        shared_weather = fetch_weather(target_date)

        results = {}
        weather_summary=[]
        for region in req_regions:
            region = region.upper()
            hourly_preds,weather_summary = predict_for_date(
                target_date, region, shared_weather=shared_weather
            )
            results[region] = {
                'date':        target_date,
                'region':      region,
                'hours':       list(range(24)),
                'predictions': hourly_preds,
                'summary':     build_summary(hourly_preds),
            }


        return jsonify({
            'date':    target_date,
            'regions': list(results.keys()),
            'results': results,
            'weather':shared_weather,
            'weather_summary':weather_summary,
        })

    except Exception as e:
        print(f"[predict-multi] error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/regions', methods=['GET'])
def get_regions():
    # Returns all region IDs with human-readable labels
    region_info = {
        'DELHI': 'Delhi (Aggregated)',
        'BRPL':  'BRPL (South & West Delhi)',
        'BYPL':  'BYPL (East Delhi)',
        'NDPL':  'NDPL (North Delhi)',
        'NDMC':  'NDMC (New Delhi Area)',
        'MES':   'MES (Cantonment Areas)',
    }
    return jsonify({'regions': [{'id': r, 'label': region_info[r]} for r in REGIONS]})


@app.route('/api/health', methods=['GET'])
def health():
    # Quick check — shows loaded models and cached weather dates
    return jsonify({
        'status':        'ok',
        'models_loaded': list(models.keys()),
        'mock_mode':     len(models) == 0,  # True if no model files were found on disk
        'cache_entries': list(_weather_cache.keys()),
    })


if __name__ == '__main__':
    app.run(debug=False, port=5000)