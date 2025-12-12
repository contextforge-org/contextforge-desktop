/**
 * Backend Status Hook
 * Monitors backend health and connection status
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type BackendState = 'connecting' | 'ready' | 'error' | 'timeout';

export interface BackendStatus {
  state: BackendState;
  isReady: boolean;
  error?: string;
  attempts: number;
  maxAttempts: number;
  retry: () => void;
}

interface UseBackendStatusOptions {
  apiUrl?: string;
  maxAttempts?: number;
  initialDelay?: number;
  pollInterval?: number;
  timeoutMs?: number;
  skipCheck?: boolean; // Skip health check entirely (for external backend mode)
}

export function useBackendStatus(options: UseBackendStatusOptions = {}): BackendStatus {
  const {
    apiUrl = 'http://127.0.0.1:4444',
    maxAttempts = 60,
    initialDelay = 500,
    pollInterval = 500,
    timeoutMs = 30000,
    skipCheck = false
  } = options;

  const [state, setState] = useState<BackendState>(skipCheck ? 'ready' : 'connecting');
  const [error, setError] = useState<string | undefined>();
  const [attempts, setAttempts] = useState(0);
  const pollRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());
  const isActiveRef = useRef(true);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      // Use IPC to check health from main process (avoids CORS issues)
      if (window.electronAPI?.api?.checkBackendHealth) {
        const result = await window.electronAPI.api.checkBackendHealth();
        return result.success && result.isHealthy;
      }
      
      // Fallback to direct fetch if IPC not available (shouldn't happen in Electron)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (err) {
      // Connection refused, timeout, or other network error
      return false;
    }
  }, [apiUrl]);

  const startPolling = useCallback(() => {
    const poll = async () => {
      if (!isActiveRef.current) return;

      setAttempts(prev => prev + 1);

      const isHealthy = await checkHealth();

      if (!isActiveRef.current) return;

      if (isHealthy) {
        setState('ready');
        if (pollRef.current) clearTimeout(pollRef.current);
        return;
      }

      // Check if we've exceeded max attempts
      const currentAttempts = attempts + 1;
      if (currentAttempts >= maxAttempts) {
        setState('error');
        setError('Maximum connection attempts reached');
        if (pollRef.current) clearTimeout(pollRef.current);
        return;
      }

      // Check if we've exceeded timeout
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= timeoutMs) {
        setState('timeout');
        setError('Connection timeout - backend may not be starting');
        if (pollRef.current) clearTimeout(pollRef.current);
        return;
      }

      // Continue polling with exponential backoff after 10 attempts
      const delay = currentAttempts > 10 ? pollInterval * 2 : pollInterval;
      pollRef.current = setTimeout(poll, delay);
    };

    // Start polling after initial delay
    pollRef.current = setTimeout(poll, initialDelay);
  }, [attempts, checkHealth, maxAttempts, pollInterval, timeoutMs, initialDelay]);

  const retry = useCallback(() => {
    setState('connecting');
    setError(undefined);
    setAttempts(0);
    startTimeRef.current = Date.now();
    isActiveRef.current = true;
    startPolling();
  }, [startPolling]);

  useEffect(() => {
    // If skipCheck is true, immediately return ready state
    if (skipCheck) {
      setState('ready');
      return;
    }

    isActiveRef.current = true;
    startPolling();

    return () => {
      isActiveRef.current = false;
      if (pollRef.current) {
        clearTimeout(pollRef.current);
      }
    };
  }, [skipCheck, startPolling]);

  return {
    state,
    isReady: state === 'ready',
    error,
    attempts,
    maxAttempts,
    retry
  };
}