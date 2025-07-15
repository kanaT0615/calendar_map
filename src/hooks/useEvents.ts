import { useState, useEffect } from 'react';
import { Event } from '../types/Event';
import { supabase } from '../lib/supabase';
import { User } from '../types/User';

export const useEvents = (user: User | null) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // Load events from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }

    const loadEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (error) {
          console.error('Error loading events:', error);
        } else {
          setEvents(data || []);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
      setLoading(false);
    };

    loadEvents();
  }, [user]);

  const addEvent = async (eventData: Omit<Event, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{ ...eventData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error adding event:', error);
      } else {
        setEvents(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const updateEvent = async (eventId: string, eventData: Omit<Event, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event:', error);
      } else {
        setEvents(prev => prev.map(event => 
          event.id === eventId ? data : event
        ));
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting event:', error);
      } else {
        setEvents(prev => prev.filter(event => event.id !== eventId));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent
  };
};