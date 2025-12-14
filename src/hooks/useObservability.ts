import { useState, useEffect, useCallback } from 'react';
import { 
  Trace, 
  ObservabilityStats, 
  TraceFilters, 
  TimeSeriesMetric,
  TopPerformer,
  ToolUsageMetric,
  ToolChainMetric,
  SavedQuery
} from '../types/observability';

/**
 * Hook for fetching observability statistics
 */
export function useObservabilityStats(timeRange: string = '24h') {
  const [stats, setStats] = useState<ObservabilityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await window.electronAPI.api.getObservabilityStats({ time_range: timeRange });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch stats');
      }
      
      setStats(response.data || null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch observability stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

/**
 * Hook for fetching traces with filters
 */
export function useTraces(filters: TraceFilters = {}) {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTraces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await window.electronAPI.api.getTraces(filters);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch traces');
      }
      
      setTraces(response.data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch traces:', err);
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchTraces();
  }, [fetchTraces]);

  return { traces, isLoading, error, refetch: fetchTraces };
}

/**
 * Hook for fetching a single trace detail
 */
export function useTraceDetail(traceId: string | null) {
  const [trace, setTrace] = useState<Trace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrace = useCallback(async () => {
    if (!traceId) {
      setTrace(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await window.electronAPI.api.getTraceDetail(traceId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch trace detail');
      }
      
      setTrace(response.data || null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch trace detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [traceId]);

  useEffect(() => {
    fetchTrace();
  }, [fetchTrace]);

  return { trace, isLoading, error, refetch: fetchTrace };
}

/**
 * Hook for fetching time series metrics
 */
export function useTimeSeriesMetrics(timeRange: string = '24h', metric: string = 'duration') {
  const [data, setData] = useState<TimeSeriesMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await window.electronAPI.api.getTimeSeriesMetrics({
        time_range: timeRange,
        metric
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch time series metrics');
      }
      
      setData(response.data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch time series metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, metric]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook for fetching top slow endpoints
 */
export function useTopSlowEndpoints(timeRange: string = '24h', limit: number = 10) {
  const [endpoints, setEndpoints] = useState<TopPerformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await window.electronAPI.api.getTopSlowEndpoints({
        time_range: timeRange,
        limit
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch top slow endpoints');
      }
      
      setEndpoints(response.data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch top slow endpoints:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { endpoints, isLoading, error, refetch: fetchData };
}

/**
 * Hook for fetching tool usage metrics
 */
export function useToolUsageMetrics(timeRange: string = '24h') {
  const [tools, setTools] = useState<ToolUsageMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await window.electronAPI.api.getToolUsage({
        time_range: timeRange
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch tool usage');
      }
      
      setTools(response.data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch tool usage metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { tools, isLoading, error, refetch: fetchData };
}

/**
 * Hook for fetching tool chain analysis
 */
export function useToolChains(timeRange: string = '24h', minCount: number = 2) {
  const [chains, setChains] = useState<ToolChainMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await window.electronAPI.api.getToolChains({
        time_range: timeRange,
        min_count: minCount
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch tool chains');
      }
      
      setChains(response.data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch tool chains:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, minCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { chains, isLoading, error, refetch: fetchData };
}

/**
 * Hook for managing saved queries
 */
export function useSavedQueries() {
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQueries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await window.electronAPI.api.listSavedQueries();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to list saved queries');
      }
      
      setQueries(response.data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch saved queries:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveQuery = useCallback(async (name: string, description: string, filters: TraceFilters) => {
    try {
      const response = await window.electronAPI.api.saveQuery({
        name,
        description,
        filters
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to save query');
      }
      
      await fetchQueries();
      return response.data;
    } catch (err) {
      console.error('Failed to save query:', err);
      throw err;
    }
  }, [fetchQueries]);

  const deleteQuery = useCallback(async (queryId: string) => {
    try {
      const response = await window.electronAPI.api.deleteQuery(queryId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete query');
      }
      
      await fetchQueries();
    } catch (err) {
      console.error('Failed to delete query:', err);
      throw err;
    }
  }, [fetchQueries]);

  const useQuery = useCallback(async (queryId: string) => {
    try {
      const response = await window.electronAPI.api.useQuery(queryId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to use query');
      }
      
      return response.data;
    } catch (err) {
      console.error('Failed to use query:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  return { 
    queries, 
    isLoading, 
    error, 
    refetch: fetchQueries,
    saveQuery,
    deleteQuery,
    useQuery
  };
}

// Made with Bob
