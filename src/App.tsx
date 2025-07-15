import React, { useState } from 'react';
import { Calendar as CalendarIcon, Map as MapIcon, Plus, LogOut, User } from 'lucide-react';
import { Calendar } from './components/Calendar';
import { Map } from './components/Map';
import { EventModal } from './components/EventModal';
import { AuthModal } from './components/AuthModal';
import { useEvents } from './hooks/useEvents';
import { useAuth } from './hooks/useAuth';
import { Event } from './types/Event';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [activeView, setActiveView] = useState<'calendar' | 'map'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [modalDefaultDate, setModalDefaultDate] = useState<Date | undefined>();

  const { events, loading: eventsLoading, addEvent, updateEvent, deleteEvent } = useEvents(user);

  const handleAddEvent = (date?: Date) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setModalDefaultDate(date);
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingEvent(event);
    setModalDefaultDate(undefined);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    setEditingEvent(undefined);
    setModalDefaultDate(undefined);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    if (activeView === 'calendar') {
      setSelectedDate(new Date(event.date));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSelectedEvent(undefined);
    setIsModalOpen(false);
    setEditingEvent(undefined);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">EventMapper</h1>
                <span className="text-sm text-gray-500">Track your events with location</span>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </header>

        {/* Welcome Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to EventMapper
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Organize your events with both time and location. Create, manage, and visualize 
              your schedule on an interactive calendar and map.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <CalendarIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Calendar View</h3>
                <p className="text-gray-600">
                  Organize your events by date and time with an intuitive calendar interface.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <MapIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Map View</h3>
                <p className="text-gray-600">
                  Visualize event locations on an interactive map with detailed markers.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Get Started
            </button>
          </div>
        </main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">EventMapper</h1>
              <span className="text-sm text-gray-500">
                Welcome, {user.email}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {events.length} event{events.length !== 1 ? 's' : ''}
              </span>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('calendar')}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md transition-all
                    ${activeView === 'calendar' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={() => setActiveView('map')}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md transition-all
                    ${activeView === 'map' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <MapIcon className="w-4 h-4" />
                  <span>Map</span>
                </button>
              </div>

              {/* Add Event Button */}
              <button
                onClick={() => handleAddEvent()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your events...</p>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar/Map View */}
          <div className="lg:col-span-2">
            {activeView === 'calendar' ? (
              <Calendar
                events={events}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onAddEvent={handleAddEvent}
                onEventClick={handleEventClick}
              />
            ) : (
              <Map
                events={events}
                onEventClick={handleEventClick}
                selectedEvent={selectedEvent}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Events</span>
                  <span className="font-semibold text-gray-800">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-gray-800">
                    {events.filter(event => {
                      const eventDate = new Date(event.date);
                      const now = new Date();
                      return eventDate.getMonth() === now.getMonth() && 
                             eventDate.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upcoming</span>
                  <span className="font-semibold text-gray-800">
                    {events.filter(event => new Date(event.date) >= new Date()).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {events
                  .filter(event => new Date(event.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-800">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </div>
                      <div className="text-sm text-gray-500">{event.location_name}</div>
                    </div>
                  ))}
                {events.filter(event => new Date(event.date) >= new Date()).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No upcoming events</p>
                )}
              </div>
            </div>

            {/* Selected Event Details */}
            {selectedEvent && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Event Details</h3>
                  <button
                    onClick={() => handleEditEvent(selectedEvent)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-800">{selectedEvent.title}</h4>
                    {selectedEvent.description && (
                      <p className="text-gray-600 text-sm mt-1">{selectedEvent.description}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Time:</strong> {selectedEvent.time}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Location:</strong> {selectedEvent.location.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Location:</strong> {selectedEvent.location_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Address:</strong> {selectedEvent.location_address}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Category:</strong> 
                    <span className="capitalize ml-1">{selectedEvent.category}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </main>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(undefined);
          setModalDefaultDate(undefined);
        }}
        onSave={handleSaveEvent}
        onDelete={deleteEvent}
        event={editingEvent}
        defaultDate={modalDefaultDate}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignIn={signIn}
        onSignUp={signUp}
      />
    </div>
  );
}

export default App;