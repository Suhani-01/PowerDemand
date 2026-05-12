import { useNavigate } from 'react-router-dom'



const NEED_POINTS = [
  {
    icon: '⚡',
    title: 'Grid Stability',
    desc: 'Accurate forecasting allows Delhi\'s grid operators (DTL) to schedule generation dispatch and avoid sudden load imbalances that cause voltage fluctuations or outages.',
  },
  {
    icon: '💰',
    title: 'Cost Optimization',
    desc: 'Over/under-procurement of power in short-term markets (IEX) is costly. Precise forecasts reduce expensive last-minute purchases and wasteful over-generation.',
  },
  {
    icon: '🌿',
    title: 'Renewable Integration',
    desc: 'Delhi is adding rooftop solar and wind. Knowing net demand helps schedule when to draw from renewables vs thermal plants, maximizing green energy use.',
  },
  {
    icon: '🌡️',
    title: 'Climate Extremes',
    desc: '2024 saw Delhi\'s hottest summer on record (49°C). ML models that capture temperature-demand correlation can better anticipate extreme weather events.',
  },
  {
    icon: '📊',
    title: 'DISCOM Planning',
    desc: 'Distribution companies (BRPL, BYPL, NDPL) use demand forecasts for substation load management, maintenance scheduling, and capital investment planning.',
  },
  {
    icon: '🏙️',
    title: 'Smart City Vision',
    desc: 'Delhi\'s smart grid initiative requires intelligent demand prediction as a foundation layer for automated demand response and dynamic pricing systems.',
  },
]

export default function Regions() {
  const navigate = useNavigate()

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 page-enter">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-3">Delhi Power Distribution Regions</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Six distinct distribution zones with separate ML models trained for each — covering the entire National Capital Territory.
        </p>
      </div>

    

      {/* Distribution Map Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-14">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-1">🗺️ Delhi Grid Infrastructure Map</h2>
          <p className="text-slate-500 text-sm">
            Geographical distribution of DISCOMs across the National Capital Territory —{' '}
            <a
              href="https://www.dtl.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Source: Delhi Transco Limited (DTL)
            </a>
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-0">
          {/* Map image */}
          <div className="lg:w-1/2 bg-slate-900 flex items-center justify-center p-6 min-h-[340px]">
            <img
              src="/map.png"
              alt="Delhi Power Distribution Map"
              className="max-h-[480px] w-auto rounded-xl object-contain"
              
            />
          </div>

          {/* Map description */}
          <div className="lg:w-1/2 p-6 space-y-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              Electricity distribution in the NCT is a sophisticated network managed by three private DISCOMs and specialized government agencies, ensuring load stability across residential, commercial, and diplomatic sectors.
            </p>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Strategic Partners (DISCOMs)</p>
              <div className="space-y-3">
                {[
                  { id: 'BRPL', label: 'BSES Rajdhani (BRPL)', color: '#7c3aed', points: ['Primary supply for South and West Delhi', 'Critical network serving 2.5M+ nodes', 'GNCTD & Reliance Infrastructure partnership'] },
                  { id: 'BYPL', label: 'BSES Yamuna (BYPL)', color: '#0891b2', points: ['Distribution hub for Central and East Delhi', 'Network capacity for 1.7M+ consumer units', 'Advanced metering infrastructure integrated'] },
                  { id: 'NDPL', label: 'Tata Power (TPDDL)', color: '#059669', points: ['Smart grid operations in North Delhi', 'Innovation leader for 1.8M+ consumers', 'High-reliability industrial feed specialized'] },
                ].map(d => (
                  <div key={d.id} className="rounded-xl p-4 border" style={{ borderLeft: `3px solid ${d.color}`, borderTop: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                    <p className="font-bold text-sm mb-2" style={{ color: d.color }}>{d.label}</p>
                    <ul className="space-y-1">
                      {d.points.map((pt, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                          <span style={{ color: d.color }} className="mt-0.5">→</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Institutional Agencies</p>
              <div className="space-y-3">
                {[
                  { id: 'NDMC', label: 'NDMC', color: '#d97706', points: ["Exclusive supply to Lutyens' Delhi & VIP Zones", 'Manages high-security diplomatic enclaves'] },
                  { id: 'MES', label: 'MES', color: '#db2777', points: ['Defense grid management for Cantonment areas', 'Direct Ministry of Defence oversight'] },
                ].map(d => (
                  <div key={d.id} className="rounded-xl p-4" style={{ borderLeft: `3px solid ${d.color}`, borderTop: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                    <p className="font-bold text-sm mb-2" style={{ color: d.color }}>{d.label}</p>
                    <ul className="space-y-1">
                      {d.points.map((pt, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                          <span style={{ color: d.color }} className="mt-0.5">→</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

  
      {/* Need of the project */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Need of the Project</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Why short-term electricity demand forecasting matters for Delhi's grid</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {NEED_POINTS.map(n => (
            <div key={n.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-glow">
              <div className="text-3xl mb-3">{n.icon}</div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{n.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{n.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-10 text-center text-white">
          <h3 className="text-2xl font-extrabold mb-3">Start Exploring the Data</h3>
          <p className="text-blue-100 mb-6">Pick any date and region combination to see the predicted demand curve with weather correlation.</p>
          <button onClick={() => navigate('/predict')} className="bg-white text-primary-700 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl transition-all shadow-lg">
            Open Prediction Tool →
          </button>
        </div>
      </div>
    </div>
  )
}