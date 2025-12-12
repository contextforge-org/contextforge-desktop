/**
 * Backend Preferences Service
 * Simple storage for backend server preferences using electron-store
 */

import Store from 'electron-store';
import type { BackendPreferences } from '../types/backend-settings';
import { DEFAULT_BACKEND_PREFERENCES } from '../types/backend-settings';

export class BackendPreferencesStore {
  private store: Store<BackendPreferences>;

  constructor() {
    this.store = new Store<BackendPreferences>({
      name: 'context-forge-backend-preferences',
      defaults: DEFAULT_BACKEND_PREFERENCES,
      schema: {
        autoStartEmbedded: {
          type: 'boolean',
          default: true,
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
   * Update preferences
   */
  updatePreferences(preferences: Partial<BackendPreferences>): void {
    if (preferences.autoStartEmbedded !== undefined) {
      this.setAutoStartEmbedded(preferences.autoStartEmbedded);
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