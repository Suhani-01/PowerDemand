import { useNavigate } from "react-router-dom";
import { FaArrowTrendUp } from "react-icons/fa6";
import { BsGridFill } from "react-icons/bs";
import { MdAccessTimeFilled, MdKeyboardArrowRight } from "react-icons/md";
import { HiBolt, HiMapPin } from "react-icons/hi2";
import { SlGraph } from "react-icons/sl";

const STATS = [
  {
    val: "~91%",
    label: "Accuracy",
    icon: <FaArrowTrendUp className="w-5 h-5 text-primary-500" />,
   
  },
  {
    val: "6",
    label: "Regions",
    icon: <BsGridFill className="w-5 h-5 text-green-500" />,
   
  },
  {
    val: "24h",
    label: "Granularity",
    icon: <MdAccessTimeFilled className="w-5 h-5 text-amber-500" />,
   
  },
];

const FEATURE_STRIP = [
  { emoji: "🤖", title: "Machine Learning", sub: "Ensemble Models" },
  { emoji: "🌤️", title: "Real-time Weather", sub: "Open-Meteo API" },
  { emoji: "🎯", title: "High Accuracy", sub: "~91% Precision" },
  { emoji: "📊", title: "Data Driven", sub: "Smarter Decisions" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    color: "bg-blue-100 text-blue-700",
    title: "Ensemble ML Models",
    desc: "XGBoost + LightGBM + CatBoost weighted ensemble trained on 4 years of Delhi SLDC 5-min data.",
  },
  {
    step: "02",
    color: "bg-indigo-100 text-indigo-700",
    title: "Multi-Region Select",
    desc: "Pick one or multiple Delhi zones simultaneously — predictions run in parallel with a single weather fetch.",
  },
  {
    step: "03",
    color: "bg-amber-100 text-amber-700",
    title: "Live Weather Data",
    desc: "Open-Meteo API — temperature, humidity, wind, precipitation, cloud cover — cached & preprocessed.",
  },
  {
    step: "04",
    color: "bg-green-100 text-green-700",
    title: "Holiday-Aware",
    desc: "Delhi holiday calendar 2022–2026 baked in. Weekend patterns reduce demand by ~8% vs weekdays.",
  },
  {
    step: "05",
    color: "bg-purple-100 text-purple-700",
    title: "Past & Future Dates",
    desc: "Archive API for historical dates, Forecast API for upcoming dates — any date works.",
  },
  {
    step: "06",
    color: "bg-rose-100 text-rose-700",
    title: "24-Hour Granularity",
    desc: "Hourly demand curve with peak detection, daily energy total, and weather correlation charts.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="animate-[fadeUp_0.3s_ease]">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#eef2ff] via-[#f0f7ff] to-[#e8f4ff] min-h-[calc(100vh-64px)]">
        {/* Subtle dot-grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #cbd5e180 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Soft glow blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            {/* ── LEFT: Text content ── */}
            <div className="flex-1 max-w-xl">
              {/* Badge */}
              <div className="inline-flex animate-pulse items-center gap-2 bg-white border border-blue-200 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm mb-6">
                <HiBolt className="w-3.5 h-3.5 text-amber-500" />
                AI-Powered Forecasting
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold leading-[1.1] tracking-tight mb-5 text-slate-900">
                AI-Powered Electricity
                <br />
                <span className="text-primary-600">Demand Forecasting</span>
              </h1>

              {/* Subtext */}
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Predict electricity demand for Delhi's power distribution
                regions — any date, any region. Ensemble ML + real-time weather
                from Open-Meteo API.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={() => navigate("/predict")}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-7 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-primary-600/25 flex items-center gap-2 text-base"
                >
                  Start Predicting
                  <MdKeyboardArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/regions")}
                  className="flex items-center gap-2 bg-white border border-slate-200 hover:border-primary-300 text-slate-700 font-semibold px-7 py-3 rounded-xl text-base shadow-sm transition-all"
                >
                  <HiMapPin className="w-4 h-4 text-slate-400" />
                  Explore Regions
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between mb-1">
                      {s.icon}
 
 
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-none">
                      {s.val}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* - RIGHT: chart visual - */}
            <div className="flex-1 w-full max-w-lg flex flex-col gap-4">
              {/* Main forecast card */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-5 animate-[floatCard_4s_ease-in-out_infinite]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                      Forecast · Delhi
                    </p>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-slate-900 leading-none">
                        4,962
                      </span>
                      <span className="text-slate-400 font-medium mb-0.5">
                        MW
                      </span> 
                    </div>
                  </div>
                  <span className="bg-primary-100 text-primary-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                    AI Predicted
                  </span>
                </div>

                {/* Line Chart */}
                <div className="relative h-28">
                  
                <SlGraph className="text-9xl mx-auto scale-x-125  text-primary-500" />

                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">Peak</p>
                    <p className="text-sm font-extrabold text-red-500">
                      5,280 MW
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">Low</p>
                    <p className="text-sm font-extrabold text-primary-600">
                      2,890 MW
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">Avg</p>
                    <p className="text-sm font-extrabold text-slate-700">
                      4,317 MW
                    </p>
                  </div>
                </div>
              </div>

              {/* Region mini-cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "DELHI", mw: "4,962 MW", color: "#2563eb" },
                  { id: "BRPL", mw: "1,243 MW", color: "#7c3aed" },
                  { id: "BYPL", mw: "892 MW", color: "#0891b2" },
                  { id: "NDPL", mw: "1,180 MW", color: "#059669" },
                  { id: "NDMC", mw: "340 MW", color: "#d97706" },
                  { id: "MES", mw: "28 MW", color: "#db2777" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate("/predict")}
                    className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-left hover:shadow-md hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: r.color }}
                      />
                      <span className="text-[11px] font-extrabold text-slate-600">
                        {r.id}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-800 leading-none">
                      {r.mw}
                    </div>
                    <div
                      className="text-[10px] font-medium mt-0.5"
                      style={{ color: r.up ? "#22c55e" : "#ef4444" }}
                    >
                    
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ******** Feature strip at bottom of hero ******* */}
        <div className="relative border-t border-slate-200/60 bg-white/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {FEATURE_STRIP.map((f) => (
                <div key={f.title} className="flex items-center gap-3">
                  <span className="text-2xl">{f.emoji}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      {f.title}
                    </div>
                    <div className="text-xs text-slate-400">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/******************HOW IT WORKS **************/}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">
            How It Works
          </h2>
          <p className="text-slate-500 text-red max-w-xl mx-auto text-sm sm:text-base">
            A production-grade forecasting pipeline built with real Delhi SLDC
            data and advanced ML techniques.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HOW_IT_WORKS.map((f) => (
            <div
              key={f.step}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"            >
              <span
                className={`inline-block text-xs font-extrabold px-2.5 py-1 rounded-lg mb-4 ${f.color}`}
              >
                {f.step}
              </span>
              <h3 className="font-bold text-slate-800 text-base mb-2">
                {f.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ***************REGION QUICK-SELECT********************/}
      <section className="bg-white border-y border-slate-100 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">
              Delhi Power Regions
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Separate trained models for each distribution zone
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { id: "DELHI", label: "Delhi (Total)", color: "#2563eb" },
              { id: "BRPL", label: "South & West", color: "#7c3aed" },
              { id: "BYPL", label: "East Delhi", color: "#0891b2" },
              { id: "NDPL", label: "North Delhi", color: "#059669" },
              { id: "NDMC", label: "New Delhi Area", color: "#d97706" },
              { id: "MES", label: "Cantonment", color: "#db2777" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => navigate("/predict")}
                className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-primary-300 rounded-2xl p-3 sm:p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"              >
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                  style={{ background: r.color }}
                >
                  {r.id.slice(0, 2)}
                </div>
                <div className="font-bold text-slate-700 text-xs sm:text-sm">
                  {r.id}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-tight">
                  {r.label}
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/regions")}
              className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-sm"            >
              View Detailed Region Info →
            </button>
          </div>
        </div>
      </section>

      {/************ CTA**************** */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl px-6 sm:px-12 py-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Ready to Forecast?
          </h2>
          <p className="text-blue-100 mb-8 max-w-md mx-auto text-sm sm:text-base">
            Select a date and one or multiple regions — get 24-hour demand
            predictions in seconds.
          </p>
          <button
            onClick={() => navigate("/predict")}
            className="bg-white text-primary-700 hover:bg-blue-50 font-bold px-8 sm:px-10 py-3 rounded-xl transition-all shadow-lg text-sm sm:text-base"
          >
            Open Prediction Tool →
          </button>
        </div>
      </section>
    </div>
  );
}
