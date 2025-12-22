import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationData } from '../types';

// Fix for default Leaflet marker icons in React without module loaders for images
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
}

// Helper component to handle map flyTo animations
const MapController: React.FC<{ selectedLocation: LocationData | null }> = ({ selectedLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 10, {
        duration: 1.5
      });
    }
  }, [selectedLocation, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ locations, selectedLocation, onSelectLocation }) => {
  const defaultPosition: [number, number] = [31.7683, 35.2137]; // Jerusalem

  return (
    <MapContainer 
      center={defaultPosition} 
      zoom={7} 
      scrollWheelZoom={true} 
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController selectedLocation={selectedLocation} />

      {locations.map((loc) => (
        <Marker 
          key={loc.id} 
          position={[loc.latitude, loc.longitude]}
          eventHandlers={{
            click: () => onSelectLocation(loc),
          }}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-lg text-gray-800">{loc.name}</h3>
              <p className="text-sm text-gray-600">{loc.shortDescription}</p>
              <button 
                onClick={() => onSelectLocation(loc)}
                className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                查看詳細經節
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;