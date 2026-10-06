import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export default function MapSection({ villages, selectedVillage, onSelectVillage }) {
  // Real coordinates centered over Uttarakhand's mountain districts
  const uttarakhandCenter = [30.3, 79.1];

  // Pick marker color based on risk severity
  const getMarkerColor = (risk) => {
    if (risk === 'CRITICAL') return '#ef4444'; // Red
    if (risk === 'WARNING') return '#f59e0b';  // Amber
    return '#10b981';                         // Emerald Green
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-800 shadow-lg">
      <MapContainer
        center={uttarakhandCenter}
        zoom={8}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Free, official OpenStreetMap tiles with no API key requirement */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render a circular pin for every village */}
        {villages.map((village) => {
          const isSelected = selectedVillage?.id === village.id;
          const color = getMarkerColor(village.riskLevel);

          return (
            <CircleMarker
              key={village.id}
              center={[village.lat, village.lng]}
              radius={isSelected ? 12 : 8}
              pathOptions={{
                color: isSelected ? '#38bdf8' : color, // Cyan border highlight when selected
                fillColor: color,
                fillOpacity: 0.85,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectVillage(village),
              }}
            >
              <Popup className="text-slate-900">
                <div className="p-1">
                  <h3 className="font-bold text-sm text-slate-900">{village.name}</h3>
                  <p className="text-xs text-slate-600">District: {village.district}</p>
                  <p className="text-xs mt-1">
                    Risk: <strong style={{ color }}>{village.riskLevel}</strong>
                  </p>
                  <p className="text-xs">Active Cases: {village.activeCases}</p>
                  <p className="text-xs">Turbidity: {village.turbidityNTU} NTU</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}