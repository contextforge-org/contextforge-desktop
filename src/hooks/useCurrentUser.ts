import { useState, useEffect } from 'react';
import * as api from '../lib/api/contextforge-api-ipc';
import type { EmailUserResponse } from '../lib/contextforge-client-ts';

export function useCurrentUser() {
  const [user, setUser] = useState<EmailUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('useCurrentUser: Fetching user data via IPC...');
        setLoading(true);
        const userData = await api.getCurrentUser();
        console.log('useCurrentUser: User data received:', userData);
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('useCurrentUser: Failed to fetch user:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user'));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch - always try since auth is handled by IPC layer
    console.log('useCurrentUser: Initial mount, fetching user');
    fetchUser();

    // Listen for custom login event
    const handleLogin = () => {
      console.log('useCurrentUser: Login event received, refetching user');
      fetchUser();
    };

    window.addEventListener('contextforge-login', handleLogin);

    return () => {
      window.removeEventListener('contextforge-login', handleLogin);
    };
  }, []);

  return { user, loading, error };
}
