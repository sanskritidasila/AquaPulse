import { useEffect, useRef, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';

function MapController({ selectedVillage, searchCoords }) {
  const map = useMap();
  const hasInitializedRef = useRef(false);

  // Exact framing for Uttarakhand
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
      map.flyTo([selectedVillage.lat, selectedVillage.lng], 9.5, { duration: 1.0 });
    }
  }, [selectedVillage, searchCoords, map]);

  return null;
}

// Generates custom HTML div icons for Field Mode
const createGlyphIcon = (risk, isSelected) => {
  const glyph = risk === 'CRITICAL' ? '▲' : risk === 'WARNING' ? '◆' : '●';
  const bgColor = risk === 'CRITICAL' ? '#b91c1c' : risk === 'WARNING' ? '#c2410c' : '#15803d';
  const size = isSelected ? 26 : 22;
  const border = isSelected ? '2px solid #000000' : '1.5px solid #ffffff';

  return L.divIcon({
    className: 'custom-glyph-pin-wrapper',
    html: `<div class="custom-glyph-pin" style="background-color: ${bgColor}; width: ${size}px; height: ${size}px; border: ${border};">${glyph}</div>`,
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
        zoomSnap={1} // Integer snap removes subpixel seam lines
        className="h-full w-full"
      >
        {/* Crisp, clean basemap without boundary label clutter */}
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
            radius={9}
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

        {/* Stations: Uses DivIcon in Field Mode, CircleMarker in Standard View */}
        {villages.map((village) => {
          const isSelected = selectedVillage?.id === village.id && !searchCoords;
          const color = getMarkerColor(village.riskLevel);

          if (isAccessibleMode) {
            return (
              <Marker
                key={village.id}
                position={[village.lat, village.lng]}
                icon={createGlyphIcon(village.riskLevel, isSelected)}
                eventHandlers={{
                  click: () => onSelectVillage(village),
                }}
              >
                <Popup className="font-sans">
                  <div className="p-1">
                    <h3 className="font-bold text-xs text-stone-900">{village.name}</h3>
                    <p className="text-[11px] text-stone-600">{village.district} District</p>
                    <p className="text-[11px] mt-1 font-semibold" style={{ color }}>
                      Status: {village.riskLevel}
                    </p>
                    <p className="text-[11px] text-stone-600">Active Cases: {village.activeCases}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }

          return (
            <CircleMarker
              key={village.id}
              center={[village.lat, village.lng]}
              radius={isSelected ? 9 : 6}
              pathOptions={{
                color: isSelected ? '#1c1917' : color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onSelectVillage(village),
              }}
            >
              <Popup className="font-sans">
                <div className="p-1">
                  <h3 className="font-bold text-xs text-stone-900">{village.name}</h3>
                  <p className="text-[11px] text-stone-600">{village.district} District</p>
                  <p className="text-[11px] mt-1 font-semibold" style={{ color }}>
                    Status: {village.riskLevel}
                  </p>
                  <p className="text-[11px] text-stone-600">Active Cases: {village.activeCases}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default memo(MapSection);