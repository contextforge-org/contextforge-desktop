import { useState, useEffect } from 'react';
import * as api from '../lib/api/contextforge-api-ipc';
import { withAuth } from '../lib/api/auth-helper';
import type { EmailUserResponse } from '../lib/contextforge-client-ts';

export function useCurrentUser() {
  const [user, setUser] = useState<EmailUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('useCurrentUser: Fetching user data via IPC with auth...');
        setLoading(true);
        
        // Use withAuth wrapper to handle authentication automatically
        const userData = await withAuth(
          () => api.getCurrentUser(),
          'Failed to fetch current user'
        );
        
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

    // Initial fetch - withAuth will handle authentication
    console.log('useCurrentUser: Initial mount, fetching user');
    fetchUser();

    // Listen for profile-related events
    const handleProfileEvent = () => {
      console.log('useCurrentUser: Profile event received, refetching user');
      fetchUser();
    };

    // Listen for both legacy and new profile events
    window.addEventListener('contextforge-login', handleProfileEvent);
    window.addEventListener('contextforge-profile-login', handleProfileEvent);
    window.addEventListener('contextforge-profile-switched', handleProfileEvent);

    return () => {
      window.removeEventListener('contextforge-login', handleProfileEvent);
      window.removeEventListener('contextforge-profile-login', handleProfileEvent);
      window.removeEventListener('contextforge-profile-switched', handleProfileEvent);
    };
  }, []);

  return { user, loading, error };
}
