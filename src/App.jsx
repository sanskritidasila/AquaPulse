import { useState, useMemo } from 'react';
import villagesData from './data/villages.json';
import MapSection from './components/MapSection';
import AnalyticsDrawer from './components/AnalyticsDrawer';
import { 
  Search, 
  Eye, 
  AlertTriangle, 
  Users, 
  Loader2, 
  Navigation, 
  X,
  AlertCircle 
} from 'lucide-react';

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

export default function App() {
  const [selectedVillage, setSelectedVillage] = useState(villagesData[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  
  const [searchCoords, setSearchCoords] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [nearestNotice, setNearestNotice] = useState(null);

  const filteredVillages = useMemo(() => {
    return villagesData.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.district.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'ALL' || v.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [searchQuery, riskFilter]);

  const totalCases = useMemo(() => {
    return villagesData.reduce((acc, curr) => acc + curr.activeCases, 0);
  }, []);

  const criticalCount = useMemo(() => {
    return villagesData.filter((v) => v.riskLevel === 'CRITICAL').length;
  }, []);

  const handleGeocodeSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const localMatch = villagesData.find(
      (v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.district.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (localMatch) {
      setSelectedVillage(localMatch);
      setSearchCoords(null);
      setNearestNotice(null);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ', India'
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const place = data[0];
        const searchedLat = parseFloat(place.lat);
        const searchedLng = parseFloat(place.lon);
        const placeName = place.display_name.split(',')[0];
        const isUttarakhand = place.display_name.toLowerCase().includes('uttarakhand');

        let closestStation = villagesData[0];
        let minDistance = Infinity;

        villagesData.forEach((village) => {
          const dist = getDistanceKm(searchedLat, searchedLng, village.lat, village.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestStation = village;
          }
        });

        setSearchCoords({
          lat: searchedLat,
          lng: searchedLng,
          displayName: placeName,
        });

        setSelectedVillage(closestStation);

        setNearestNotice({
          searchedPlace: placeName,
          nearestName: closestStation.name,
          distanceKm: minDistance,
          isOutside: !isUttarakhand && minDistance > 120,
        });
      } else {
        setNearestNotice({ error: `Location "${searchQuery}" not found.` });
        setTimeout(() => setNearestNotice(null), 4000);
      }
    } catch {
      setNearestNotice({ error: 'Search network timeout. Check connection.' });
      setTimeout(() => setNearestNotice(null), 4000);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchCoords(null);
    setNearestNotice(null);
  };

  const handleStationClick = (village) => {
    setSelectedVillage(village);
    setSearchCoords(null);
    setNearestNotice(null);
  };

  return (
    // Locked viewport height on desktop, scrollable on mobile
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden flex-col bg-[#f7f5f0] text-stone-900 antialiased font-sans">
      {/* Top Navbar: Fixed height, does not shrink */}
      <header className="shrink-0 flex flex-wrap items-center justify-between border-b border-stone-200 bg-white px-4 py-2.5 shadow-2xs md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-900 text-white font-bold text-sm tracking-tight">
            AP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-stone-900">AquaPulse</span>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-200">
                Demo data
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Water quality & health surveillance across {villagesData.length} stations in Uttarakhand
            </p>
          </div>
        </div>

        {/* Dynamic Regional Counters */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 rounded border border-stone-200 bg-stone-50 px-2.5 py-1 text-stone-600">
            <Users className="h-3.5 w-3.5 text-stone-500" />
            <span>Active cases: <strong>{totalCases}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-red-800 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 text-red-700" />
            <span>{criticalCount} critical outposts</span>
          </div>
        </div>

        {/* Controls: Search, Risk Filters, and Field Mode */}
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
          <form onSubmit={handleGeocodeSearch} className="relative flex items-center">
            {isSearching ? (
              <Loader2 className="absolute left-2.5 h-3.5 w-3.5 animate-spin text-teal-800 pointer-events-none" />
            ) : (
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            )}
            <input
              type="text"
              placeholder="Search town in Uttarakhand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-56 rounded border border-stone-300 bg-stone-50 pl-8 pr-7 text-xs text-stone-800 placeholder-stone-400 focus:border-teal-800 focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 text-stone-400 hover:text-stone-700 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Risk Filters */}
          <div className="flex rounded border border-stone-200 bg-stone-100 p-0.5 text-xs">
            {['ALL', 'CRITICAL', 'WARNING', 'SAFE'].map((tier) => (
              <button
                key={tier}
                onClick={() => setRiskFilter(tier)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  riskFilter === tier
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Accessible Field Mode Switch */}
          <button
            onClick={() => setIsAccessibleMode(!isAccessibleMode)}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs border font-medium transition-all cursor-pointer ${
              isAccessibleMode
                ? 'border-stone-900 bg-stone-900 text-white font-bold'
                : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{isAccessibleMode ? 'Field Mode: ON' : 'Field Mode'}</span>
          </button>
        </div>
      </header>

      {/* Nearest Station Notification Banner */}
      {nearestNotice && (
        <div className={`shrink-0 border-b px-6 py-2 text-xs flex items-center justify-between shadow-2xs ${
          nearestNotice.isOutside ? 'bg-amber-100/80 border-amber-300 text-amber-950' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          {nearestNotice.error ? (
            <span className="text-red-700 font-medium">{nearestNotice.error}</span>
          ) : (
            <div className="flex items-center gap-2">
              {nearestNotice.isOutside ? (
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
              ) : (
                <Navigation className="h-4 w-4 text-teal-800 shrink-0" />
              )}
              <span>
                {nearestNotice.isOutside && (
                  <strong>Note: {nearestNotice.searchedPlace} is outside the Uttarakhand pilot zone ({nearestNotice.distanceKm} km away). </strong>
                )}
                Showing closest regional outpost: {' '}
                <strong className="underline text-stone-950">{nearestNotice.nearestName}</strong> ({nearestNotice.distanceKm} km away).
              </span>
            </div>
          )}
          <button
            onClick={() => setNearestNotice(null)}
            className="text-amber-800 hover:text-stone-950 font-bold cursor-pointer text-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Grid: min-h-0 prevents flex children from blowing out container height */}
      <main className="flex-1 min-h-0 grid grid-cols-1 gap-3 p-3 lg:grid-cols-12 lg:overflow-hidden">
        {/* Left Column: Independently scrollable on desktop */}
        <div className="lg:col-span-3 flex flex-col gap-1.5 overflow-y-auto h-[350px] lg:h-full pr-1">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-semibold text-stone-500">
              {filteredVillages.length} stations
            </span>
          </div>

          {filteredVillages.map((village) => {
            const isSelected = selectedVillage?.id === village.id && !searchCoords;
            const isCritical = village.riskLevel === 'CRITICAL';
            const isWarning = village.riskLevel === 'WARNING';

            const cardStyle = isSelected
              ? 'border-stone-900 bg-white ring-1 ring-stone-900 shadow-xs'
              : 'border-stone-200 bg-white hover:border-stone-400';

            const glyph = isCritical ? '▲' : isWarning ? '◆' : '●';
            const badgeColor = isCritical ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-emerald-700';

            return (
              <button
                key={village.id}
                onClick={() => handleStationClick(village)}
                className={`text-left rounded-lg p-2.5 border transition-all cursor-pointer ${cardStyle}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">{village.name}</span>
                  <span className={`text-[11px] font-bold ${badgeColor}`}>
                    {glyph} {village.riskLevel}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-stone-500">{village.district} District</p>
                <p className="mt-1 text-[11px] text-stone-700">
                  {isCritical ? (
                    <strong className="text-red-700 font-semibold">{village.activeCases} cases this week. Water unsafe.</strong>
                  ) : isWarning ? (
                    <span>{village.activeCases} cases &bull; Silt watch ({village.turbidityNTU} NTU)</span>
                  ) : (
                    <span className="text-emerald-800">Water clean &bull; 0 active cases</span>
                  )}
                </p>
              </button>
            );
          })}
        </div>

        {/* Center Column: Map stays pinned at full container height */}
        <div className="lg:col-span-5 h-[350px] lg:h-full min-h-[300px]">
          <MapSection
            villages={filteredVillages}
            selectedVillage={selectedVillage}
            onSelectVillage={handleStationClick}
            searchCoords={searchCoords}
            isAccessibleMode={isAccessibleMode}
          />
        </div>

        {/* Right Column: Analytics Drawer independently scrollable if needed */}
        <div className="lg:col-span-4 h-auto lg:h-full overflow-y-auto">
          <AnalyticsDrawer
            village={selectedVillage}
            allVillages={villagesData}
            onSelectVillage={handleStationClick}
            isAccessibleMode={isAccessibleMode}
          />
        </div>
      </main>

      {/* Persistent App Footer: Fixed height, does not shrink */}
      <footer className="shrink-0 border-t border-stone-200 bg-white/90 px-4 py-1.5 text-center text-[10px] text-stone-500">
        Demo simulation based on SIH25001 potable standards. Not intended for direct medical or government advisories.
      </footer>
    </div>
  );
}