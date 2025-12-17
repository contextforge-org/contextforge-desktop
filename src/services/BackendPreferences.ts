/**
 * Backend Preferences Service
 * Simple storage for backend server preferences using electron-store
 */

import Store from 'electron-store';
import type { BackendPreferences, PluginConfig } from '../types/backend-settings';
import { DEFAULT_BACKEND_PREFERENCES } from '../types/backend-settings';
import { getContextForgeHome } from './common';

export class BackendPreferencesStore {
  private store: Store<BackendPreferences>;

  constructor() {
    this.store = new Store<BackendPreferences>({
      name: 'context-forge-backend-preferences',
      cwd: getContextForgeHome(),
      defaults: DEFAULT_BACKEND_PREFERENCES,
      schema: {
        autoStartEmbedded: {
          type: 'boolean',
          default: true,
        },
        enablePlugins: {
          type: 'boolean',
          default: true,
        },
        pluginConfigs: {
          type: 'object',
          default: {},
        },
      },
    });
  }

  /**
   * Get all backend preferences
   */
  getPreferences(): BackendPreferences {
    return {
      autoStartEmbedded: this.store.get('autoStartEmbedded', true),
      enablePlugins: this.store.get('enablePlugins', true),
      pluginConfigs: this.store.get('pluginConfigs', {}),
    };
  }

  /**
   * Get auto-start preference
   */
  getAutoStartEmbedded(): boolean {
    return this.store.get('autoStartEmbedded', true);
  }

  /**
   * Set auto-start preference
   */
  setAutoStartEmbedded(value: boolean): void {
    this.store.set('autoStartEmbedded', value);
    console.log(`Backend auto-start preference set to: ${value}`);
  }

  /**
   * Get global plugin enablement status
   */
  getEnablePlugins(): boolean {
    return this.store.get('enablePlugins', true);
  }

  /**
   * Set global plugin enablement
   */
  setEnablePlugins(value: boolean): void {
    this.store.set('enablePlugins', value);
    console.log(`Plugins globally ${value ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get configuration for a specific plugin
   */
  getPluginConfig(pluginName: string): PluginConfig | null {
    const configs = this.store.get('pluginConfigs', {});
    return configs[pluginName] || null;
  }

  /**
   * Set configuration for a specific plugin
   */
  setPluginConfig(pluginName: string, config: PluginConfig): void {
    const configs = this.store.get('pluginConfigs', {});
    configs[pluginName] = config;
    this.store.set('pluginConfigs', configs);
    console.log(`Plugin ${pluginName} configuration updated:`, config);
  }

  /**
   * Remove plugin configuration
   */
  removePluginConfig(pluginName: string): void {
    const configs = this.store.get('pluginConfigs', {});
    delete configs[pluginName];
    this.store.set('pluginConfigs', configs);
    console.log(`Plugin ${pluginName} configuration removed`);
  }

  /**
   * Get all plugin configurations
   */
  getAllPluginConfigs(): Record<string, PluginConfig> {
    return this.store.get('pluginConfigs', {});
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<BackendPreferences>): void {
    if (preferences.autoStartEmbedded !== undefined) {
      this.setAutoStartEmbedded(preferences.autoStartEmbedded);
    }
    if (preferences.enablePlugins !== undefined) {
      this.setEnablePlugins(preferences.enablePlugins);
    }
    if (preferences.pluginConfigs !== undefined) {
      this.store.set('pluginConfigs', preferences.pluginConfigs);
    }
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.store.clear();
    console.log('Backend preferences reset to defaults');
  }
}

// Singleton instance
export const backendPreferences = new BackendPreferencesStore();