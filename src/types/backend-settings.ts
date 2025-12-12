/**
 * Backend server preferences
 * Simple settings for controlling the embedded Python backend
 */

export interface BackendPreferences {
  /**
   * Whether to automatically start the embedded Python backend on app launch
   * When false, the backend must be started manually or an external backend must be used
   */
  autoStartEmbedded: boolean;
}

/**
 * Default backend preferences
 */
export const DEFAULT_BACKEND_PREFERENCES: BackendPreferences = {
  autoStartEmbedded: true,
};