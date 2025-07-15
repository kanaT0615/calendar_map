import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Event } from '../types/Event';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  selectedEvent?: Event;
}

const MapController: React.FC<{ events: Event[]; selectedEvent?: Event }> = ({ events, selectedEvent }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedEvent) {
      map.setView([selectedEvent.location_lat, selectedEvent.location_lng], 15);
    } else if (events.length > 0) {
      const group = new L.FeatureGroup();
      events.forEach(event => {
        const marker = L.marker([event.location_lat, event.location_lng]);
        group.addLayer(marker);
      });
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [map, events, selectedEvent]);

  return null;
};

export const Map: React.FC<MapProps> = ({ events, onEventClick, selectedEvent }) => {
  const mapRef = useRef<L.Map>(null);

  const getCategoryColor = (category: Event['category']) => {
    const colors = {
      work: '#3B82F6',
      personal: '#10B981',
      social: '#8B5CF6',
      health: '#EF4444',
      hobby: '#F59E0B',
      other: '#6B7280'
    };
    return colors[category];
  };

  const createCustomIcon = (category: Event['category'], isSelected: boolean = false) => {
    const color = getCategoryColor(category);
    const size = isSelected ? 35 : 25;
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${size > 25 ? '14px' : '12px'};
          ${isSelected ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${category.charAt(0).toUpperCase()}
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Event Locations</h2>
        <p className="text-gray-600 mt-1">
          {events.length} event{events.length !== 1 ? 's' : ''} on the map
        </p>
      </div>
      
      <div className="h-[600px] relative">
        <MapContainer
          ref={mapRef}
          center={[35.4437, 139.6380]} // Default to Yokohama, Japan
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController events={events} selectedEvent={selectedEvent} />
          
          {events.map(event => (
            <Marker
              key={event.id}
              position={[event.location_lat, event.location_lng]}
              icon={createCustomIcon(event.category, selectedEvent?.id === event.id)}
              eventHandlers={{
                click: () => onEventClick(event),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-gray-600 mb-2">{event.description}</p>
                  )}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">Date:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">Time:</span>
                      <span className="ml-2 text-gray-600">{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-600">{event.location_name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">Category:</span>
                      <span 
                        className="ml-2 px-2 py-1 rounded-full text-xs text-white"
                        style={{ backgroundColor: getCategoryColor(event.category) }}
                      >
                        {event.category}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
        <div className="flex flex-wrap gap-3">
          {['work', 'personal', 'social', 'health', 'hobby', 'other'].map(category => (
            <div key={category} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: getCategoryColor(category as Event['category']) }}
              />
              <span className="text-sm text-gray-600 capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};