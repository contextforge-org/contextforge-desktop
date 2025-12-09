# Multi-Profile Authentication System

## Overview

The Context Forge Electron application now supports multiple authentication profiles, allowing users to easily switch between different backend environments and accounts without editing configuration files.

## Features

### ✨ Key Capabilities

- **Multiple Profiles**: Create and manage unlimited authentication profiles
- **Quick Switching**: Switch between profiles with a single click
- **Secure Storage**: Credentials encrypted using `electron-store`
- **Environment Tags**: Label profiles by environment (Production, Staging, Development, Local)
- **Auto-Migration**: Automatically migrates existing `.env` credentials to profile system
- **Profile Metadata**: Add descriptions and custom metadata to profiles
- **Last Used Tracking**: See when each profile was last accessed

### 🔒 Security Features

- **Encrypted Credentials**: Passwords stored with AES encryption
- **Separate Storage**: Credentials stored separately from profile metadata
- **Auto-generated Keys**: Encryption keys automatically generated and secured
- **Future Support**: Architecture ready for OS keychain integration (Phase 2)

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                         │
├─────────────────────────────────────────────────────────────┤
│  UI Components                                               │
│  ├── ProfileSelector (TopNav dropdown)                       │
│  ├── ProfileForm (Create/Edit)                              │
│  └── ProfileManagementPage (Full management interface)       │
├─────────────────────────────────────────────────────────────┤
│  React Hooks                                                 │
│  ├── useProfiles() - Complete profile management            │
│  ├── useCurrentProfile() - Current profile state            │
│  └── useProfileAuth() - Authentication status               │
├─────────────────────────────────────────────────────────────┤
│  IPC API Wrapper                                             │
│  └── profile-api-ipc.ts - Type-safe IPC communication       │
└─────────────────────────────────────────────────────────────┘
                              ↕ IPC
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
├─────────────────────────────────────────────────────────────┤
│  Profile Manager                                             │
│  ├── Business logic                                          │
│  ├── Validation                                              │
│  ├── Event emission                                          │
│  └── Auto-migration                                          │
├─────────────────────────────────────────────────────────────┤
│  Profile Storage                                             │
│  ├── Encrypted credential storage                            │
│  ├── Profile metadata storage                                │
│  └── CRUD operations                                         │
└─────────────────────────────────────────────────────────────┘
```

### Data Structure

```typescript
interface AuthProfile {
  id: string;                    // Unique identifier (hash of email + API URL)
  name: string;                  // Display name
  email: string;                 // Login email
  apiUrl: string;                // Backend API URL
  isActive: boolean;             // Currently active profile
  createdAt: Date;               // Creation timestamp
  lastUsed?: Date;               // Last usage timestamp
  metadata?: {
    description?: string;        // User notes
    environment?: string;        // Environment tag
    color?: string;              // UI color (future)
    icon?: string;               // UI icon (future)
  };
}
```

### Storage

**Profile Metadata** (`context-forge-profiles.json`):
- Non-sensitive profile information
- Settings and preferences
- Active profile ID

**Encrypted Credentials** (`context-forge-credentials.json`):
- Encrypted with AES-256
- Separate file for security
- Auto-generated encryption key

**Encryption Key** (`context-forge-keys.json`):
- Auto-generated on first use
- Used to encrypt/decrypt credentials

## Usage

### For Users

#### Creating a Profile

1. Click the profile selector in the top navigation
2. Select "Add Profile"
3. Fill in the form:
   - **Profile Name**: Descriptive name (e.g., "Production", "Local Dev")
   - **Email**: Your login email
   - **Password**: Your password
   - **API URL**: Backend URL (e.g., `http://localhost:4444`)
   - **Environment**: Tag for organization
   - **Description**: Optional notes
4. Click "Create Profile"

#### Switching Profiles

**Method 1: Quick Switch (TopNav)**
1. Click the profile selector
2. Select the profile you want to switch to
3. Authentication happens automatically

**Method 2: Profile Management Page**
1. Navigate to Settings → Profiles
2. Click "Switch" on the desired profile

#### Managing Profiles

1. Click profile selector → "Manage Profiles"
2. View all profiles with details
3. Edit, delete, or switch profiles
4. Active profile is highlighted

#### Migrating from .env

On first launch, the system automatically:
1. Detects `.env` credentials
2. Creates "Default Profile (Migrated)"
3. Sets it as active
4. Suggests removing `.env` credentials

### For Developers

#### Using Profile Hooks

```typescript
import { useProfiles } from '../hooks/useProfiles';

function MyComponent() {
  const {
    profiles,           // All profiles
    currentProfile,     // Active profile
    loading,            // Loading state
    error,              // Error state
    createProfile,      // Create new profile
    updateProfile,      // Update existing profile
    deleteProfile,      // Delete profile
    switchProfile,      // Switch to different profile
    loginWithProfile,   // Login with specific profile
    logout,             // Logout current profile
    refresh             // Refresh profile list
  } = useProfiles();

  // Use the hooks...
}
```

#### Creating Profiles Programmatically

```typescript
const result = await createProfile({
  name: 'Production',
  email: 'user@example.com',
  password: 'secure-password',
  apiUrl: 'https://api.production.com',
  metadata: {
    environment: 'production',
    description: 'Production environment'
  }
});

if (result.success) {
  console.log('Profile created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

#### Listening to Profile Events

```typescript
import { profileManager } from '../services/ProfileManager';

profileManager.onProfileEvent((event) => {
  switch (event.type) {
    case 'profile-created':
      console.log('New profile:', event.profile);
      break;
    case 'profile-switched':
      console.log('Switched to:', event.profile);
      break;
    case 'profile-login-success':
      console.log('Login successful:', event.token);
      break;
  }
});
```

## API Reference

### Profile Manager

```typescript
class ProfileManager {
  // Initialize the manager
  async initialize(): Promise<void>
  
  // Profile CRUD
  async createProfile(request: ProfileCreateRequest): Promise<ProfileStorageResult<AuthProfile>>
  async getAllProfiles(): Promise<ProfileStorageResult<AuthProfile[]>>
  async getProfile(profileId: string): Promise<ProfileStorageResult<AuthProfile>>
  async updateProfile(profileId: string, updates: ProfileUpdateRequest): Promise<ProfileStorageResult<AuthProfile>>
  async deleteProfile(profileId: string): Promise<ProfileStorageResult<void>>
  
  // Authentication
  async switchProfile(profileId: string): Promise<ProfileLoginResult>
  async loginWithProfile(profileId: string): Promise<ProfileLoginResult>
  async logout(): Promise<void>
  
  // State
  getCurrentProfile(): AuthProfile | null
  getCurrentToken(): string | null
  
  // Events
  onProfileEvent(handler: ProfileEventHandler): void
  offProfileEvent(handler: ProfileEventHandler): void
}
```

### Profile Storage

```typescript
class ProfileStorage {
  // Profile operations
  async createProfile(request: ProfileCreateRequest): Promise<ProfileStorageResult<AuthProfile>>
  async getAllProfiles(): Promise<ProfileStorageResult<AuthProfile[]>>
  async getProfile(profileId: string): Promise<ProfileStorageResult<AuthProfile>>
  async getProfileCredentials(profileId: string): Promise<ProfileStorageResult<ProfileCredentials>>
  async updateProfile(profileId: string, updates: ProfileUpdateRequest): Promise<ProfileStorageResult<AuthProfile>>
  async deleteProfile(profileId: string): Promise<ProfileStorageResult<void>>
  
  // Active profile management
  async setActiveProfile(profileId: string): Promise<ProfileStorageResult<void>>
  async getActiveProfile(): Promise<ProfileStorageResult<AuthProfile>>
  
  // Settings
  getSettings(): ProfileStore['settings']
  updateSettings(settings: Partial<ProfileStore['settings']>): void
  
  // Utility
  async exportProfiles(): Promise<ProfileStorageResult<AuthProfile[]>>
  async clearAll(): Promise<void>
}
```

## Configuration

### Storage Settings

```typescript
interface ProfileSettings {
  storageMethod: 'encrypted-store' | 'keychain';  // Storage method
  requireMasterPassword: boolean;                  // Master password (future)
  autoLockTimeout: number;                         // Auto-lock timeout in minutes
  rememberLastProfile: boolean;                    // Remember last used profile
}
```

### Environment Variables

The system still supports `.env` for initial setup:

```env
# Will be auto-migrated to profile on first launch
VITE_API_EMAIL=admin@example.com
VITE_API_PASSWORD=changeme
VITE_API_URL=http://localhost:4444
```

## Security Best Practices

### For Users

1. **Use Strong Passwords**: Each profile should have a strong, unique password
2. **Limit Production Access**: Only create production profiles on trusted devices
3. **Regular Cleanup**: Delete unused profiles
4. **Verify URLs**: Always verify API URLs before saving

### For Developers

1. **Never Log Credentials**: Ensure passwords are never logged
2. **Validate Input**: Always validate profile data before storage
3. **Test Connections**: Test credentials before saving profiles
4. **Handle Errors**: Gracefully handle authentication failures
5. **Clear Memory**: Clear sensitive data from memory after use

## Troubleshooting

### Profile Not Switching

**Symptom**: Profile selector shows new profile but authentication fails

**Solutions**:
1. Verify credentials are correct
2. Check API URL is accessible
3. Review browser console for errors
4. Try logging out and back in

### Credentials Not Saved

**Symptom**: Profile created but login fails

**Solutions**:
1. Ensure password was entered correctly
2. Check encryption key exists
3. Verify storage permissions
4. Try recreating the profile

### Migration Issues

**Symptom**: .env credentials not migrated

**Solutions**:
1. Manually create profile with .env values
2. Check .env file format
3. Verify VITE_ prefix on variables
4. Review console for migration errors

## Future Enhancements

### Phase 2 Features

- **OS Keychain Integration**: Use macOS Keychain, Windows Credential Manager, Linux Secret Service
- **Master Password**: Optional master password for all profiles
- **Biometric Auth**: Touch ID / Windows Hello support
- **Profile Sync**: Sync profiles across devices (encrypted)
- **Profile Templates**: Pre-configured profile templates
- **Profile Groups**: Organize profiles into groups
- **Quick Switch Shortcuts**: Keyboard shortcuts for profile switching
- **Session Management**: Multiple concurrent sessions
- **Audit Logging**: Track profile access and changes

### Planned Improvements

- Profile import/export with encryption
- Profile sharing (credentials excluded)
- Custom profile colors and icons
- Profile usage analytics
- Auto-lock on inactivity
- Two-factor authentication support

## Contributing

When contributing to the profile system:

1. **Maintain Security**: Never compromise credential security
2. **Test Thoroughly**: Test all profile operations
3. **Update Docs**: Keep documentation current
4. **Follow Patterns**: Use existing patterns and conventions
5. **Handle Errors**: Provide clear error messages

## Support

For issues or questions:

1. Check this documentation
2. Review console logs
3. Check GitHub issues
4. Create new issue with details

## License

Same as Context Forge Electron project license.