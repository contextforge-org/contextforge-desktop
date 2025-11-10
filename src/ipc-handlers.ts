import { ipcMain, BrowserWindow } from 'electron';
import { TrayManager } from './tray-manager';

/**
 * Setup IPC handlers for tray and window management
 */
export function setupIpcHandlers(trayManager: TrayManager, mainWindow: BrowserWindow): void {
  // Show notification from renderer
  ipcMain.on('tray:show-notification', (_event, title: string, body: string, options?: { silent?: boolean }) => {
    trayManager.showNotification(title, body, options);
  });

  // Update unread count/badge
  ipcMain.on('tray:update-badge', (_event, count: number) => {
    trayManager.setUnreadCount(count);
  });

  // Show window
  ipcMain.on('window:show', () => {
    trayManager.showWindow();
  });

  // Hide window
  ipcMain.on('window:hide', () => {
    trayManager.hideWindow();
  });

  // Toggle window
  ipcMain.on('window:toggle', () => {
    trayManager.toggleWindow();
  });

  // Get tray configuration
  ipcMain.handle('tray:get-config', () => {
    return trayManager.getConfig();
  });

  // Update tray configuration
  ipcMain.on('tray:update-config', (_event, config) => {
    trayManager.updateConfig(config);
  });

  // Get window visibility state
  ipcMain.handle('window:is-visible', () => {
    return mainWindow.isVisible();
  });

  console.log('IPC handlers registered successfully');
}

/**
 * Cleanup IPC handlers
 */
export function cleanupIpcHandlers(): void {
  ipcMain.removeAllListeners('tray:show-notification');
  ipcMain.removeAllListeners('tray:update-badge');
  ipcMain.removeAllListeners('window:show');
  ipcMain.removeAllListeners('window:hide');
  ipcMain.removeAllListeners('window:toggle');
  ipcMain.removeHandler('tray:get-config');
  ipcMain.removeAllListeners('tray:update-config');
  ipcMain.removeHandler('window:is-visible');
}