/**
 * Profile API IPC wrapper for renderer process
 * Provides profile management functionality through IPC communication
 */

import type {
  AuthProfile,
  ProfileCreateRequest,
  ProfileUpdateRequest,
  ProfileLoginResult,
  ProfileStorageResult
} from '../../types/profile';

// Check if we're in Electron environment
const isElectron = typeof window !== 'undefined' && window.electronAPI;

/**
 * Initialize profile manager
 */
export async function initializeProfiles(): Promise<{ success: boolean; error?: string }> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  return await window.electronAPI.api.initializeProfiles();
}

/**
 * Get all profiles
 */
export async function getAllProfiles(): Promise<ProfileStorageResult<AuthProfile[]>> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  return await window.electronAPI.api.getAllProfiles();
}

/**
 * Get a specific profile
 */
export async function getProfile(profileId: string): Promise<ProfileStorageResult<AuthProfile>> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  return await window.electronAPI.api.getProfile(profileId);
}

/**
 * Create a new profile
 */
export async function createProfile(request: ProfileCreateRequest): Promise<ProfileStorageResult<AuthProfile>> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const result = await window.electronAPI.api.createProfile(request);
  
  if (result.success) {
    // Dispatch custom event to notify components of profile creation
    window.dispatchEvent(new CustomEvent('contextforge-profile-created', {
      detail: { profile: result.data }
    }));
  }
  
  return result;
}

/**
 * Update a profile
 */
export async function updateProfile(profileId: string, updates: ProfileUpdateRequest): Promise<ProfileStorageResult<AuthProfile>> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const result = await window.electronAPI.api.updateProfile(profileId, updates);
  
  if (result.success) {
    // Dispatch custom event to notify components of profile update
    window.dispatchEvent(new CustomEvent('contextforge-profile-updated', {
      detail: { profile: result.data }
    }));
  }
  
  return result;
}

/**
 * Delete a profile
 */
export async function deleteProfile(profileId: string): Promise<ProfileStorageResult<void>> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const result = await window.electronAPI.api.deleteProfile(profileId);
  
  if (result.success) {
    // Dispatch custom event to notify components of profile deletion
    window.dispatchEvent(new CustomEvent('contextforge-profile-deleted', {
      detail: { profileId }
    }));
  }
  
  return result;
}

/**
 * Switch to a different profile
 */
export async function switchProfile(profileId: string): Promise<ProfileLoginResult> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const result = await window.electronAPI.api.switchProfile(profileId);
  
  if (result.success) {
    // Dispatch custom event to notify components of profile switch
    window.dispatchEvent(new CustomEvent('contextforge-profile-switched', {
      detail: { profile: result.profile, token: result.token }
    }));
  }
  
  return result;
}

/**
 * Login with a specific profile
 */
export async function loginWithProfile(profileId: string): Promise<ProfileLoginResult> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const result = await window.electronAPI.api.loginWithProfile(profileId);
  
  if (result.success) {
    // Dispatch custom event to notify components of login
    window.dispatchEvent(new CustomEvent('contextforge-profile-login', {
      detail: { profile: result.profile, token: result.token }
    }));
  }
  
  return result;
}

/**
 * Logout from current profile
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const result = await window.electronAPI.api.logoutProfile();
  
  if (result.success) {
    // Dispatch custom event to notify components of logout
    window.dispatchEvent(new CustomEvent('contextforge-profile-logout'));
  }
  
  return result;
}

/**
 * Get current profile and authentication status
 */
export async function getCurrentProfile(): Promise<{
  success: boolean;
  data?: {
    profile: AuthProfile | null;
    token: string | null;
    isAuthenticated: boolean;
  };
  error?: string;
}> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  return await window.electronAPI.api.getCurrentProfile();
}

/**
 * Test profile credentials without saving
 */
export async function testCredentials(email: string, password: string, apiUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  return await window.electronAPI.api.testProfileCredentials(email, password, apiUrl);
}

/**
 * Profile event types for custom events
 */
export const PROFILE_EVENTS = {
  CREATED: 'contextforge-profile-created',
  UPDATED: 'contextforge-profile-updated',
  DELETED: 'contextforge-profile-deleted',
  SWITCHED: 'contextforge-profile-switched',
  LOGIN: 'contextforge-profile-login',
  LOGOUT: 'contextforge-profile-logout'
} as const;

/**
 * Helper to listen for profile events
 */
export function onProfileEvent(
  eventType: keyof typeof PROFILE_EVENTS,
  handler: (event: CustomEvent) => void
): () => void {
  const eventName = PROFILE_EVENTS[eventType];
  window.addEventListener(eventName, handler as EventListener);
  
  return () => {
    window.removeEventListener(eventName, handler as EventListener);
  };
}

/**
 * Helper to wait for profile initialization
 */
export async function waitForProfileInitialization(timeoutMs = 5000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const result = await getCurrentProfile();
      if (result.success) {
        return true;
      }
    } catch (error) {
      // Continue waiting
    }
    
    // Wait 100ms before trying again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}
