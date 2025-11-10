import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom charging station icon
const chargingIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" width="32" height="32">
      <path d="M14.5 11l-3 6v-4h-2l3-6v4h2M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2m0 18H7v-1h10v1m0-3H7V5h10v12z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom location icon
const locationIcon = (color = '#3b82f6') => new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28" height="28">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const MapView = ({ 
  chargingStation, 
  locations, 
  selectedRoute, 
  routePath,
  center,
  onLocationClick 
}) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map && routePath && routePath.length > 0) {
      const bounds = L.latLngBounds(routePath.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, routePath]);

  const bounds = [
    [15.3865, 73.8750], // Southwest coordinates (includes Main Gate)
    [15.3940, 73.8850]  // Northeast coordinates (includes Cafeteria)
  ];

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={16}
        maxZoom={18}
        minZoom={15}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.3}
        />

        {/* Charging Station Marker */}
        {chargingStation && (
          <Marker
            position={[chargingStation.lat, chargingStation.lng]}
            icon={chargingIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg text-primary">{chargingStation.name}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Type:</strong> {chargingStation.type}</p>
                  <p><strong>Power:</strong> {chargingStation.power} kW</p>
                  <p><strong>Connector:</strong> {chargingStation.connectorType}</p>
                  <p><strong>Status:</strong> 
                    <span className="ml-1 text-green-600 font-semibold">
                      {chargingStation.availability}
                    </span>
                  </p>
                  <p><strong>Elevation:</strong> {chargingStation.elevation}m</p>
                </div>
              </div>
            </Popup>
            <Circle
              center={[chargingStation.lat, chargingStation.lng]}
              radius={100}
              pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }}
            />
          </Marker>
        )}

        {/* Campus Location Markers */}
        {locations && locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={locationIcon('#3b82f6')}
            eventHandlers={{
              click: () => onLocationClick && onLocationClick(location),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{location.name}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Type:</strong> {location.type}</p>
                  <p><strong>Elevation:</strong> {location.elevation}m</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Path */}
        {routePath && routePath.length > 1 && (
          <>
            <Polyline
              positions={routePath.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: '#f59e0b',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10',
              }}
            />
            {/* Start marker */}
            <Circle
              center={[routePath[0].lat, routePath[0].lng]}
              radius={20}
              pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.8 }}
            />
            {/* End marker */}
            <Circle
              center={[routePath[routePath.length - 1].lat, routePath[routePath.length - 1].lng]}
              radius={20}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.8 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;

