/**
 * Profile Manager Service
 * Handles profile management business logic and coordinates with storage and authentication
 */

import { EventEmitter } from 'events';
import { profileStorage } from './ProfileStorage';
import * as mainApi from '../lib/api/contextforge-api-main';
import type {
  AuthProfile,
  ProfileCreateRequest,
  ProfileUpdateRequest,
  ProfileLoginResult,
  ProfileStorageResult,
  ProfileEvent,
  ProfileEventHandler,
  ProfileValidationResult
} from '../types/profile';

export class ProfileManager extends EventEmitter {
  private currentProfile: AuthProfile | null = null;
  private authToken: string | null = null;
  private isInitialized = false;

  constructor() {
    super();
  }

  /**
   * Initialize the profile manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if we need to migrate from .env credentials first
      await this.migrateFromEnvCredentials();

      // Try to load and login with the active profile
      const activeProfileResult = await profileStorage.getActiveProfile();
      if (activeProfileResult.success && activeProfileResult.data) {
        const profile = activeProfileResult.data;
        console.log(`Found active profile: ${profile.name}, attempting to login...`);
        
        // Login with the active profile to restore session
        const loginResult = await this.loginWithProfile(profile.id);
        if (loginResult.success) {
          console.log(`Successfully logged in with profile: ${profile.name}`);
        } else {
          console.warn(`Failed to auto-login with profile: ${loginResult.error}`);
          // Still set the profile even if login fails, user can manually retry
          this.currentProfile = profile;
        }
      } else {
        console.log('No active profile found');
      }

      this.isInitialized = true;
      console.log('ProfileManager initialized');
    } catch (error) {
      console.error('Failed to initialize ProfileManager:', error);
      throw error;
    }
  }

  /**
   * Create or update the internal profile for the embedded backend
   */
  async ensureInternalProfile(skipCredentialTest = true): Promise<ProfileLoginResult> {
    const INTERNAL_PROFILE_NAME = 'Internal Backend';
    const INTERNAL_API_URL = 'http://127.0.0.1:4444';
    const INTERNAL_EMAIL = 'admin@example.com';
    const INTERNAL_PASSWORD = 'changeme';

    try {
      // Check if internal profile already exists
      const allProfiles = await profileStorage.getAllProfiles();
      let internalProfile: AuthProfile | undefined;

      if (allProfiles.success && allProfiles.data) {
        internalProfile = allProfiles.data.find(
          p => p.name === INTERNAL_PROFILE_NAME || p.apiUrl === INTERNAL_API_URL
        );
      }

      if (internalProfile) {
        // Profile exists, update credentials if needed and login
        console.log('Internal profile found, logging in...');
        const updateResult = await profileStorage.updateProfile(internalProfile.id, {
          email: INTERNAL_EMAIL,
          apiUrl: INTERNAL_API_URL,
          metadata: {
            ...internalProfile.metadata,
            environment: 'local',
            description: 'Embedded backend server'
          }
        });

        if (!updateResult.success) {
          console.warn('Failed to update internal profile:', updateResult.error);
        }

        // Update credentials by updating the profile with password
        const credentialsResult = await profileStorage.updateProfile(internalProfile.id, {
          password: INTERNAL_PASSWORD
        });

        if (!credentialsResult.success) {
          console.warn('Failed to update internal profile credentials:', credentialsResult.error);
        }

        // Login with the profile (will handle password change if needed)
        return await this.loginWithProfile(internalProfile.id);
      } else {
        // Create new internal profile - always skip credential test for internal backend
        console.log('Creating internal profile (skipping credential test)...');
        
        // Create profile directly in storage without going through createProfile
        // which would test credentials
        const createResult = await profileStorage.createProfile({
          name: INTERNAL_PROFILE_NAME,
          email: INTERNAL_EMAIL,
          password: INTERNAL_PASSWORD,
          apiUrl: INTERNAL_API_URL,
          metadata: {
            environment: 'local',
            description: 'Embedded backend server',
            icon: '🏠'
          }
        });

        if (createResult.success && createResult.data) {
          console.log('Internal profile created successfully');
          // Try to login (will handle password change if needed)
          const loginResult = await this.loginWithProfile(createResult.data.id);
          return loginResult;
        } else {
          return {
            success: false,
            error: createResult.error || 'Failed to create internal profile'
          };
        }
      }
    } catch (error) {
      console.error('Failed to ensure internal profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a new profile
   */
  async createProfile(request: ProfileCreateRequest): Promise<ProfileStorageResult<AuthProfile>> {
    try {
      // Validate the profile data
      const validation = this.validateProfileData(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Test the credentials before saving
      const testResult = await this.testProfileCredentials(request.email, request.password, request.apiUrl);
      if (!testResult.success) {
        return {
          success: false,
          error: `Authentication test failed: ${testResult.error}`
        };
      }

      // Create the profile
      const result = await profileStorage.createProfile(request);
      if (result.success && result.data) {
        // Automatically login with the newly created profile
        const loginResult = await this.loginWithProfile(result.data.id);
        if (loginResult.success) {
          // Set as active profile
          await profileStorage.setActiveProfile(result.data.id);
          console.log(`Profile created and activated: ${result.data.name}`);
        } else {
          console.warn(`Profile created but auto-login failed: ${loginResult.error}`);
        }
        
        this.emit('profile-created', { type: 'profile-created', profile: result.data });
      }

      return result;
    } catch (error) {
      console.error('Failed to create profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all profiles
   */
  async getAllProfiles(): Promise<ProfileStorageResult<AuthProfile[]>> {
    return await profileStorage.getAllProfiles();
  }

  /**
   * Get a specific profile
   */
  async getProfile(profileId: string): Promise<ProfileStorageResult<AuthProfile>> {
    return await profileStorage.getProfile(profileId);
  }

  /**
   * Update a profile
   */
  async updateProfile(profileId: string, updates: ProfileUpdateRequest): Promise<ProfileStorageResult<AuthProfile>> {
    try {
      // If password is being updated, test the new credentials
      if (updates.password) {
        const profileResult = await profileStorage.getProfile(profileId);
        if (!profileResult.success || !profileResult.data) {
          return {
            success: false,
            error: 'Profile not found'
          };
        }

        const email = updates.email || profileResult.data.email;
        const apiUrl = updates.apiUrl || profileResult.data.apiUrl;
        
        const testResult = await this.testProfileCredentials(email, updates.password, apiUrl);
        if (!testResult.success) {
          return {
            success: false,
            error: `Authentication test failed: ${testResult.error}`
          };
        }
      }

      const result = await profileStorage.updateProfile(profileId, updates);
      if (result.success && result.data) {
        // Update current profile if it's the one being updated
        if (this.currentProfile?.id === profileId) {
          this.currentProfile = result.data;
        }
        
        this.emit('profile-updated', { type: 'profile-updated', profile: result.data });
        console.log(`Profile updated: ${result.data.name}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a profile
   */
  async deleteProfile(profileId: string): Promise<ProfileStorageResult<void>> {
    try {
      // Don't allow deleting the currently active profile
      if (this.currentProfile?.id === profileId) {
        return {
          success: false,
          error: 'Cannot delete the currently active profile. Switch to another profile first.'
        };
      }

      const result = await profileStorage.deleteProfile(profileId);
      if (result.success) {
        this.emit('profile-deleted', { type: 'profile-deleted', profileId });
        console.log(`Profile deleted: ${profileId}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to delete profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Switch to a different profile
   */
  async switchProfile(profileId: string): Promise<ProfileLoginResult> {
    try {
      // Get the profile
      const profileResult = await profileStorage.getProfile(profileId);
      if (!profileResult.success || !profileResult.data) {
        return {
          success: false,
          error: 'Profile not found'
        };
      }

      // Login with the profile
      const loginResult = await this.loginWithProfile(profileId);
      if (loginResult.success) {
        // Set as active profile
        await profileStorage.setActiveProfile(profileId);
        this.currentProfile = profileResult.data;
        
        this.emit('profile-switched', { type: 'profile-switched', profile: profileResult.data });
        console.log(`Switched to profile: ${profileResult.data.name}`);
      }

      return loginResult;
    } catch (error) {
      console.error('Failed to switch profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Change password for a user
   */
  private async changePassword(oldPassword: string, newPassword: string, token: string, apiUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Use fetch directly to call the password change endpoint
      const response = await fetch(`${apiUrl}/auth/email/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      });

      if (response.ok) {
        console.log('Password changed successfully');
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.detail || `Password change failed: ${response.status}` 
      };
    } catch (error) {
      console.error('Failed to change password:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Login with a specific profile
   */
  async loginWithProfile(profileId: string): Promise<ProfileLoginResult> {
    try {
      // Get profile and credentials
      const profileResult = await profileStorage.getProfile(profileId);
      const credentialsResult = await profileStorage.getProfileCredentials(profileId);

      if (!profileResult.success || !profileResult.data) {
        return {
          success: false,
          error: 'Profile not found'
        };
      }

      if (!credentialsResult.success || !credentialsResult.data) {
        return {
          success: false,
          error: 'Profile credentials not found'
        };
      }

      const profile = profileResult.data;
      const credentials = credentialsResult.data;

      // Configure API client for this profile's API URL
      const { setApiBaseUrl } = await import('../lib/api/contextforge-api-main');
      setApiBaseUrl(profile.apiUrl);
      
      // Attempt login - use fetch directly to handle 403 password change errors
      try {
        const loginResponse = await fetch(`${profile.apiUrl}/auth/email/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        });

        const responseData = await loginResponse.json();
        console.log('Login response status:', loginResponse.status);
        console.log('Login response data:', JSON.stringify(responseData, null, 2));
        
        // Check if we got a token despite error status
        const token = responseData?.access_token;
        
        // Check if this is a password change required error (even without token)
        if (!loginResponse.ok && responseData?.detail?.toLowerCase().includes('password change required')) {
          console.log('Password change required detected');
          
          // If we don't have a token, we can't proceed with password change
          // This means the backend doesn't return a token with the 403 error
          // We need to handle this differently - perhaps by directly modifying the database
          if (!token) {
            console.error('No token provided with password change requirement');
            return {
              success: false,
              error: 'Password change required but no authentication token provided. This is a backend configuration issue - the backend should either not require password changes for the default admin user, or should provide a token with the 403 response.'
            };
          }
          
          console.log('Attempting to clear password change flag...');
          
          // Change password to the same password (to clear the password_change_required flag)
          const changeResult = await this.changePassword(
            credentials.password,
            credentials.password,
            token,
            profile.apiUrl
          );
          
          if (changeResult.success) {
            console.log('Password change flag cleared successfully, retrying login...');
            // Retry login - this should now succeed
            return await this.loginWithProfile(profileId);
          } else {
            console.error('Failed to change password:', changeResult.error);
            return {
              success: false,
              error: `Password change failed: ${changeResult.error}`
            };
          }
        }
        
        if (token) {
          // Normal successful login
          this.authToken = token;
          this.currentProfile = profile;
          
          // Update the main API client's auth token
          const { setAuthToken } = await import('../lib/api/contextforge-api-main');
          setAuthToken(token);
          
          // Mark this profile as active in storage
          await profileStorage.setActiveProfile(profileId);
          
          this.emit('profile-login-success', {
            type: 'profile-login-success',
            profile,
            token
          });
          
          return {
            success: true,
            profile,
            token
          };
        }
        
        // No token in response
        return {
          success: false,
          error: responseData?.detail || 'Login failed - no token received'
        };
      } catch (loginError: any) {
        console.error('Login error:', loginError);
        throw loginError;
      }

      this.emit('profile-login-failed', { 
        type: 'profile-login-failed', 
        profileId, 
        error: 'Login failed - invalid response' 
      });

      return {
        success: false,
        error: 'Login failed - invalid response'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.emit('profile-login-failed', { 
        type: 'profile-login-failed', 
        profileId, 
        error: errorMessage 
      });

      console.error('Failed to login with profile:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get the current active profile
   */
  getCurrentProfile(): AuthProfile | null {
    return this.currentProfile;
  }

  /**
   * Get the current auth token
   */
  getCurrentToken(): string | null {
    return this.authToken;
  }

  /**
   * Logout from current profile
   */
  async logout(): Promise<void> {
    this.currentProfile = null;
    this.authToken = null;
    
    // Clear the main API client's auth token
    const { setAuthToken } = await import('../lib/api/contextforge-api-main');
    setAuthToken(null);
    
    // Clear the active profile
    const profiles = await profileStorage.getAllProfiles();
    if (profiles.success && profiles.data) {
      for (const profile of profiles.data) {
        if (profile.isActive) {
          await profileStorage.updateProfile(profile.id, { isActive: false });
        }
      }
    }
    
    this.emit('profile-logout', { type: 'profile-logout' });
    console.log('Logged out from current profile');
  }

  /**
   * Test profile credentials without saving (public method for UI)
   */
  async testCredentials(email: string, password: string, apiUrl: string): Promise<{ success: boolean; error?: string }> {
    return this.testProfileCredentials(email, password, apiUrl);
  }

  /**
   * Test profile credentials without saving (internal)
   */
  private async testProfileCredentials(email: string, password: string, apiUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Temporarily configure API client with the test API URL
      const { setApiBaseUrl, getApiBaseUrl } = await import('../lib/api/contextforge-api-main');
      const originalUrl = getApiBaseUrl();
      setApiBaseUrl(apiUrl);
      
      const response = await mainApi.login(email, password);
      
      // Restore original URL
      setApiBaseUrl(originalUrl);
      
      if (response) {
        return { success: true };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  /**
   * Validate profile data
   */
  private validateProfileData(data: ProfileCreateRequest): ProfileValidationResult {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Profile name is required');
    }

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.password?.trim()) {
      errors.push('Password is required');
    }

    if (!data.apiUrl?.trim()) {
      errors.push('API URL is required');
    } else if (!this.isValidUrl(data.apiUrl)) {
      errors.push('Invalid API URL format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Migrate from .env credentials to profile system
   */
  private async migrateFromEnvCredentials(): Promise<void> {
    try {
      // Check if we already have profiles
      const existingProfiles = await profileStorage.getAllProfiles();
      if (existingProfiles.success && existingProfiles.data && existingProfiles.data.length > 0) {
        return; // Already have profiles, no migration needed
      }

      // Check for .env credentials
      const envEmail = process.env['VITE_API_EMAIL'];
      const envPassword = process.env['VITE_API_PASSWORD'];
      const envApiUrl = process.env['VITE_API_URL'] || 'http://localhost:4444';

      if (envEmail && envPassword) {
        console.log('Migrating .env credentials to profile system...');
        
        const migrationProfile: ProfileCreateRequest = {
          name: 'Default Profile (Migrated)',
          email: envEmail,
          password: envPassword,
          apiUrl: envApiUrl,
          metadata: {
            description: 'Automatically migrated from .env configuration',
            environment: 'local'
          }
        };

        const result = await this.createProfile(migrationProfile);
        if (result.success && result.data) {
          // Set as active profile
          await profileStorage.setActiveProfile(result.data.id);
          this.currentProfile = result.data;
          
          console.log('Successfully migrated .env credentials to profile system');
          console.log('Consider removing VITE_API_EMAIL and VITE_API_PASSWORD from your .env file');
        }
      }
    } catch (error) {
      console.error('Failed to migrate .env credentials:', error);
    }
  }

  /**
   * Add event listener for profile events
   */
  onProfileEvent(handler: ProfileEventHandler): void {
    this.on('profile-created', handler);
    this.on('profile-updated', handler);
    this.on('profile-deleted', handler);
    this.on('profile-switched', handler);
    this.on('profile-login-success', handler);
    this.on('profile-login-failed', handler);
  }

  /**
   * Remove event listener
   */
  offProfileEvent(handler: ProfileEventHandler): void {
    this.off('profile-created', handler);
    this.off('profile-updated', handler);
    this.off('profile-deleted', handler);
    this.off('profile-switched', handler);
    this.off('profile-login-success', handler);
    this.off('profile-login-failed', handler);
  }
}

// Singleton instance
export const profileManager = new ProfileManager();
