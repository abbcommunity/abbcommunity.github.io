import { useState, useEffect } from 'react';
import { EventDoc } from '../types/backend';
import { eventService } from '../services/eventService';

export const useEvents = () => {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data event.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
};
