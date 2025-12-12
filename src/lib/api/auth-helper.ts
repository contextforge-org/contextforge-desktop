/**
 * Authentication Helper
 * Provides profile-based authentication for components
 */

import * as profileApi from './profile-api-ipc';
import * as api from './contextforge-api-ipc';

/**
 * Attempt to authenticate using the current profile
 * If no profile is active, this will fail gracefully
 */
export async function ensureAuthenticated(): Promise<boolean> {
  try {
    // Check if we have a current profile
    const profileResult = await profileApi.getCurrentProfile();
    
    if (!profileResult.success || !profileResult.data) {
      console.error('No active profile found');
      return false;
    }

    const { profile, isAuthenticated } = profileResult.data;

    // If already authenticated, we're good
    if (isAuthenticated && profile) {
      return true;
    }

    // If we have a profile but not authenticated, try to login
    if (profile) {
      console.log('Attempting to authenticate with profile:', profile.name);
      const loginResult = await profileApi.loginWithProfile(profile.id);
      
      if (loginResult.success) {
        console.log('Successfully authenticated with profile:', profile.name);
        return true;
      } else {
        console.error('Failed to authenticate with profile:', loginResult.error);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

/**
 * Wrapper for API calls that automatically handles authentication
 * Retries once with authentication if the first call fails with auth error
 */
export async function withAuth<T>(
  apiCall: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    // Try the API call first
    return await apiCall();
  } catch (error) {
    const errorMsg = (error as Error).message;
    
    // Check if it's an authentication error
    if (
      errorMsg.includes('Authorization') ||
      errorMsg.includes('authenticated') ||
      errorMsg.includes('401') ||
      errorMsg.includes('403')
    ) {
      console.log('Authentication required, attempting to authenticate...');
      
      // Try to authenticate
      const authenticated = await ensureAuthenticated();
      
      if (authenticated) {
        // Retry the API call
        try {
          return await apiCall();
        } catch (retryError) {
          throw new Error(
            errorMessage || 
            `Failed after authentication: ${(retryError as Error).message}`
          );
        }
      } else {
        throw new Error(
          'Authentication failed. Please create a profile or check your credentials.'
        );
      }
    }
    
    // If it's not an auth error, just throw it
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const profileResult = await profileApi.getCurrentProfile();
    return profileResult.success && profileResult.data?.isAuthenticated === true;
  } catch {
    return false;
  }
}

/**
 * Get current profile information
 */
export async function getCurrentProfile() {
  const result = await profileApi.getCurrentProfile();
  if (result.success && result.data) {
    return result.data.profile;
  }
  return null;
}
