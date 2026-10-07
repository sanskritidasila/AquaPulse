import { useEffect, useRef, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';

function MapController({ selectedVillage, searchCoords }) {
  const map = useMap();
  const hasInitializedRef = useRef(false);

  const uttarakhandBounds = [
    [29.0, 77.8],
    [30.85, 80.3],
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (!hasInitializedRef.current) {
        map.fitBounds(uttarakhandBounds, {
          padding: [20, 20],
          maxZoom: 8.5,
        });
        hasInitializedRef.current = true;
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (searchCoords) {
      map.flyTo([searchCoords.lat, searchCoords.lng], 11, { duration: 1.2 });
    } else if (selectedVillage && hasInitializedRef.current) {
      map.flyTo([selectedVillage.lat, selectedVillage.lng], 9.2, { duration: 1.0 });
    }
  }, [selectedVillage, searchCoords, map]);

  return null;
}

// Generate accessible SVG glyph DivIcon for Field Mode on map
const createFieldGlyphIcon = (risk, isSelected) => {
  const glyph = risk === 'CRITICAL' ? '▲' : risk === 'WARNING' ? '◆' : '●';
  const bgColor = risk === 'CRITICAL' ? '#b91c1c' : risk === 'WARNING' ? '#c2410c' : '#15803d';
  const size = isSelected ? 24 : 18;
  const border = isSelected ? '2px solid #000000' : '1px solid #ffffff';

  return L.divIcon({
    className: 'field-glyph-pin',
    html: `<div style="background-color: ${bgColor}; width: ${size}px; height: ${size}px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: ${isSelected ? '11px' : '9px'}; font-weight: 800; border: ${border}; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${glyph}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

function MapSection({
  villages,
  selectedVillage,
  onSelectVillage,
  searchCoords,
  isAccessibleMode,
}) {
  const focusedCenter = [29.95, 79.25];

  const getMarkerColor = (risk) => {
    if (risk === 'CRITICAL') return '#b91c1c';
    if (risk === 'WARNING') return '#c2410c';
    return '#15803d';
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-stone-300 bg-stone-100 shadow-xs">
      <MapContainer
        center={focusedCenter}
        zoom={8}
        minZoom={7}
        maxBounds={[
          [28.0, 76.5],
          [31.5, 81.5],
        ]}
        scrollWheelZoom={true}
        wheelDebounceTime={120}
        zoomSnap={1}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={6}
          updateWhenIdle={false}
          maxZoom={18}
          minZoom={6}
        />

        <MapController
          selectedVillage={selectedVillage}
          searchCoords={searchCoords}
        />

        {/* Custom Searched Location Pin */}
        {searchCoords && (
          <CircleMarker
            center={[searchCoords.lat, searchCoords.lng]}
            radius={8}
            pathOptions={{
              color: '#0f766e',
              fillColor: '#2dd4bf',
              fillOpacity: 0.9,
              weight: 3,
            }}
          >
            <Popup>
              <div className="p-1 font-sans">
                <h3 className="font-bold text-xs text-stone-900">{searchCoords.displayName}</h3>
                <p className="text-[11px] text-teal-800 font-medium">Searched Location</p>
                <p className="text-[10px] text-stone-500 mt-0.5">No station deployed here.</p>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* All Monitored Stations */}
        {villages.map((village) => {
          const isSelected = selectedVillage?.id === village.id && !searchCoords;
          const color = getMarkerColor(village.riskLevel);

          if (isAccessibleMode) {
            return (
              <Marker
                key={village.id}
                position={[village.lat, village.lng]}
                icon={createFieldGlyphIcon(village.riskLevel, isSelected)}
                eventHandlers={{
                  click: () => onSelectVillage(village),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                  <span className="text-[10px] font-bold">{village.name}</span>
                </Tooltip>
              </Marker>
            );
          }

          return (
            <CircleMarker
              key={village.id}
              center={[village.lat, village.lng]}
              radius={isSelected ? 8 : 5}
              pathOptions={{
                color: isSelected ? '#1c1917' : color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: isSelected ? 2.5 : 1.5,
              }}
              eventHandlers={{
                click: () => onSelectVillage(village),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.9}>
                <span className="text-[10px] font-bold">{village.name}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default memo(MapSection);