import { useState } from 'react';
import villagesData from './data/villages.json';
import MapSection from './components/MapSection';

export default function App() {
  // Store the currently clicked/selected village (defaults to first village)
  const [selectedVillage, setSelectedVillage] = useState(villagesData[0]);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-cyan-400">AquaPulse</h1>
          <p className="text-xs text-slate-400">
            Himalayan Geospatial Water & Outbreak Surveillance • Uttarakhand
          </p>
        </div>
        <div className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-300 border border-slate-700">
          Monitoring: <span className="font-bold text-cyan-400">{villagesData.length}</span> Outposts
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <main className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-3 overflow-hidden">
        {/* Left Column: Interactive Map (occupies 2 columns on larger screens) */}
        <div className="h-[450px] lg:col-span-2 lg:h-full">
          <MapSection
            villages={villagesData}
            selectedVillage={selectedVillage}
            onSelectVillage={setSelectedVillage}
          />
        </div>

        {/* Right Column: Village Cards */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Monitoring Stations
          </h2>

          {villagesData.map((village) => {
            const isSelected = selectedVillage?.id === village.id;
            return (
              <button
                key={village.id}
                onClick={() => setSelectedVillage(village)}
                className={`text-left rounded-lg p-3 border transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-slate-800 shadow-md ring-1 ring-cyan-400'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{village.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${
                      village.riskLevel === 'CRITICAL'
                        ? 'bg-red-950/80 text-red-400 border border-red-800'
                        : village.riskLevel === 'WARNING'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {village.riskLevel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">District: {village.district}</p>
                <div className="mt-2 flex justify-between text-xs text-slate-300">
                  <span>Cases: <strong>{village.activeCases}</strong></span>
                  <span>Turbidity: <strong>{village.turbidityNTU} NTU</strong></span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}