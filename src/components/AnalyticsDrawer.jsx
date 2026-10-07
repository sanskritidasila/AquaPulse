import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Droplets, Activity, AlertOctagon, ShieldCheck, AlertTriangle, Printer, Clock, MapPin } from 'lucide-react';

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function AnalyticsDrawer({ village, allVillages, onSelectVillage, isAccessibleMode }) {
  if (!village) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-stone-200 bg-white p-6 text-xs text-stone-400">
        Select a station to inspect telemetry data.
      </div>
    );
  }

  const isCritical = village.riskLevel === 'CRITICAL';
  const isWarning = village.riskLevel === 'WARNING';
  const accentColor = isCritical ? '#b91c1c' : isWarning ? '#c2410c' : '#15803d';

  // Dynamic pH evaluation
  const isPhSafe = village.ph >= 6.5 && village.ph <= 8.5;
  const phStatusText = isPhSafe ? '6.5–8.5 (Normal)' : village.ph < 6.5 ? '< 6.5 (Acidic)' : '> 8.5 (Alkaline)';
  const phStatusColor = isPhSafe ? 'text-emerald-700' : 'text-red-700';

  const chartData = (village.weeklyTrend || []).map((item, index) => ({
    date: `Oct ${index + 1}`,
    cases: item.cases,
  }));

  // Calculate 2 nearest monitoring stations
  const nearbyStations = (allVillages || [])
    .filter((v) => v.id !== village.id)
    .map((v) => ({
      ...v,
      dist: getDistanceKm(village.lat, village.lng, v.lat, v.lng),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 2);

  return (
    <div className="flex h-full flex-col justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
      <div>
        {/* Station Details Header */}
        <div className="border-b border-stone-100 pb-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Station details
            </span>
            <span
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {isAccessibleMode && <span>{isCritical ? '▲ ' : isWarning ? '◆ ' : '● '}</span>}
              {village.riskLevel}
            </span>
          </div>
          <h2 className="mt-0.5 text-base font-bold text-stone-900">{village.name}</h2>
          <p className="text-xs text-stone-500">
            {village.district} District &bull; Source: <span className="text-stone-700">{village.waterSource}</span>
          </p>
        </div>

        {/* 3 Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-lg border border-stone-200/70 bg-stone-50/70 p-2">
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
              <Droplets className="h-3 w-3 text-teal-700" />
              <span>Turbidity</span>
            </div>
            <p className="mt-0.5 text-base font-bold text-stone-900 leading-tight">
              {village.turbidityNTU} <span className="text-[10px] font-normal text-stone-500">NTU</span>
            </p>
            <span className={`text-[10px] font-medium ${village.turbidityNTU > 5 ? 'text-red-700' : 'text-emerald-700'}`}>
              {village.turbidityNTU > 5 ? '> 5.0 High' : '< 5.0 Normal'}
            </span>
          </div>

          <div className="rounded-lg border border-stone-200/70 bg-stone-50/70 p-2">
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
              <Activity className="h-3 w-3 text-teal-700" />
              <span>pH Level</span>
            </div>
            <p className="mt-0.5 text-base font-bold text-stone-900 leading-tight">{village.ph}</p>
            <span className={`text-[10px] font-medium ${phStatusColor}`}>
              {phStatusText}
            </span>
          </div>

          <div className="rounded-lg border border-stone-200/70 bg-stone-50/70 p-2">
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
              <AlertOctagon className="h-3 w-3 text-red-700" />
              <span>Coliform</span>
            </div>
            <p className="mt-0.5 text-base font-bold text-stone-900 leading-tight">
              {village.coliformCount} <span className="text-[9px] font-normal text-stone-500">CFU/100mL</span>
            </p>
            <span className={`text-[10px] font-medium ${village.coliformCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {village.coliformCount > 0 ? 'Contaminated' : 'Zero (Safe)'}
            </span>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="rounded-lg border border-stone-200/70 bg-stone-50/50 p-2.5 mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-800">
              7-day active cases trend
            </span>
            <span className="text-[10px] text-stone-500">
              Active: <strong className="text-stone-900">{village.activeCases}</strong>
            </span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="date" stroke="#a8a29e" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis stroke="#a8a29e" tick={{ fontSize: 9 }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [`${val} cases`, 'Reported']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#d6d3d1',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cases"
                  stroke={accentColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#chartFade)"
                  dot={{ r: 2.5, fill: accentColor }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Advisory Action Notice */}
        <div
          className="rounded-lg p-2.5 text-xs border mt-3"
          style={{
            backgroundColor: `${accentColor}0a`,
            borderColor: `${accentColor}25`,
          }}
        >
          <div className="flex items-center gap-1.5 font-bold" style={{ color: accentColor }}>
            {isCritical ? (
              <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
            ) : isWarning ? (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>
              {isCritical
                ? 'Do not drink untreated water'
                : isWarning
                ? 'Elevated turbidity watch'
                : 'Drinking water safe'}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-600">
            {isCritical
              ? 'Turbidity is high with bacterial contamination. Advise boiling immediately and give out chlorine tablets to affected households.'
              : isWarning
              ? 'Moderate silt runoff from monsoon rains. Filter water before household use.'
              : 'All physical and bacteriological tests are within acceptable drinking standards.'}
          </p>

          <button
            type="button"
            onClick={() => window.print()}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-stone-300 bg-white py-1 text-[11px] font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 cursor-pointer"
          >
            <Printer className="h-3 w-3 text-stone-500" />
            <span>Print dispatch notice</span>
          </button>
        </div>
      </div>

      {/* Footer Area: Fills empty space with live context */}
      <div className="border-t border-stone-100 pt-2 text-[11px] text-stone-500">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-stone-400" />
            <span>Last sync: 10:42 AM</span>
          </div>
          <span className="text-[10px] text-stone-400">Station ID: {village.id}</span>
        </div>

        {/* 2 Nearest Stations */}
        <div className="rounded-md bg-stone-50 p-2 border border-stone-200/60">
          <span className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider block mb-1">
            Nearest alternative stations
          </span>
          <div className="flex flex-col gap-1">
            {nearbyStations.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectVillage(s)}
                className="flex items-center justify-between text-left text-[11px] text-stone-700 hover:text-teal-900 cursor-pointer"
              >
                <span className="truncate">{s.name}</span>
                <span className="text-[10px] text-stone-400">{s.dist} km</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}