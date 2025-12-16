/**
 * Backend server preferences
 * Simple settings for controlling the embedded Python backend
 */

/**
 * Configuration for a specific plugin
 */
export interface PluginConfig {
  enabled: boolean;
  mode?: 'enforce' | 'permissive' | 'disabled';
  config?: Record<string, unknown>;
}

export interface BackendPreferences {
  /**
   * Whether to automatically start the embedded Python backend on app launch
   * When false, the backend must be started manually or an external backend must be used
   */
  autoStartEmbedded: boolean;
  
  /**
   * Global plugin system toggle
   * When false, all plugins are disabled regardless of individual settings
   */
  enablePlugins: boolean;
  
  /**
   * Per-plugin configuration settings
   * Key is the plugin name, value is the plugin configuration
   */
  pluginConfigs: Record<string, PluginConfig>;
}

/**
 * Default backend preferences
 */
export const DEFAULT_BACKEND_PREFERENCES: BackendPreferences = {
  autoStartEmbedded: true,
  enablePlugins: true,  // Enable plugins by default so they show in UI
  pluginConfigs: {},
};