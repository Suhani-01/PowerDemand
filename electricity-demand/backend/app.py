from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import requests
from datetime import datetime, date
import joblib
import os
import time

app = Flask(__name__)
CORS(app)

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ARCHIVE_URL  = "https://archive-api.open-meteo.com/v1/archive"

REGIONS = ['DELHI', 'BRPL', 'BYPL', 'NDPL', 'NDMC', 'MES']

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
CACHE_TTL = 1800  # 30 minutes — re-fetch if stale

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
    if month in [4, 5, 6]:        return 'Summer'
    elif month in [7, 8, 9]:      return 'Monsoon'
    elif month in [10,11,12,1,2]: return 'Winter'
    else:                          return 'Spring'


def is_morning_peak(hour, season):
    if season == 'Winter':              return int(9  <= hour <= 11)
    elif season in ['Summer','Monsoon']:return int(11 <= hour <= 13)
    else:                               return int(10 <= hour <= 12)


def is_evening_peak(hour, season):
    if season == 'Winter':              return int(17 <= hour <= 19)
    elif season in ['Summer','Monsoon']:return int(20 <= hour <= 23)
    else:                               return int(18 <= hour <= 21)


def build_features(dt, weather_row):
    hour     = dt.hour
    dow      = dt.weekday()
    month    = dt.month
    year     = dt.year
    doy      = dt.timetuple().tm_yday
    woy      = dt.isocalendar()[1]
    date_str = dt.strftime('%Y-%m-%d')
    season   = get_season(month)

    feat = {
        'hour': hour,
        'day_of_week': dow,
        'month': month,
        'year': year,
        'day_of_year': doy,
        'week_of_year': woy,
        'year_norm': (year - 2022) / 5,
        'hour_sin':  np.sin(2 * np.pi * hour  / 24),
        'hour_cos':  np.cos(2 * np.pi * hour  / 24),
        'month_sin': np.sin(2 * np.pi * month / 12),
        'month_cos': np.cos(2 * np.pi * month / 12),
        'dow_sin':   np.sin(2 * np.pi * dow   / 7),
        'dow_cos':   np.cos(2 * np.pi * dow   / 7),
        'is_morning_peak': is_morning_peak(hour, season),
        'is_evening_peak': is_evening_peak(hour, season),
        'is_weekend': int(dow >= 5),
        'is_holiday': int(date_str in DELHI_HOLIDAYS),
        'is_monsoon': int(month in [7, 8, 9]),
        'is_summer':  int(month in [4, 5, 6]),
        'is_winter':  int(month in [10, 11, 12, 1, 2]),
        'Temperature (°C)':       weather_row.get('temperature_2m',      25.0),
        'Relative Humidity (%)':  weather_row.get('relative_humidity_2m',60.0),
        'feels_like':             weather_row.get('apparent_temperature', 25.0),
        'Precipitation (mm)':     weather_row.get('precipitation',        0.0),
        'Wind Speed (m/s)':       weather_row.get('wind_speed_10m',       3.0),
        'Cloud Cover Total (%)':  weather_row.get('cloud_cover',         50.0),
    }
    return [feat[f] for f in FEATURES]


# ─── Weather fetch with caching + retry ─────────────────────────────────────

def _default_weather():
    """Return sensible Delhi defaults if API fails."""
    return {h: {
        'temperature_2m':      25.0,
        'relative_humidity_2m':60.0,
        'apparent_temperature':25.0,
        'precipitation':        0.0,
        'wind_speed_10m':       3.0,
        'cloud_cover':         50.0,
    } for h in range(24)}


def fetch_weather(target_date_str: str) -> dict:
    """
    Fetch hourly weather for a given date (Delhi).
    - Returns cached result if fresh (< 30 min old).
    - Decides archive vs forecast based on date.
    - Retries once on failure, then falls back to defaults.
    """
    now = time.time()

    # Return from cache if still fresh
    if target_date_str in _weather_cache:
        cached_at, cached_data = _weather_cache[target_date_str]
        if now - cached_at < CACHE_TTL:
            print(f"[weather] cache hit for {target_date_str}")
            return cached_data

    target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
    today       = date.today()

    # archive endpoint only supports up to ~5 days before today
    # forecast endpoint supports today + 16 days ahead
    if target_date < today:
        url = ARCHIVE_URL
    else:
        url = FORECAST_URL

    params = {
        'latitude':  28.6139,
        'longitude': 77.2090,
        'hourly':    'temperature_2m,relative_humidity_2m,apparent_temperature,'
                     'precipitation,wind_speed_10m,cloud_cover',
        'timezone':  'Asia/Kolkata',
        'start_date': target_date_str,
        'end_date':   target_date_str,
    }

    for attempt in range(3):          # up to 3 attempts
        try:
            resp = requests.get(url, params=params, timeout=20)
            resp.raise_for_status()
            data = resp.json()

            hourly = data.get('hourly', {})
            times  = hourly.get('time', [])

            if not times:
                raise ValueError("Empty hourly data returned from Open-Meteo")

            # Build {hour: {field: value}} dict
            keys = ['temperature_2m','relative_humidity_2m','apparent_temperature',
                    'precipitation','wind_speed_10m','cloud_cover']
            weather_by_hour = {}
            for i, t in enumerate(times):
                hr = int(t.split('T')[1].split(':')[0])
                weather_by_hour[hr] = {
                    k: (hourly.get(k) or [None]*24)[i] or _default_weather()[0][k]
                    for k in keys
                }

            # Fill any missing hours (should be 0–23)
            for h in range(24):
                if h not in weather_by_hour:
                    weather_by_hour[h] = _default_weather()[h]

            # Cache and return
            _weather_cache[target_date_str] = (now, weather_by_hour)
            print(f"[weather] fetched {target_date_str} via {url.split('/')[2]} (attempt {attempt+1})")
            return weather_by_hour

        except Exception as e:
            print(f"[weather] attempt {attempt+1} failed for {target_date_str}: {e}")
            if attempt < 2:
                time.sleep(1.5 * (attempt + 1))   # back-off: 1.5s, 3s
            else:
                print(f"[weather] all attempts failed — using defaults for {target_date_str}")
                fallback = _default_weather()
                _weather_cache[target_date_str] = (now, fallback)
                return fallback


# ─── Prediction logic ────────────────────────────────────────────────────────

def _run_model(region, feat_arr, wx, hour):
    """Run ensemble or mock prediction for one region/hour."""
    if region in models:
        w = weights[region]
        p_xgb = models[region]['xgb'].predict(feat_arr)[0]
        p_lgb = models[region]['lgb'].predict(feat_arr)[0]
        p_cat = models[region]['cat'].predict(feat_arr)[0]
        return float(w['xgb'] * p_xgb + w['lgb'] * p_lgb + w['cat'] * p_cat)
    else:
        base = {'DELHI':3500,'BRPL':900,'BYPL':700,'NDPL':1100,'NDMC':400,'MES':300}
        b    = base.get(region, 1000)
        temp = wx.get('temperature_2m', 25)
        temp_factor = 1 + max(0, (temp - 25) * 0.02)
        hour_factor = 0.7 + 0.3 * np.sin(np.pi * (hour - 6) / 12) if 6 <= hour <= 22 else 0.65
        return float(b * hour_factor * temp_factor + np.random.normal(0, 50))


def predict_for_date(target_date_str: str, region: str,
                     shared_weather: dict = None):
    """
    Predict 24-hour demand for one region.
    If shared_weather is provided (already fetched), skip API call.
    """
    weather_by_hour = shared_weather if shared_weather else fetch_weather(target_date_str)
    target_dt = datetime.strptime(target_date_str, '%Y-%m-%d')

    hourly_preds   = []
    hourly_weather = []

    for hour in range(24):
        dt  = target_dt.replace(hour=hour)
        wx  = weather_by_hour.get(hour, _default_weather()[0])
        fv  = build_features(dt, wx)
        pred = _run_model(region, np.array([fv]), wx, hour)

        hourly_preds.append(round(pred, 1))
        hourly_weather.append({
            'temp':          round(wx.get('temperature_2m',       25), 1),
            'humidity':      round(wx.get('relative_humidity_2m', 60), 1),
            'feels_like':    round(wx.get('apparent_temperature', 25), 1),
            'precipitation': round(wx.get('precipitation',         0), 2),
            'wind_speed':    round(wx.get('wind_speed_10m',        3), 1),
            'cloud_cover':   round(wx.get('cloud_cover',          50), 1),
        })

    return hourly_preds, hourly_weather


def build_summary(hourly_preds):
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


# ─── Routes ─────────────────────────────────────────────────────────────────


    """Single-region prediction."""
    try:
        body   = request.get_json()
        target_date = body.get('date')
        region      = (body.get('region') or 'DELHI').upper()

        if not target_date:
            return jsonify({'error': 'date is required'}), 400
        if region not in REGIONS:
            return jsonify({'error': f'Region must be one of {REGIONS}'}), 400

        hourly_preds, hourly_weather = predict_for_date(target_date, region)

        return jsonify({
            'date':        target_date,
            'region':      region,
            'hours':       list(range(24)),
            'predictions': hourly_preds,
            'weather':     hourly_weather,
            'summary':     build_summary(hourly_preds),
        })

    except Exception as e:
        print(f"[predict] error: {e}")
        return jsonify({'error': str(e)}), 500


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

        # Validate regions
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
    return jsonify({
        'status':        'ok',
        'models_loaded': list(models.keys()),
        'mock_mode':     len(models) == 0,
        'cache_entries': list(_weather_cache.keys()),
    })


if __name__ == '__main__':
    app.run(debug=False, port=5000)
