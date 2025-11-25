import { ipcMain, BrowserWindow } from 'electron';
import { TrayManager } from './tray-manager';
import * as mainApi from './lib/api/contextforge-api-main';

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

  // API handlers - now using generated client
  ipcMain.handle('api:login', async (_event, email: string, password: string) => {
    try {
      console.log('IPC Handler: Login attempt for', email);
      const response = await mainApi.login(email, password);
      console.log('IPC Handler: Login successful');
      return { success: true, data: response };
    } catch (error) {
      console.error('IPC Handler: Login failed', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-current-user', async () => {
    try {
      const response = await mainApi.getCurrentUser();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:list-servers', async () => {
    try {
      // Include inactive servers by default so they don't disappear from the UI
      const response = await mainApi.listServers(true);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-server', async (_event, serverData: any) => {
    try {
      const response = await mainApi.createServer(serverData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-server', async (_event, serverId: string, serverData: any) => {
    try {
      const response = await mainApi.updateServer(serverId, serverData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-server', async (_event, serverId: string) => {
    try {
      const response = await mainApi.deleteServer(serverId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:toggle-server-status', async (_event, serverId: string, activate?: boolean) => {
    try {
      const response = await mainApi.toggleServerStatus(serverId, activate);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:list-tools', async () => {
    try {
      // Include inactive tools by default so they don't disappear from the UI
      const response = await mainApi.listTools(true);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-tool', async (_event, toolData: any) => {
    try {
      const response = await mainApi.createTool(toolData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-tool', async (_event, toolId: string, toolData: any) => {
    try {
      const response = await mainApi.updateTool(toolId, toolData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-tool', async (_event, toolId: string) => {
    try {
      const response = await mainApi.deleteTool(toolId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:toggle-tool-status', async (_event, toolId: string, activate?: boolean) => {
    try {
      const response = await mainApi.toggleToolStatus(toolId, activate);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Resource handlers
  ipcMain.handle('api:list-resources', async (_event, includeInactive?: boolean) => {
    try {
      const response = await mainApi.listResources(includeInactive);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-resource', async (_event, resourceData: any) => {
    try {
      const response = await mainApi.createResource(resourceData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:read-resource', async (_event, resourceId: string) => {
    try {
      const response = await mainApi.readResource(resourceId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-resource', async (_event, resourceId: string, resourceData: any) => {
    try {
      const response = await mainApi.updateResource(resourceId, resourceData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-resource', async (_event, resourceId: string) => {
    try {
      const response = await mainApi.deleteResource(resourceId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:toggle-resource-status', async (_event, resourceId: string, activate?: boolean) => {
    try {
      const response = await mainApi.toggleResourceStatus(resourceId, activate);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Prompt handlers
  ipcMain.handle('api:list-prompts', async (_event, includeInactive = true) => {
    try {
      // Include inactive prompts by default so they don't disappear from the UI
      const response = await mainApi.listPrompts(includeInactive);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-prompt', async (_event, promptData: any) => {
    try {
      const response = await mainApi.createPrompt(promptData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-prompt', async (_event, promptId: string, promptData: any) => {
    try {
      const response = await mainApi.updatePrompt(promptId, promptData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-prompt', async (_event, promptId: string) => {
    try {
      const response = await mainApi.deletePrompt(promptId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:toggle-prompt-status', async (_event, promptId: string, activate?: boolean) => {
    try {
      const response = await mainApi.togglePromptStatus(promptId, activate);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:execute-prompt', async (_event, promptId: string, args: Record<string, any>) => {
    try {
      const response = await mainApi.executePrompt(promptId, args);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Gateway handlers
  ipcMain.handle('api:list-gateways', async () => {
    try {
      // Include inactive gateways by default so they don't disappear from the UI
      const response = await mainApi.listGateways(true);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-gateway', async (_event, gatewayData: any) => {
    try {
      const response = await mainApi.createGateway(gatewayData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-gateway', async (_event, gatewayId: string, gatewayData: any) => {
    try {
      const response = await mainApi.updateGateway(gatewayId, gatewayData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-gateway', async (_event, gatewayId: string) => {
    try {
      const response = await mainApi.deleteGateway(gatewayId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:toggle-gateway-status', async (_event, gatewayId: string, activate?: boolean) => {
    try {
      const response = await mainApi.toggleGatewayStatus(gatewayId, activate);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // User handlers
  ipcMain.handle('api:list-users', async () => {
    try {
      const response = await mainApi.listUsers();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-user', async (_event, userData: any) => {
    try {
      const response = await mainApi.createUser(userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-user', async (_event, email: string, userData: any) => {
    try {
      const response = await mainApi.updateUser(email, userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-user', async (_event, email: string) => {
    try {
      const response = await mainApi.deleteUser(email);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:activate-user', async (_event, email: string) => {
    try {
      const response = await mainApi.activateUser(email);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:deactivate-user', async (_event, email: string) => {
    try {
      const response = await mainApi.deactivateUser(email);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // RBAC handlers
  ipcMain.handle('api:list-roles', async () => {
    try {
      const response = await mainApi.listRoles();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-user-roles', async (_event, email: string) => {
    try {
      const response = await mainApi.getUserRoles(email);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:assign-role-to-user', async (_event, email: string, roleId: string) => {
    try {
      const response = await mainApi.assignRoleToUser(email, roleId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:revoke-role-from-user', async (_event, email: string, roleId: string) => {
    try {
      const response = await mainApi.revokeRoleFromUser(email, roleId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Team handlers
  ipcMain.handle('api:list-teams', async () => {
    try {
      const response = await mainApi.listTeams();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-team', async (_event, teamData: any) => {
    try {
      const response = await mainApi.createTeam(teamData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-team', async (_event, teamId: string, teamData: any) => {
    try {
      const response = await mainApi.updateTeam(teamId, teamData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-team', async (_event, teamId: string) => {
    try {
      const response = await mainApi.deleteTeam(teamId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Token handlers
  ipcMain.handle('api:list-tokens', async () => {
    try {
      const response = await mainApi.listTokens();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-token', async (_event, tokenData: any) => {
    try {
      const response = await mainApi.createToken(tokenData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-token', async (_event, tokenId: string, tokenData: any) => {
    try {
      const response = await mainApi.updateToken(tokenId, tokenData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:revoke-token', async (_event, tokenId: string) => {
    try {
      const response = await mainApi.revokeToken(tokenId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
  ipcMain.handle('api:get-available-permissions', async () => {
    try {
      const response = await mainApi.getAvailablePermissions();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });


  // RPC handlers (Tool Execution)
  ipcMain.handle('api:execute-tool-rpc', async (
    _event,
    toolName: string,
    params: Record<string, any>,
    passthroughHeaders: Record<string, string>,
    timeout: number
  ) => {
    try {
      const response = await mainApi.executeToolRpc(toolName, params, passthroughHeaders, timeout);
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
  ipcMain.removeHandler('api:get-current-user');
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
  ipcMain.removeHandler('api:create-resource');
  ipcMain.removeHandler('api:read-resource');
  ipcMain.removeHandler('api:update-resource');
  ipcMain.removeHandler('api:delete-resource');
  ipcMain.removeHandler('api:toggle-resource-status');
  ipcMain.removeHandler('api:create-prompt');
  ipcMain.removeHandler('api:update-prompt');
  ipcMain.removeHandler('api:delete-prompt');
  ipcMain.removeHandler('api:toggle-prompt-status');
  ipcMain.removeHandler('api:execute-prompt');
  ipcMain.removeHandler('api:list-prompts');
  ipcMain.removeHandler('api:list-gateways');
  ipcMain.removeHandler('api:create-gateway');
  ipcMain.removeHandler('api:update-gateway');
  ipcMain.removeHandler('api:list-teams');
  ipcMain.removeHandler('api:delete-gateway');
  ipcMain.removeHandler('api:toggle-gateway-status');
  ipcMain.removeHandler('api:activate-user');
  ipcMain.removeHandler('api:deactivate-user');
  ipcMain.removeHandler('api:list-roles');
  ipcMain.removeHandler('api:get-user-roles');
  ipcMain.removeHandler('api:assign-role-to-user');
  ipcMain.removeHandler('api:revoke-role-from-user');
  ipcMain.removeHandler('api:execute-tool-rpc');
}