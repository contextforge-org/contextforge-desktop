import { useEffect, useState, useCallback } from 'react';

interface TrayConfig {
  notificationsEnabled: boolean;
  notificationSound: boolean;
  minimizeToTray: boolean;
}

/**
 * React hook for interacting with the system tray
 */
export function useTray() {
  const [config, setConfig] = useState<TrayConfig | null>(null);
  const [isWindowVisible, setIsWindowVisible] = useState(true);

  // Load initial config
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getTrayConfig().then(setConfig);
      window.electronAPI.isWindowVisible().then(setIsWindowVisible);
    }
  }, []);

  // Show notification
  const showNotification = useCallback((
    title: string,
    body: string,
    options?: { silent?: boolean }
  ) => {
    if (window.electronAPI) {
      window.electronAPI.showNotification(title, body, options);
    }
  }, []);

  // Update badge count
  const updateBadge = useCallback((count: number) => {
    if (window.electronAPI) {
      window.electronAPI.updateBadge(count);
    }
  }, []);

  // Update tray configuration
  const updateConfig = useCallback((newConfig: Partial<TrayConfig>) => {
    if (window.electronAPI) {
      window.electronAPI.updateTrayConfig(newConfig);
      setConfig(prev => prev ? { ...prev, ...newConfig } : null);
    }
  }, []);

  // Show window
  const showWindow = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.showWindow();
      setIsWindowVisible(true);
    }
  }, []);

  // Hide window
  const hideWindow = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.hideWindow();
      setIsWindowVisible(false);
    }
  }, []);

  // Toggle window
  const toggleWindow = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.toggleWindow();
      setIsWindowVisible(prev => !prev);
    }
  }, []);

  return {
    config,
    isWindowVisible,
    showNotification,
    updateBadge,
    updateConfig,
    showWindow,
    hideWindow,
    toggleWindow,
  };
}
