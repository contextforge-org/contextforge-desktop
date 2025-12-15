/**
 * Profile management types for multi-profile authentication
 */

export interface AuthProfile {
  id: string;
  name: string;
  email: string;
  apiUrl: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  metadata?: {
    description?: string;
    environment?: 'production' | 'staging' | 'development' | 'local';
    color?: string; // For UI theming
    icon?: string; // For profile identification
    isInternal?: boolean; // Whether this is the embedded backend profile
  };
}

export interface ProfileCredentials {
  email: string;
  password: string;
}

export interface ProfileStore {
  profiles: Record<string, AuthProfile>;
  activeProfileId?: string;
  settings: {
    storageMethod: 'encrypted-store' | 'keychain';
    requireMasterPassword: boolean;
    autoLockTimeout: number; // minutes
    rememberLastProfile: boolean;
  };
}

export interface ProfileCreateRequest {
  name: string;
  email: string;
  password: string;
  apiUrl: string;
  metadata?: AuthProfile['metadata'];
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  password?: string;
  apiUrl?: string;
  isActive?: boolean;
  metadata?: AuthProfile['metadata'];
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProfileLoginResult {
  success: boolean;
  profile?: AuthProfile;
  token?: string;
  error?: string;
}

export interface ProfileStorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Events for profile management
export type ProfileEvent = 
  | { type: 'profile-created'; profile: AuthProfile }
  | { type: 'profile-updated'; profile: AuthProfile }
  | { type: 'profile-deleted'; profileId: string }
  | { type: 'profile-switched'; profile: AuthProfile }
  | { type: 'profile-login-success'; profile: AuthProfile; token: string }
  | { type: 'profile-login-failed'; profileId: string; error: string }
  | { type: 'profiles-imported'; count: number }
  | { type: 'profiles-exported'; count: number };

export type ProfileEventHandler = (event: ProfileEvent) => void;
