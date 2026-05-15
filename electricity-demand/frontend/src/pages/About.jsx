const timeline = [
  { step: '01', title: 'Data Collection', desc: 'Delhi SLDC 5-minute interval data (2022–2026) merged with Open-Meteo historical weather at 1-hr resolution for delhi and 5 distribution regions.' },
  { step: '02', title: 'Feature Engineering', desc: 'Cyclic time features (sin/cos), holiday flags, season detection, peak-hour flags, and year normalization — 26 features total.' },
  { step: '03', title: 'Model Training', desc: 'XGBoost, LightGBM, CatBoost trained independently per region with early stopping. Validation on last 3 months of training data.' },
  { step: '04', title: 'Ensemble Weighting', desc: 'Inverse-MAE weighting on validation set — models with lower error get higher weight in the final ensemble prediction.' },
  { step: '05', title: 'API Integration', desc: 'Flask backend fetches real-time or archive weather from Open-Meteo, builds feature vectors, and runs inference through all 3 models.' },
  { step: '06', title: 'Live Prediction', desc: 'React frontend sends date + regions, receives 24-hour demand curves, preprocessed weather data, and summary statistics per region.' },
] 



// Per-model breakdown
export default function About() {
  return (
    <div className="animate-[fadeUp_0.3s_ease] max-w-6xl mx-auto px-6 py-12" >
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-3">About PowerDemand</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          A machine learning project for short-term electricity demand forecasting across Delhi's power distribution network.
        </p>
      </div>

      {/* Problem statement */}
      <div className="bg-linear-to-r from-primary-700 to-primary-900 text-white rounded-3xl p-10 mb-12 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1"> 
          <h2 className="text-2xl font-extrabold mb-4">Why Predict Electricity Demand?</h2>
          <p className="text-blue-100 leading-relaxed">
            Accurate electricity demand forecasting is critical for grid operators to balance supply,
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