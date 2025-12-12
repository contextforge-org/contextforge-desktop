/**
 * React hooks for profile management
 */

import { useState, useEffect, useCallback } from 'react';
import * as profileApi from '../lib/api/profile-api-ipc';
import type {
  AuthProfile,
  ProfileCreateRequest,
  ProfileUpdateRequest,
  ProfileLoginResult,
  ProfileStorageResult,
  ProfileEvent
} from '../types/profile';

/**
 * Hook for managing profiles
 */
export function useProfiles() {
  const [profiles, setProfiles] = useState<AuthProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profiles
  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await profileApi.getAllProfiles();
      if (result.success && result.data) {
        setProfiles(result.data);
      } else {
        setError(result.error || 'Failed to load profiles');
      }

      // Get current profile
      const current = await profileApi.getCurrentProfile();
      setCurrentProfile(current.data?.profile || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create profile
  const createProfile = useCallback(async (request: ProfileCreateRequest): Promise<ProfileStorageResult<AuthProfile>> => {
    const result = await profileApi.createProfile(request);
    if (result.success) {
      await loadProfiles(); // Refresh the list
    }
    return result;
  }, [loadProfiles]);

  // Update profile
  const updateProfile = useCallback(async (profileId: string, updates: ProfileUpdateRequest): Promise<ProfileStorageResult<AuthProfile>> => {
    const result = await profileApi.updateProfile(profileId, updates);
    if (result.success) {
      await loadProfiles(); // Refresh the list
    }
    return result;
  }, [loadProfiles]);

  // Delete profile
  const deleteProfile = useCallback(async (profileId: string): Promise<ProfileStorageResult<void>> => {
    const result = await profileApi.deleteProfile(profileId);
    if (result.success) {
      await loadProfiles(); // Refresh the list
    }
    return result;
  }, [loadProfiles]);

  // Switch profile
  const switchProfile = useCallback(async (profileId: string): Promise<ProfileLoginResult> => {
    const result = await profileApi.switchProfile(profileId);
    if (result.success) {
      await loadProfiles(); // Refresh the list
      setCurrentProfile(result.profile || null);
    }
    return result;
  }, [loadProfiles]);

  // Login with profile
  const loginWithProfile = useCallback(async (profileId: string): Promise<ProfileLoginResult> => {
    const result = await profileApi.loginWithProfile(profileId);
    if (result.success) {
      setCurrentProfile(result.profile || null);
    }
    return result;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await profileApi.logout();
    setCurrentProfile(null);
    await loadProfiles(); // Refresh to update active states
  }, [loadProfiles]);

  // Initialize on mount
  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Listen for profile events from other components
  useEffect(() => {
    const handleProfileCreated = () => loadProfiles();
    const handleProfileUpdated = () => loadProfiles();
    const handleProfileDeleted = () => loadProfiles();
    const handleProfileSwitched = () => loadProfiles();
    const handleProfileLogin = () => loadProfiles();

    window.addEventListener('contextforge-profile-created', handleProfileCreated);
    window.addEventListener('contextforge-profile-updated', handleProfileUpdated);
    window.addEventListener('contextforge-profile-deleted', handleProfileDeleted);
    window.addEventListener('contextforge-profile-switched', handleProfileSwitched);
    window.addEventListener('contextforge-profile-login', handleProfileLogin);

    return () => {
      window.removeEventListener('contextforge-profile-created', handleProfileCreated);
      window.removeEventListener('contextforge-profile-updated', handleProfileUpdated);
      window.removeEventListener('contextforge-profile-deleted', handleProfileDeleted);
      window.removeEventListener('contextforge-profile-switched', handleProfileSwitched);
      window.removeEventListener('contextforge-profile-login', handleProfileLogin);
    };
  }, [loadProfiles]);

  return {
    profiles,
    currentProfile,
    loading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
    loginWithProfile,
    logout,
    refresh: loadProfiles
  };
}

/**
 * Hook for the current profile only
 */
export function useCurrentProfile() {
  const [currentProfile, setCurrentProfile] = useState<AuthProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await profileApi.getCurrentProfile();
        
        if (result.success && result.data) {
          setCurrentProfile(result.data.profile);
          setAuthToken(result.data.token);
        }
      } catch (error) {
        console.error('Failed to initialize current profile:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const logout = useCallback(async () => {
    await profileApi.logout();
    setCurrentProfile(null);
    setAuthToken(null);
  }, []);

  return {
    currentProfile,
    authToken,
    loading,
    isAuthenticated: !!currentProfile && !!authToken,
    logout
  };
}

/**
 * Hook for profile authentication status
 */
export function useProfileAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<AuthProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const updateAuthState = async () => {
      const result = await profileApi.getCurrentProfile();
      
      if (result.success && result.data) {
        setCurrentProfile(result.data.profile);
        setAuthToken(result.data.token);
        setIsAuthenticated(result.data.isAuthenticated);
      } else {
        setCurrentProfile(null);
        setAuthToken(null);
        setIsAuthenticated(false);
      }
    };

    // Initial state
    updateAuthState();
  }, []);

  return {
    isAuthenticated,
    currentProfile,
    authToken
  };
}
