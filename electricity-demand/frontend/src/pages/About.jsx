const timeline = [
  { step: '01', title: 'Data Collection', desc: 'Delhi SLDC 5-minute interval data (2022–2026) merged with Open-Meteo historical weather at 1-hr resolution for delhi and 5 distribution regions.' },
  { step: '02', title: 'Feature Engineering', desc: 'Cyclic time features (sin/cos), holiday flags, season detection, peak-hour flags, and year normalization — 26 features total.' },
  { step: '03', title: 'Model Training', desc: 'XGBoost, LightGBM, CatBoost trained independently per region with early stopping. Validation on last 3 months of training data.' },
  { step: '04', title: 'Ensemble Weighting', desc: 'Inverse-MAE weighting on validation set — models with lower error get higher weight in the final ensemble prediction.' },
  { step: '05', title: 'API Integration', desc: 'Flask backend fetches real-time or archive weather from Open-Meteo, builds feature vectors, and runs inference through all 3 models.' },
  { step: '06', title: 'Live Prediction', desc: 'React frontend sends date + regions, receives 24-hour demand curves, preprocessed weather data, and summary statistics per region.' },
]



// Per-model breakdown
const fullStats = [
  { region: 'DELHI', model: 'XGB',      mae: '314.43', rmse: '374.77', mape: '8.909', r2: '0.8225', acc: '91.091' },
  { region: 'DELHI', model: 'LGB',      mae: '295.71', rmse: '358.98', mape: '8.221', r2: '0.8372', acc: '91.779' },
  { region: 'DELHI', model: 'CAT',      mae: '318.84', rmse: '378.68', mape: '9.135', r2: '0.8188', acc: '90.865' },
  { region: 'DELHI', model: 'ENSEMBLE', mae: '307.41', rmse: '366.43', mape: '8.667', r2: '0.8304', acc: '91.333' },
  { region: 'BRPL',  model: 'XGB',      mae: '144.51', rmse: '163.52', mape: '9.646', r2: '0.7927', acc: '90.354' },
  { region: 'BRPL',  model: 'LGB',      mae: '144.67', rmse: '164.67', mape: '9.630', r2: '0.7898', acc: '90.370' },
  { region: 'BRPL',  model: 'CAT',      mae: '144.91', rmse: '167.81', mape: '9.613', r2: '0.7817', acc: '90.387' },
  { region: 'BRPL',  model: 'ENSEMBLE', mae: '143.87', rmse: '163.34', mape: '9.569', r2: '0.7932', acc: '90.431' },
  { region: 'BYPL',  model: 'XGB',      mae: '58.70',  rmse: '76.06',  mape: '8.335', r2: '0.8593', acc: '91.665' },
  { region: 'BYPL',  model: 'LGB',      mae: '57.52',  rmse: '74.22',  mape: '8.269', r2: '0.8660', acc: '91.731' },
  { region: 'BYPL',  model: 'CAT',      mae: '63.32',  rmse: '80.94',  mape: '9.126', r2: '0.8406', acc: '90.874' },
  { region: 'BYPL',  model: 'ENSEMBLE', mae: '58.90',  rmse: '75.73',  mape: '8.415', r2: '0.8605', acc: '91.585' },
  { region: 'NDPL',  model: 'XGB',      mae: '97.12',  rmse: '125.07', mape: '9.336', r2: '0.8198', acc: '90.664' },
  { region: 'NDPL',  model: 'LGB',      mae: '97.18',  rmse: '125.19', mape: '9.351', r2: '0.8195', acc: '90.649' },
  { region: 'NDPL',  model: 'CAT',      mae: '97.93',  rmse: '126.44', mape: '9.481', r2: '0.8159', acc: '90.519' },
  { region: 'NDPL',  model: 'ENSEMBLE', mae: '96.42',  rmse: '124.07', mape: '9.266', r2: '0.8227', acc: '90.734' },
  { region: 'NDMC',  model: 'XGB',      mae: '26.92',  rmse: '31.55',  mape: '16.493',r2: '0.3560', acc: '83.507' },
  { region: 'NDMC',  model: 'LGB',      mae: '22.62',  rmse: '28.32',  mape: '13.303',r2: '0.4812', acc: '86.697' },
  { region: 'NDMC',  model: 'CAT',      mae: '27.37',  rmse: '31.69',  mape: '16.743',r2: '0.3504', acc: '83.257' },
  { region: 'NDMC',  model: 'ENSEMBLE', mae: '25.65',  rmse: '30.36',  mape: '15.514',r2: '0.4039', acc: '84.486' },
  { region: 'MES',   model: 'XGB',      mae: '2.54',   rmse: '3.28',   mape: '9.739', r2: '0.8698', acc: '90.261' },
  { region: 'MES',   model: 'LGB',      mae: '2.53',   rmse: '3.27',   mape: '9.597', r2: '0.8706', acc: '90.403' },
  { region: 'MES',   model: 'CAT',      mae: '2.44',   rmse: '3.14',   mape: '9.297', r2: '0.8812', acc: '90.703' },
  { region: 'MES',   model: 'ENSEMBLE', mae: '2.47',   rmse: '3.19',   mape: '9.390', r2: '0.8772', acc: '90.610' },
]

const REGIONS = ['DELHI','BRPL','BYPL','NDPL','NDMC','MES']
const MODEL_COLORS = { XGB: 'text-orange-600', LGB: 'text-green-600', CAT: 'text-yellow-600', ENSEMBLE: 'text-primary-700' }

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 page-enter">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-3">About PowerDemand</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          A machine learning project for short-term electricity demand forecasting across Delhi's power distribution network.
        </p>
      </div>

      {/* Problem statement */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white rounded-3xl p-10 mb-12 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-3">Problem Statement</div>
          <h2 className="text-2xl font-extrabold mb-4">Why Predict Electricity Demand?</h2>
          <p className="text-blue-100 leading-relaxed">
            Accurate short-term electricity demand forecasting is critical for grid operators to balance supply,
            prevent blackouts, reduce wastage, and optimize generation dispatch. Delhi's grid is highly sensitive
            to temperature, time of day, season, and holidays — making it an ideal ML problem.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 flex-shrink-0">
          {[['4 Years','of training data'],['26','input features'],['5','distribution zones'],['3 Models','in ensemble']].map(([v,l]) => (
            <div key={l} className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-extrabold text-amber-300">{v}</div>
              <div className="text-blue-200 text-xs mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <div className="mb-14">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">How the Pipeline Works</h2>
        <p className="text-slate-500 mb-8">End-to-end from raw SLDC data to real-time prediction.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {timeline.map(t => (
            <div key={t.step} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-glow">
              <div className="text-4xl font-extrabold text-primary-100 mb-3 font-mono">{t.step}</div>
              <h3 className="font-bold text-slate-800 mb-2">{t.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      

      {/* Feature groups */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">26 Model Features</h2>
        <p className="text-slate-500 mb-6">Input features engineered from time, calendar, and weather data.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: 'Time Features (14)', color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-600',
              items: ['hour','day_of_week','month','year','day_of_year','week_of_year','year_norm','hour_sin / hour_cos','month_sin / month_cos','dow_sin / dow_cos','is_morning_peak','is_evening_peak'] },
            { title: 'Flag Features (6)', color: 'border-green-200 bg-green-50', badge: 'bg-green-600',
              items: ['is_weekend','is_holiday (Delhi calendar 2022–26)','is_monsoon (Jul–Sep)','is_summer (Apr–Jun)','is_winter (Oct–Feb)'] },
            { title: 'Weather Features (6)', color: 'border-amber-200 bg-amber-50', badge: 'bg-amber-600',
              items: ['Temperature (°C)','Relative Humidity (%)','Apparent Temperature (feels_like)','Precipitation (mm)','Wind Speed (m/s)','Cloud Cover Total (%)'] },
          ].map(g => (
            <div key={g.title} className={`rounded-2xl p-5 border ${g.color}`}>
              <div className={`inline-block text-white text-xs font-bold px-2.5 py-1 rounded-lg mb-3 ${g.badge}`}>{g.title}</div>
              <ul className="space-y-1">
                {g.items.map(item => (
                  <li key={item} className="text-sm text-slate-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                    <code className="font-mono text-xs">{item}</code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
