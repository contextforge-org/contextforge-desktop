import { useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api/contextforge-api-ipc';
import { AggregatedMetrics } from '../types/metrics';
import { toast } from '../lib/toastWithTray';

export function useMetrics(refreshInterval: number = 30000) {
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getAggregatedMetrics();
      setMetrics(data);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast.error('Failed to load metrics: ' + errorMessage);
      console.error('Failed to fetch metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    lastRefresh,
    refetch: fetchMetrics
  };
}
