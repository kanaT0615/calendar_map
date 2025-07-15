import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Calendar, Tag, FileText } from 'lucide-react';
import { Event } from '../types/Event';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  onDelete?: (eventId: string) => void;
  event?: Event;
  defaultDate?: Date;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  defaultDate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    locationName: '',
    locationAddress: '',
    locationLat: 40.7128,
    locationLng: -74.0060,
    category: 'other' as Event['category']
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        date: event.date,
        time: event.time,
        locationName: event.location_name,
        locationAddress: event.location_address,
        locationLat: event.location_lat,
        locationLng: event.location_lng,
        category: event.category
      });
    } else if (defaultDate) {
      setFormData(prev => ({
        ...prev,
        date: defaultDate.toISOString().split('T')[0],
        time: '09:00'
      }));
    }
  }, [event, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: Omit<Event, 'id'> = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location_name: formData.locationName,
      location_address: formData.locationAddress,
      location_lat: formData.locationLat,
      location_lng: formData.locationLng,
      category: formData.category
    };
    
    onSave(eventData);
    onClose();
  };

  const handleLocationSearch = async () => {
    if (!formData.locationAddress) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.locationAddress)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const location = data[0];
        setFormData(prev => ({
          ...prev,
          locationLat: parseFloat(location.lat),
          locationLng: parseFloat(location.lon),
          locationName: prev.locationName || location.display_name.split(',')[0]
        }));
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Event Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter event description"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location Name
            </label>
            <input
              type="text"
              required
              value={formData.locationName}
              onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Coffee Shop, Office, Home"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                value={formData.locationAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, locationAddress: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full address"
              />
              <button
                type="button"
                onClick={handleLocationSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Find
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Event['category'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="social">Social</option>
              <option value="health">Health</option>
              <option value="hobby">Hobby</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div>
              {event && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(event.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete Event
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};