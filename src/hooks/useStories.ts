import { useState, useEffect } from 'react';
import { StoryDoc } from '../types/backend';
import { storyService } from '../services/storyService';

export const useStories = (includeDrafts = false) => {
  const [stories, setStories] = useState<StoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const data = await storyService.getAllStories(includeDrafts);
      setStories(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat artikel cerita.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [includeDrafts]);

  return { stories, loading, error, refetch: fetchStories };
};
