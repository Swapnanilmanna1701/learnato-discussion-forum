import { useEffect, useRef, useCallback } from 'react';

interface UseRealtimeUpdatesOptions {
  endpoint: string;
  interval?: number;
  onUpdate?: (data: any) => void;
  enabled?: boolean;
}

export function useRealtimeUpdates({
  endpoint,
  interval = 5000,
  onUpdate,
  enabled = true,
}: UseRealtimeUpdatesOptions) {
  const previousDataRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) return;
      
      const data = await response.json();
      const dataString = JSON.stringify(data);

      // Check if data has changed
      if (previousDataRef.current !== null && previousDataRef.current !== dataString) {
        onUpdate?.(data);
      }

      previousDataRef.current = dataString;
    } catch (error) {
      console.error('Error fetching real-time updates:', error);
    }
  }, [endpoint, onUpdate]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval, enabled]);

  return { refetch: fetchData };
}
