import { ipcMain, BrowserWindow, net } from 'electron';
import { TrayManager } from './tray-manager';

// API Configuration
const API_BASE_URL = 'http://localhost:4444';
let authToken: string | null = null;

// API Helper function using Electron's net module
async function apiRequest(endpoint: string, options: { method?: string; body?: any } = {}) {
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: options.method || 'GET',
      url: `${API_BASE_URL}${endpoint}`,
    });

    // Set headers
    request.setHeader('Content-Type', 'application/json');
    if (authToken) {
      request.setHeader('Authorization', `Bearer ${authToken}`);
    }

    let responseData = '';

    request.on('response', (response) => {
      response.on('data', (chunk) => {
        responseData += chunk.toString();
      });

      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`API request failed: ${response.statusCode} - ${responseData}`));
        }
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    // Send body if present
    if (options.body) {
      request.write(JSON.stringify(options.body));
    }

    request.end();
  });
}

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

  // API handlers
  ipcMain.handle('api:login', async (_event, email: string, password: string) => {
    try {
      const response = await apiRequest('/auth/email/login', {
        method: 'POST',
        body: { email, password }
      });
      authToken = (response as any).access_token;
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:list-servers', async () => {
    try {
      // Include inactive servers by default so they don't disappear from the UI
      const response = await apiRequest('/servers/?include_inactive=true');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-server', async (_event, serverData: any) => {
    try {
      const response = await apiRequest('/servers/', {
        method: 'POST',
        body: { server: serverData }
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-server', async (_event, serverId: string, serverData: any) => {
    try {
      const response = await apiRequest(`/servers/${serverId}`, {
        method: 'PUT',
        body: serverData
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-server', async (_event, serverId: string) => {
    try {
      const response = await apiRequest(`/servers/${serverId}`, {
        method: 'DELETE'
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:toggle-server-status', async (_event, serverId: string, activate?: boolean) => {
    try {
      const url = activate !== undefined
        ? `/servers/${serverId}/toggle?activate=${activate}`
        : `/servers/${serverId}/toggle`;
      const response = await apiRequest(url, {
        method: 'POST'
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:list-tools', async () => {
    try {
      const response = await apiRequest('/tools/');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-tool', async (_event, toolData: any) => {
    try {
      const response = await apiRequest('/tools/', {
        method: 'POST',
        body: { tool: toolData }
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-tool', async (_event, toolId: string, toolData: any) => {
    try {
      const response = await apiRequest(`/tools/${toolId}`, {
        method: 'PUT',
        body: toolData
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-tool', async (_event, toolId: string) => {
    try {
      const response = await apiRequest(`/tools/${toolId}`, {
        method: 'DELETE'
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:toggle-tool-status', async (_event, toolId: string) => {
    try {
      const response = await apiRequest(`/tools/${toolId}/toggle`, {
        method: 'POST'
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Resource handlers
  ipcMain.handle('api:list-resources', async () => {
    try {
      const response = await apiRequest('/resources/');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Prompt handlers
  ipcMain.handle('api:list-prompts', async () => {
    try {
      const response = await apiRequest('/prompts/');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Gateway handlers
  ipcMain.handle('api:list-gateways', async () => {
    try {
      const response = await apiRequest('/gateways/');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-gateway', async (_event, gatewayData: any) => {
    try {
      const response = await apiRequest('/gateways/', {
        method: 'POST',
        body: gatewayData
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-gateway', async (_event, gatewayId: string, gatewayData: any) => {
    try {
      const response = await apiRequest(`/gateways/${gatewayId}`, {
        method: 'PUT',
        body: gatewayData
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-gateway', async (_event, gatewayId: string) => {
    try {
      const response = await apiRequest(`/gateways/${gatewayId}`, {
        method: 'DELETE'
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:toggle-gateway-status', async (_event, gatewayId: string) => {
    try {
      const response = await apiRequest(`/gateways/${gatewayId}/toggle`, {
        method: 'POST'
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
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
  ipcMain.removeHandler('api:login');
  ipcMain.removeHandler('api:list-servers');
  ipcMain.removeHandler('api:create-server');
  ipcMain.removeHandler('api:update-server');
  ipcMain.removeHandler('api:delete-server');
  ipcMain.removeHandler('api:toggle-server-status');
  ipcMain.removeHandler('api:list-tools');
  ipcMain.removeHandler('api:create-tool');
  ipcMain.removeHandler('api:update-tool');
  ipcMain.removeHandler('api:delete-tool');
  ipcMain.removeHandler('api:toggle-tool-status');
  ipcMain.removeHandler('api:list-resources');
  ipcMain.removeHandler('api:list-prompts');
  ipcMain.removeHandler('api:list-gateways');
  ipcMain.removeHandler('api:create-gateway');
  ipcMain.removeHandler('api:update-gateway');
  ipcMain.removeHandler('api:delete-gateway');
  ipcMain.removeHandler('api:toggle-gateway-status');
}