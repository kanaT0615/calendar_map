import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Event, CalendarDay } from '../types/Event';

interface CalendarProps {
  events: Event[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onAddEvent: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  events,
  selectedDate,
  onDateSelect,
  onAddEvent,
  onEventClick
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays: CalendarDay[] = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  }).map(date => ({
    date,
    isCurrentMonth: isSameMonth(date, currentMonth),
    events: events.filter(event => isSameDay(new Date(event.date), date))
  }));

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const getCategoryColor = (category: Event['category']) => {
    const colors = {
      work: 'bg-blue-500',
      personal: 'bg-green-500',
      social: 'bg-purple-500',
      health: 'bg-red-500',
      hobby: 'bg-orange-500',
      other: 'bg-gray-500'
    };
    return colors[category];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              min-h-[100px] p-2 border border-gray-100 cursor-pointer transition-all hover:bg-gray-50
              ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
              ${isSameDay(day.date, selectedDate) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              ${isToday(day.date) ? 'bg-blue-100' : ''}
            `}
            onClick={() => onDateSelect(day.date)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">
                {format(day.date, 'd')}
              </span>
              {day.isCurrentMonth && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEvent(day.date);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <div className="space-y-1">
              {day.events.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className={`
                    text-xs p-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity
                    ${getCategoryColor(event.category)}
                  `}
                  title={`${event.title} at ${event.time}`}
                >
                  <div className="truncate">{event.title}</div>
                  <div className="truncate opacity-75">{event.time}</div>
                </div>
              ))}
              {day.events.length > 2 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{day.events.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Date Events */}
      {events.filter(event => isSameDay(new Date(event.date), selectedDate)).length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <div className="space-y-2">
            {events
              .filter(event => isSameDay(new Date(event.date), selectedDate))
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="flex items-center space-x-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(event.category)}`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{event.title}</div>
                    <div className="text-sm text-gray-600">
                      {event.time} • {event.location_name}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};