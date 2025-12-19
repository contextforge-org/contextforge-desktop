/**
 * Profile Storage Service
 * Handles encrypted storage of profiles and credentials using electron-store
 */

import Store from 'electron-store';
import { randomBytes, createHash } from 'crypto';
import type {
  AuthProfile,
  ProfileCredentials,
  ProfileStore,
  ProfileStorageResult,
  ProfileCreateRequest,
  ProfileUpdateRequest
} from '../types/profile';
import { getContextForgeHome } from './common';

export class ProfileStorage {
  private contextforgeHome: string;
  private profileStore: Store<ProfileStore>;
  private credentialStore: Store<Record<string, ProfileCredentials>>;
  private encryptionKey: string;

  constructor() {
    // Profile files will be stored in the local backend's home directory so the
    // CLI can access them
    this.contextforgeHome = getContextForgeHome();

    // Generate or retrieve encryption key
    this.encryptionKey = this.getOrCreateEncryptionKey();

    // Initialize profile metadata store (non-sensitive data)
    this.profileStore = new Store<ProfileStore>({
      name: 'context-forge-profiles',
      cwd: this.contextforgeHome,
      defaults: {
        profiles: {},
        settings: {
          storageMethod: 'encrypted-store',
          requireMasterPassword: false,
          autoLockTimeout: 30,
          rememberLastProfile: true
        }
      },
      schema: {
        profiles: {
          type: 'object'
        },
        activeProfileId: {
          type: 'string'
        },
        settings: {
          type: 'object',
          properties: {
            storageMethod: {
              type: 'string',
              enum: ['encrypted-store', 'keychain']
            },
            requireMasterPassword: {
              type: 'boolean'
            },
            autoLockTimeout: {
              type: 'number',
              minimum: 1
            },
            rememberLastProfile: {
              type: 'boolean'
            }
          }
        }
      }
    });

    // Initialize encrypted credential store (sensitive data)
    this.credentialStore = new Store<Record<string, ProfileCredentials>>({
      name: 'context-forge-credentials',
      cwd: this.contextforgeHome,
      encryptionKey: this.encryptionKey,
      defaults: {}
    });
  }

  /**
   * Generate or retrieve encryption key for credential storage
   */
  private getOrCreateEncryptionKey(): string {
    const keyStore = new Store({ name: 'context-forge-keys', cwd: this.contextforgeHome });
    let key = keyStore.get('encryptionKey') as string;

    if (!key) {
      // Generate a new encryption key
      key = randomBytes(32).toString('hex');
      keyStore.set('encryptionKey', key);
      console.log('Generated new encryption key for profile storage');
    }

    return key;
  }

  /**
   * Create a new profile
   */
  async createProfile(request: ProfileCreateRequest): Promise<ProfileStorageResult<AuthProfile>> {
    try {
      const profileId = this.generateProfileId(request.email, request.apiUrl);

      // Check if profile already exists
      const existingProfiles = this.profileStore.get('profiles', {});
      if (existingProfiles[profileId]) {
        return {
          success: false,
          error: 'Profile with this email and API URL already exists'
        };
      }

      // Create profile metadata
      const profile: AuthProfile = {
        id: profileId,
        name: request.name,
        email: request.email,
        apiUrl: request.apiUrl,
        isActive: false,
        createdAt: new Date(),
        metadata: request.metadata
      };

      // Store profile metadata
      const profiles = { ...existingProfiles, [profileId]: profile };
      this.profileStore.set('profiles', profiles);

      // Store encrypted credentials
      const credentials: ProfileCredentials = {
        email: request.email,
        password: request.password
      };
      this.credentialStore.set(profileId, credentials);

      console.log(`Created profile: ${profile.name} (${profileId})`);

      return {
        success: true,
        data: profile
      };
    } catch (error) {
      console.error('Failed to create profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all profiles (without credentials)
   */
  async getAllProfiles(): Promise<ProfileStorageResult<AuthProfile[]>> {
    try {
      const profiles = this.profileStore.get('profiles', {});
      const profileList = Object.values(profiles);

      return {
        success: true,
        data: profileList
      };
    } catch (error) {
      console.error('Failed to get profiles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get a specific profile by ID
   */
  async getProfile(profileId: string): Promise<ProfileStorageResult<AuthProfile>> {
    try {
      const profiles = this.profileStore.get('profiles', {});
      const profile = profiles[profileId];

      if (!profile) {
        return {
          success: false,
          error: 'Profile not found'
        };
      }

      return {
        success: true,
        data: profile
      };
    } catch (error) {
      console.error('Failed to get profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get profile credentials
   */
  async getProfileCredentials(profileId: string): Promise<ProfileStorageResult<ProfileCredentials>> {
    try {
      const credentials = this.credentialStore.get(profileId);
      
      if (!credentials) {
        return {
          success: false,
          error: 'Credentials not found for profile'
        };
      }

      return {
        success: true,
        data: credentials
      };
    } catch (error) {
      console.error('Failed to get profile credentials:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update a profile
   */
  async updateProfile(profileId: string, updates: ProfileUpdateRequest): Promise<ProfileStorageResult<AuthProfile>> {
    try {
      const profiles = this.profileStore.get('profiles', {});
      const existingProfile = profiles[profileId];

      if (!existingProfile) {
        return {
          success: false,
          error: 'Profile not found'
        };
      }

      // Update profile metadata
      const updatedProfile: AuthProfile = {
        ...existingProfile,
        ...updates,
        id: profileId, // Ensure ID doesn't change
        lastUsed: new Date()
      };

      profiles[profileId] = updatedProfile;
      this.profileStore.set('profiles', profiles);

      // Update credentials if password changed
      if (updates.password) {
        const existingCredentials = this.credentialStore.get(profileId);
        if (existingCredentials) {
          const updatedCredentials: ProfileCredentials = {
            ...existingCredentials,
            email: updates.email || existingCredentials.email,
            password: updates.password
          };
          this.credentialStore.set(profileId, updatedCredentials);
        }
      }

      console.log(`Updated profile: ${updatedProfile.name} (${profileId})`);

      return {
        success: true,
        data: updatedProfile
      };
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
      const profiles = this.profileStore.get('profiles', {});

      if (!profiles[profileId]) {
        return {
          success: false,
          error: 'Profile not found'
        };
      }

      // Remove from profiles
      delete profiles[profileId];
      this.profileStore.set('profiles', profiles);

      // Remove credentials
      this.credentialStore.delete(profileId);

      // Clear active profile if it was the deleted one
      const activeProfileId = this.profileStore.get('activeProfileId');
      if (activeProfileId === profileId) {
        this.profileStore.delete('activeProfileId');
      }

      console.log(`Deleted profile: ${profileId}`);

      return {
        success: true
      };
    } catch (error) {
      console.error('Failed to delete profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Set active profile
   */
  async setActiveProfile(profileId: string): Promise<ProfileStorageResult<void>> {
    try {
      const profiles = this.profileStore.get('profiles', {});

      if (!profiles[profileId]) {
        return {
          success: false,
          error: 'Profile not found'
        };
      }

      // Update all profiles to inactive
      Object.keys(profiles).forEach(id => {
        if (profiles[id]) {
          profiles[id].isActive = false;
        }
      });

      // Set the selected profile as active
      if (profiles[profileId]) {
        profiles[profileId].isActive = true;
        profiles[profileId].lastUsed = new Date();
      }

      this.profileStore.set('profiles', profiles);
      this.profileStore.set('activeProfileId', profileId);

      console.log(`Set active profile: ${profileId}`);

      return {
        success: true
      };
    } catch (error) {
      console.error('Failed to set active profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get active profile
   */
  async getActiveProfile(): Promise<ProfileStorageResult<AuthProfile>> {
    try {
      const activeProfileId = this.profileStore.get('activeProfileId');

      if (!activeProfileId) {
        return {
          success: false,
          error: 'No active profile set'
        };
      }

      return await this.getProfile(activeProfileId);
    } catch (error) {
      console.error('Failed to get active profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate a unique profile ID based on email and API URL
   */
  private generateProfileId(email: string, apiUrl: string): string {
    const data = `${email}:${apiUrl}`;
    return createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  /**
   * Get storage settings
   */
  getSettings(): ProfileStore['settings'] {
    return this.profileStore.get('settings');
  }

  /**
   * Update storage settings
   */
  updateSettings(settings: Partial<ProfileStore['settings']>): void {
    const currentSettings = this.profileStore.get('settings');
    this.profileStore.set('settings', { ...currentSettings, ...settings });
  }

  /**
   * Clear all profiles and credentials (for testing/reset)
   */
  async clearAll(): Promise<void> {
    this.profileStore.clear();
    this.credentialStore.clear();
    console.log('Cleared all profiles and credentials');
  }

  /**
   * Export profiles (without credentials for security)
   */
  async exportProfiles(): Promise<ProfileStorageResult<AuthProfile[]>> {
    try {
      const result = await this.getAllProfiles();
      if (!result.success || !result.data) {
        return result;
      }

      // Remove sensitive data for export
      const exportData = result.data.map(profile => ({
        ...profile,
        // Don't export credentials, just metadata
      }));

      return {
        success: true,
        data: exportData
      };
    } catch (error) {
      console.error('Failed to export profiles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance
export const profileStorage = new ProfileStorage();
