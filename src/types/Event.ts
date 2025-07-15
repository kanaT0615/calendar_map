export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  location_name: string;
  location_address: string;
  location_lat: number;
  location_lng: number;
  category: 'work' | 'personal' | 'social' | 'health' | 'hobby' | 'other';
  created_at?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
}