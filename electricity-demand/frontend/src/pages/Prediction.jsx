import { useState } from "react";
import axios from "axios";
import { MdMessage } from "react-icons/md";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MdElectricBolt } from "react-icons/md";
import { MdError } from "react-icons/md";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const ALL_REGIONS = [
  { id: "DELHI", label: "Delhi (Total)", color: "#2563eb" },
  { id: "BRPL", label: "South & West", color: "#7c3aed" },
  { id: "BYPL", label: "East Delhi", color: "#0891b2" },
  { id: "NDPL", label: "North Delhi", color: "#059669" },
  { id: "NDMC", label: "New Delhi Area", color: "#d97706" },
  { id: "MES", label: "Cantonment", color: "#db2777" },
];

const WEATHER_FIELDS = [
  { key: "temp", label: "Temperature", unit: "°C", icon: "🌡️" },
  { key: "feels_like", label: "Feels Like", unit: "°C", icon: "🤔" },
  { key: "humidity", label: "Humidity", unit: "%", icon: "💧" },
  { key: "wind_speed", label: "Wind Speed", unit: "m/s", icon: "💨" },
  { key: "precipitation", label: "Precipitation", unit: "mm", icon: "🌧️" },
  { key: "cloud_cover", label: "Cloud Cover", unit: "%", icon: "☁️" },
];

function formatHour(h) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  // console.log(payload);
  return (
    <div className="bg-white rounded-xl shadow-lg  p-3 text-xs min-w-[140px]">
       <div>
        {formatHour(label)}
       </div>

       <div>
        {
          payload.map((data,ind)=>(
            <div className="flex gap-2 items-center">
              <span className="h-2 w-2 rounded-full" style={{backgroundColor:data.stroke}}></span>
              <span className="flex-1">{data.name}</span>
              <span>{data.value}</span>
            </div>
          ))
        }
       </div>
       
    </div>
  );
};

function WeatherCard({ hour, wx }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
      <div className="text-xs font-bold text-slate-500 mb-2">
        {formatHour(hour)}
      </div>
      <div className="text-lg font-extrabold text-primary-700">{wx.temp}°C</div>
      <div className="text-[10px] text-slate-400">feels {wx.feels_like}°C</div>
      <div className="mt-1.5 flex justify-center gap-2 text-[10px] text-slate-500 flex-wrap">
        <span>💧{wx.humidity}%</span>
        <span>💨{wx.wind_speed}m/s</span>
      </div>
      {wx.cloud_cover > 0 && (
        <div className="text-[10px] text-slate-400 mt-0.5">
          ☁️{wx.cloud_cover}%
        </div>
      )}
    </div>
  );
}

export default function Prediction() {
  const today = new Date().toISOString().split("T")[0]; //"2026-05-07T10:15:30.000Z" ---> "2026-05-07" 
  const [date, setDate] = useState(today);  //For date input
  const [selectedRegions, setSelectedRegions] = useState(["DELHI"]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({}); // { DELHI: {...}, BRPL: {...} }
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("demand"); //[Demand Curve , Weather Data , Hourly Bars]
  const [weather, setWeather] = useState([]); //weather recieved after prediction
  const [weatherSummary,setWeatherSummary]=useState([]); //weather summary recieved after prediction
  const [selectedTableRegion, setSelectedTableRegion] = useState("DELHI"); //selected region for elect demand view
  const [extraMessage , setExtraMessage]=useState();

  function toggleRegion(id) {
    //id->["Delhi","BRPL","BYPL","NDPL" ,"NDMC","MES"]
    // id is region
    // id is in the array then ->
    //        if prev.length>1 then -> remove the id
    //        else -> dont remove the id
    // else -> add the id
    setSelectedRegions((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((r) => r !== id)
          : prev
        : [...prev, id],
    );
  }

  function selectAll() {
    setSelectedRegions(ALL_REGIONS.map((r) => r.id));
  }
  function clearAll() {
    setSelectedRegions(["DELHI"]);
  }

  // API call for prediction
  async function handlePredict() {
    setLoading(true);
    setError("");
    setResults({}); //clear previous results

    try {
      const toCallAPI=`${API_URL}/api/predict-multi`
      const response = await fetch(toCallAPI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          regions: selectedRegions,
        }),
      });

      const data = await response.json();
      // console.log(`Data recieved for date ${date} : `);
      // console.log(data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch prediction");
      }

      const selectedDate=new Date(date);
      const currentDate=new Date();

      const diffInDays=Math.ceil((selectedDate-currentDate)/(1000 * 60 * 60 * 24));
     

      if(diffInDays>=16){
        setExtraMessage("Previous year's weather data has been used because forecast weather is only available up to 16 days ahead.");
      }else if (diffInDays<0) {
        setExtraMessage("Historical weather data has been used for prediction.");
      }else{
        setExtraMessage("");
      }

      setResults(data.results); //region wise prediction per hour
      console.log(results)
      setWeather(Object.values(data.weather) || []); //weather data returned from the API
      console.log(weather);
      setSelectedTableRegion(selectedRegions[0]); //whos region table to show by default
      setWeatherSummary(data.weather_summary)
    } catch (e) {
      console.log(e.message);
      setError("Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  }

  //mark that whether we have results or not ?
  const hasResults = Object.keys(results).length>0?true:false; 

  // Build combined demand chart data (all selected regions on same chart)

  //results hai tho data prepare kro to show on graph
  //hrr hour pr iterate krke ek array bnaao containing [ { hour :0 , region1 :demand , region2 :demand ....} , {} , {} ]
  const demandChartData = hasResults 
  ? [...Array(24)].map((val,ind)=>{
    const hr=ind;
    const row={hour:hr}; 

    //for every selected region whats the prediction at hour hr?
    selectedRegions.forEach((r)=>{
      if(results[r]){
        row[r]=results[r].predictions[hr]; // {hour : .. , region : 1234MW } add region one by one
      }
    });
    return row;
  }):[];

  // [
  // {
  //   hour : 0,
  //   Delhi : 100,
  //   BRPL : 90
  // },
  // {
  //   hour : 1,
  //   Delhi : 120,
  //   BRPL : 110
  // }, ]

  // Weather chart Data for selected date
  const weatherResult = weather;
  const weatherChartData = weather.length
    ? weather?.map((wx, i) => ({
        hour: i,
        Temperature: wx?.temperature_2m,
        "Feels Like": wx?.apparent_temperature,
        Humidity: wx?.relative_humidity_2m,
        "Wind Speed": wx?.wind_speed_10m,
        "Cloud Cover": wx?.cloud_cover,
        Precipitation: wx?.precipitation,
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 page-enter">
      {/************** Header ******************/}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-1">
          Demand Prediction
        </h1>
        <p className="text-slate-500">
          Select a date and one or more regions to generate hourly demand
          forecasts.
        </p>
      </div>

      {/* *********** Form ************ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 items-start sm:items-end">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* Region selector */}
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Regions ({selectedRegions.length} selected)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-primary-600 hover:underline font-medium"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:underline font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_REGIONS.map((r) => {
                const active = selectedRegions.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleRegion(r.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      active
                        ? "border-transparent text-white shadow-md"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                    }`}
                    style={
                      active
                        ? { background: r.color, borderColor: r.color }
                        : {}
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: active ? "white" : r.color }}
                    />
                    {r.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Form */}
          <button
            onClick={handlePredict}
            disabled={loading || selectedRegions.length === 0}
            className="btn-primary flex items-center gap-2 py-3 px-8 justify-center"
          >
            {loading ? (
              <>
                <MdElectricBolt /> Running…
              </>
            ) : (
              <>
                <MdElectricBolt /> Run Prediction
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          Weather fetched for Delhi (28.61°N, 77.21°E) ·{" "}
          {new Date(date + "T12:00:00") < new Date()
            ? "Archive API (past date)"
            : "Forecast API (future date)"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-700 text-sm flex items-center gap-2">
          <MdError className="text-xl" /> {error}
        </div>
      )}

      {/* Message if loading ... */}
      {loading && <div className="flex bg-white rounded-2xl shadow-md h-20 bg-  gap-2 items-center justify-center"> <div className="h-6 aspect-square border-4 border-gray-400 border-l-transparent animate-spin rounded-full"></div> <div className="text-gray-400 animate-pulse">Loading...</div></div>}

      {(hasResults && extraMessage) && <div className="bg-yellow-100 text-yellow-700 rounded-2xl shadow hover:-translate-y-1 cursor-pointer duration-500 ease-in-out p-4 mx-1 mb-4 flex gap-2 justify-center items-center"><MdMessage className="text-lg" /> {extraMessage}</div>}

      {/* Results */}
      {hasResults && (
        <div>
          {/* Summary - one row per region */}
          <div className="flex flex-col gap-3 mb-8">
            {selectedRegions.map((r) => {
              const d = results[r];
              const regionMeta = ALL_REGIONS.find((val) => val.id === r);

              // if we dont have results for selected region 
              if (!d) return   <div
                  key={r}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* Region header strip */}
                  <div
                    className="flex items-center gap-2 px-5 py-2.5 border-b"
                    style={{ borderBottomColor: regionMeta.color }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: regionMeta.color }}
                    />
                    <span className="font-extrabold text-slate-800 text-sm">
                      {r}
                    </span>
                    <span className="text-slate-400 text-xs">
                      — {regionMeta.label}
                    </span>
                  </div>
                  {/* Stats row */}
                  <div className="h-20 flex items-center justify-center">
                      <div className="text-gray-600 flex items-center justify-center mx-3 gap-1 flex-wrap">No prediction for {r} - <button onClick={handlePredict} className="text-blue-600 hover:text-blue-400 underline"> Run Prediction</button> to see the results</div>
                  </div>
                </div>
              
              // organizing data  of selected region
              const stats = [
                {
                  label: "Peak Demand",
                  value: d.summary.peak_demand_mw,
                  unit: "MW",
                  sub: `at ${formatHour(d.summary.peak_hour)}`,
                  color: "text-red-600",
                },
                {
                  label: "Peak Hour",
                  value: formatHour(d.summary.peak_hour),
                  unit: "",
                  sub: "highest demand",
                  color: "text-amber-600",
                },
                {
                  label: "Least Demand",
                  value: d.summary.least_demand_mw,
                  unit: "MW",
                  sub: `at ${formatHour(d.summary?.least_hour)}`,
                  color: "text-green-600",
                },
                {
                  label: "Off-Peak Hour",
                  value: formatHour(d.summary?.least_hour),
                  unit: "",
                  sub: "lowest demand",
                  color: "text-amber-600",
                },
                {
                  label: "Avg Demand",
                  value: d.summary.avg_demand_mw,
                  unit: "MW",
                  sub: "24-hr average",
                  color: "text-primary-700",
                },
                {
                  label: "Daily Energy",
                  value: (d.summary.total_demand_mwh / 1000).toFixed(2),
                  unit: "GWh",
                  sub: "total consumption",
                  color: "text-slate-700",
                },
              ];
              return (
                <div
                  key={r}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* Region header strip */}
                  <div
                    className="flex items-center gap-2 px-5 py-2.5 border-b"
                    style={{ borderBottomColor: regionMeta.color }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: regionMeta.color }}
                    />
                    <span className="font-extrabold text-slate-800 text-sm">
                      {r}
                    </span>
                    <span className="text-slate-400 text-xs">
                      — {regionMeta.label}
                    </span>
                  </div>
                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-slate-100">
                    {stats.map((s) => (
                      <div key={s.label} className="px-4 py-3">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                          {s.label}
                        </div>
                        <div
                          className={`text-base font-extrabold ${s.color} leading-tight`}
                        >
                          {s.value}
                          {s.unit && (
                            <span className="text-xs font-medium text-slate-400 ml-0.5">
                              {s.unit}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {s.sub}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 flex-wrap">
              {[
                { id: "demand", label: "📈 Demand Curve" },
                { id: "weather", label: "🌡️ Weather Data" },
                { id: "bars", label: "📊 Hourly Bars" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === t.id
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-primary-600 hover:bg-primary-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* DEMAND CURVE — all selected regions overlaid */}
            {activeTab === "demand" && (
              <div>
                <p className="text-xs text-slate-400 mb-4">
                  24-hour demand (MW) — all selected regions on one chart
                </p>

                {/* Container that adjusts its width and height based on the size of its parent element */}
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={demandChartData}>
                    <CartesianGrid/> {/* For the background grid */}
                    
                    
                    {/* tickformatter -> a function applied to each axis tick value before displaying it. */}
                    {/* data key -> data to be used for x axis from the data=demandChartData */}
                    <XAxis
                      dataKey="hour" 
                      tickFormatter={formatHour}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }} 
                    />

                    {/* passes active  -> (bool , to show tooltip or not ?) , payload -> ( nearest y cord data array of the mouse hover ) , label -> whats on x-axis */}
                    <Tooltip content={<CustomTooltip />} /> 
                    
                    {/* to display which line is showing what  */}
                    <Legend /> 

                    {/* plot line for every selected region */}
                    {selectedRegions.map((r) => {
                      //preparing  meta data of the region {ie to fetch color}
                      const meta = ALL_REGIONS.find((x) => x.id === r);

                      //datakey prop is used to find the data to plot from the prepared data (demandCharData)
                      return (
                        <Line
                          key={r}
                          type="monotone"
                          dataKey={r}
                          name={r}
                          stroke={meta.color}
                          strokeWidth={2.5}
                          dot={false} 
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* WEATHER DATA */}
            {activeTab === "weather" && (
              <div>
      

                {/* Preprocessed weather summary cards */}
                {weatherSummary && (
                  <div className="mb-6">
                    <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">
                       Weather Summary  
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
                      {WEATHER_FIELDS.map((f) => {
                        const vals =weatherSummary
                          .map((w) => w[f.key])
                          .filter((v) => v != null);
                        const avg = vals.length
                          ? (
                              vals.reduce((a, b) => a + b, 0) / vals.length
                            ).toFixed(1)
                          : "—";
                        const min = vals.length
                          ? Math.min(...vals).toFixed(1)
                          : "—";
                        const max = vals.length
                          ? Math.max(...vals).toFixed(1)
                          : "—";
                        return (
                          <div
                            key={f.key}
                            className="bg-slate-50 rounded-xl p-3 border border-slate-100"
                          >
                            <div className="text-lg mb-1">{f.icon}</div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                              {f.label}
                            </div>
                            <div className="text-base font-extrabold text-slate-700">
                              {avg}
                              <span className="text-xs font-normal text-slate-400 ml-0.5">
                                {f.unit}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {min}–{max} {f.unit}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Weather charts */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-slate-400 mb-3">
                      Temperature profile (°C)
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={weatherChartData}>
                                         
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="hour"
                          tickFormatter={formatHour}
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          width={35}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="Temperature"
                          stroke="#ef4444"
                          strokeWidth={2}
                          fill="rgba(239,68,68,0.2)"
                          dot={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="Feels Like"
                          stroke="#f97316"
                          strokeWidth={2}
                          fill="rgba(249,115,22,0.2)"
                          
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-3">
                      Humidity · Wind Speed · Cloud Cover
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={weatherChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="hour"
                          tickFormatter={formatHour}
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          width={35}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="Humidity"
                          stroke="#0891b2"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="Wind Speed"
                          stroke="#059669"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="Cloud Cover"
                          stroke="#94a3b8"
                          strokeWidth={1.5}
                          strokeDasharray="4 2"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* HOURLY BARS */}
            {activeTab === "bars" && (
              <div>
                <p className="text-xs text-slate-400 mb-4">
                  Hourly demand bars per region
                </p>
                {selectedRegions.map((r) => {
                  const d = results[r];
                  if (!d) return null;
                  const meta = ALL_REGIONS.find((x) => x.id === r);
                  const barData = d.hours.map((h, i) => ({
                    hour: h,
                    Demand: d.predictions[i],
                  }));
                  return (
                    <div key={r} className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: meta.color }}
                        />
                        <span className="text-sm font-bold text-slate-700">
                          {r} — {meta.label}
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={barData}>
                          <CartesianGrid />
                          <XAxis
                            dataKey="hour"
                            tickFormatter={formatHour}
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "#94a3b8" }} 
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="Demand"
                            radius={[3, 3, 0, 0]}
                            fill={meta.color}
                            fillOpacity={0.85}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hourly table — per region tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-slate-700 mr-2">
                Hourly Breakdown
              </h3>
              {selectedRegions.map((r) => {
                const meta = ALL_REGIONS.find((x) => x.id === r);
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedTableRegion(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      selectedTableRegion === r
                        ? "text-white border-transparent"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                    style={
                      selectedTableRegion === r ? { background: meta.color } : {}
                    }
                  >
                    {r}
                  </button>
                );
              })}
            </div>
            {weatherResult && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      <th className="px-4 py-3 bg-slate-300 text-left">Hour</th>
                      <th className="px-4 bg-slate-300 py-3 text-right">Demand (MW)</th>
                      <th className="px-4 py-3 bg-slate-200 text-right">Temp (°C)</th>
                      <th className="px-4 py-3 bg-slate-200 text-right">Feels (°C)</th>
                      <th className="px-4 py-3 bg-slate-200 text-right">Humidity %</th>
                      <th className="px-4 py-3 bg-slate-200 text-right">Wind m/s</th>
                      <th className="px-4 py-3 bg-slate-200 text-right">Precip mm</th>
                      <th className="px-4 py-3 bg-slate-200 text-right">Cloud %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* weather => [ {apparent_temperature: 30.7, cloud_cover: 0, precipitation: 0, relative_humidity_2m: 56, temperature_2m: 28.3, …} , {} , {} ..... ] */}

                    {weather.map((wx, i) => {
                      
                      const h=i;
                      const isPeak =  (h === results[selectedTableRegion]?.summary?.peak_hour);                    
                      return (
                        <tr
                          key={h}
                          className={`border-b border-slate-50 transition-colors ${isPeak ? "bg-blue-50" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-4 py-2.5 font-medium bg-slate-200 text-slate-700">
                            <span className="flex items-center gap-2">
                              {formatHour(h)}
                              {isPeak && (
                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  PEAK
                                </span>
                              )}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-2.5 text-right font-mono bg-slate-200 font-bold ${isPeak ? "text-red-600" : "text-primary-700"}`}
                          >
                            {results[selectedTableRegion]?.predictions[i]?.toLocaleString(
                              "en-IN")}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-600 font-mono">
                            {wx.temperature_2m ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-600 font-mono">
                            {wx.apparent_temperature ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-600 font-mono">
                            {wx.relative_humidity_2m ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-600 font-mono">
                            {wx.wind_speed_10m ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-600 font-mono">
                            {wx.precipitation ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-600 font-mono">
                            {wx.cloud_cover ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasResults && !loading && !error && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 fill-current text-primary-400"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-600 text-lg mb-1">
            No Prediction Yet
          </h3>
          <p className="text-slate-400 text-sm">
            Select a date, choose one or more regions, then click{" "}
            <strong>Run Prediction</strong>.
          </p>
        </div>
      )}


    </div>
  );
}
