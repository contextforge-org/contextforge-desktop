import { ipcMain, BrowserWindow } from 'electron';
import { TrayManager } from './tray-manager';
import * as mainApi from './lib/api/contextforge-api-main';
import { profileManager } from './services/ProfileManager';
import type { ProfileCreateRequest, ProfileUpdateRequest } from './types/profile';

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

  // A2A Agent handlers
  ipcMain.handle('api:list-a2a-agents', async () => {
    try {
      const response = await mainApi.listA2AAgents();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:create-a2a-agent', async (_event, agentData: any) => {
    try {
      const response = await mainApi.createA2AAgent(agentData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-a2a-agent', async (_event, agentId: string) => {
    try {
      const response = await mainApi.getA2AAgent(agentId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:update-a2a-agent', async (_event, agentId: string, agentData: any) => {
    try {
      const response = await mainApi.updateA2AAgent(agentId, agentData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-a2a-agent', async (_event, agentId: string) => {
    try {
      const response = await mainApi.deleteA2AAgent(agentId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:toggle-a2a-agent-status', async (_event, agentId: string, activate?: boolean) => {
    try {
      const response = await mainApi.toggleA2AAgentStatus(agentId, activate);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:test-a2a-agent', async (_event, agentId: string) => {
    try {
      const response = await mainApi.testA2AAgent(agentId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // OAuth Gateway-based handlers
  ipcMain.handle('api:initiate-oauth-flow', async (_event, gatewayId: string) => {
    try {
      const response = await mainApi.initiateOAuthFlow(gatewayId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-oauth-status', async (_event, gatewayId: string) => {
    try {
      const response = await mainApi.getOAuthStatus(gatewayId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:fetch-tools-after-oauth', async (_event, gatewayId: string) => {
    try {
      const response = await mainApi.fetchToolsAfterOAuth(gatewayId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get the backend OAuth authorize URL and open it in external browser
  // We call the API endpoint with auth, then extract and open the redirect URL
  ipcMain.handle('api:open-backend-oauth-flow', async (_event, gatewayId: string) => {
    try {
      const { shell } = require('electron');
      
      const authToken = mainApi.getAuthToken();
      if (!authToken) {
        console.error('[IPC] No auth token available for OAuth flow');
        return { success: false, error: 'Not authenticated. Please log in first.' };
      }
      
      // Call the OAuth authorize endpoint - it returns a redirect to the OAuth provider
      // We need to intercept the redirect URL instead of following it
      const authorizeEndpoint = mainApi.getBackendOAuthAuthorizeUrl(gatewayId);
      console.log('[IPC] Calling OAuth authorize endpoint:', authorizeEndpoint);
      
      // Make a fetch request that doesn't follow redirects
      const response = await fetch(authorizeEndpoint, {
        method: 'GET',
        redirect: 'manual', // Don't follow redirects
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });
      
      console.log('[IPC] OAuth authorize response status:', response.status);
      console.log('[IPC] OAuth authorize response headers:', Object.fromEntries(response.headers.entries()));
      
      // The endpoint returns a 307 redirect - get the Location header
      if (response.status === 307 || response.status === 302 || response.status === 303) {
        const redirectUrl = response.headers.get('Location') || response.headers.get('location');
        if (redirectUrl) {
          console.log('[IPC] Opening OAuth provider URL:', redirectUrl);
          await shell.openExternal(redirectUrl);
          return { success: true, data: { url: redirectUrl } };
        } else {
          console.error('[IPC] Redirect response but no Location header');
          return { success: false, error: 'OAuth redirect missing Location header' };
        }
      }
      
      // Check if it's an opaque redirect response (status 0 with type 'opaqueredirect')
      // Node fetch with redirect: 'manual' may return this
      if (response.type === 'opaqueredirect') {
        // We can't read the Location header from opaque redirect
        // Fall back to opening the authorize URL directly and let the browser handle auth
        console.log('[IPC] Got opaque redirect, opening authorize URL directly');
        await shell.openExternal(authorizeEndpoint);
        return { success: true, data: { url: authorizeEndpoint } };
      }
      
      // If we didn't get a redirect, something went wrong
      const errorText = await response.text();
      console.error('[IPC] OAuth authorize did not redirect:', response.status, errorText.substring(0, 500));
      
      // Check if it returned HTML (auth page)
      if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
        return { success: false, error: 'Authentication required. The backend returned a login page instead of redirecting.' };
      }
      
      return { success: false, error: `OAuth authorize failed: ${response.status}` };
    } catch (error) {
      console.error('[IPC] OAuth flow error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:list-registered-oauth-clients', async () => {
    try {
      const response = await mainApi.listRegisteredOAuthClients();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-registered-client-for-gateway', async (_event, gatewayId: string) => {
    try {
      const response = await mainApi.getRegisteredClientForGateway(gatewayId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-registered-oauth-client', async (_event, clientId: string) => {
    try {
      const response = await mainApi.deleteRegisteredOAuthClient(clientId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Legacy OAuth handlers (for direct OAuth testing)
  ipcMain.handle('api:test-agent-connection', async (_event, agentEndpoint: string, accessToken: string) => {
    try {
      const response = await mainApi.testAgentConnection(agentEndpoint, accessToken);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:refresh-oauth-token', async (_event, refreshToken: string, oauthConfig: any) => {
    try {
      const response = await mainApi.refreshOAuthToken(refreshToken, oauthConfig);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-client-credentials-token', async (_event, oauthConfig: any) => {
    try {
      const response = await mainApi.getClientCredentialsToken(oauthConfig);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Native OAuth flow handler - performs complete OAuth authorization code flow with local callback server
  ipcMain.handle('api:perform-native-oauth-flow', async (_event, oauthConfig: any, timeoutMs?: number) => {
    try {
      // Import the performNativeOAuthFlow function
      const { performNativeOAuthFlow } = await import('./oauth-handler');
      const result = await performNativeOAuthFlow(oauthConfig, timeoutMs);
      
      if (result.success) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.error };
      }
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

  // Metrics handlers
  ipcMain.handle('api:getAggregatedMetrics', async () => {
    try {
      const data = await mainApi.getAggregatedMetrics();
      return { success: true, data };
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

  // Plugin handlers
  ipcMain.handle('api:list-plugins', async (_event, filters?: any) => {
    try {
      const response = await mainApi.listPlugins(filters);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-plugin-stats', async () => {
    try {
      const response = await mainApi.getPluginStats();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-plugin-details', async (_event, name: string) => {
    try {
      const response = await mainApi.getPluginDetails(name);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
  // Observability and Tracing handlers
  ipcMain.handle('api:get-observability-stats', async (_event, params?: any) => {
    try {
      const response = await mainApi.getObservabilityStats(params);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-traces', async (_event, filters?: any) => {
    try {
      const response = await mainApi.getTraces(filters);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-trace-detail', async (_event, traceId: string) => {
    try {
      const response = await mainApi.getTraceDetail(traceId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-timeseries-metrics', async (_event, params?: any) => {
    try {
      const response = await mainApi.getTimeSeriesMetrics(params);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-top-slow-endpoints', async (_event, params?: any) => {
    try {
      const response = await mainApi.getTopSlowEndpoints(params);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-top-volume-endpoints', async (_event, params?: any) => {
    try {
      const response = await mainApi.getTopVolumeEndpoints(params);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-top-error-endpoints', async (_event, params?: any) => {
    try {
      const response = await mainApi.getTopErrorEndpoints(params);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-tool-usage', async (_event, params?: any) => {
    try {
      const response = await mainApi.getToolUsage(params);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-tool-performance', async (_event, params?: any) => {
    try {
      const response = await mainApi.getToolPerformance(params);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-tool-errors', async (_event, params?: any) => {
    try {
      const response = await mainApi.getToolErrors(params);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:get-tool-chains', async (_event, params?: any) => {
    try {
      const response = await mainApi.getToolChains(params);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:list-saved-queries', async () => {
    try {
      const response = await mainApi.listSavedQueries();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:save-query', async (_event, data: any) => {
    try {
      const response = await mainApi.saveQuery(data);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:delete-query', async (_event, queryId: string) => {
    try {
      const response = await mainApi.deleteQuery(queryId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('api:use-query', async (_event, queryId: string) => {
    try {
      const response = await mainApi.useQuery(queryId);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });


  // Profile Management handlers
  ipcMain.handle('profiles:initialize', async () => {
    try {
      await profileManager.initialize();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:get-all', async () => {
    try {
      const result = await profileManager.getAllProfiles();
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:get', async (_event, profileId: string) => {
    try {
      const result = await profileManager.getProfile(profileId);
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:create', async (_event, request: ProfileCreateRequest) => {
    try {
      const result = await profileManager.createProfile(request);
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:update', async (_event, profileId: string, updates: ProfileUpdateRequest) => {
    try {
      const result = await profileManager.updateProfile(profileId, updates);
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:delete', async (_event, profileId: string) => {
    try {
      const result = await profileManager.deleteProfile(profileId);
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:switch', async (_event, profileId: string) => {
    try {
      const result = await profileManager.switchProfile(profileId);
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:login', async (_event, profileId: string) => {
    try {
      const result = await profileManager.loginWithProfile(profileId);
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:logout', async () => {
    try {
      await profileManager.logout();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:get-current', async () => {
    try {
      const profile = profileManager.getCurrentProfile();
      const token = profileManager.getCurrentToken();
      return {
        success: true,
        data: {
          profile,
          token,
          isAuthenticated: !!profile && !!token
        }
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:test-credentials', async (_event, email: string, password: string, apiUrl: string) => {
    try {
      const result = await profileManager.testCredentials(email, password, apiUrl);
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Backend preferences handlers
  ipcMain.handle('backend:get-preferences', async () => {
    try {
      const { backendPreferences } = await import('./services/BackendPreferences');
      const preferences = backendPreferences.getPreferences();
      return { success: true, data: preferences };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('backend:set-auto-start', async (_event, value: boolean) => {
    try {
      const { backendPreferences } = await import('./services/BackendPreferences');
      backendPreferences.setAutoStartEmbedded(value);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Backend health check handler
  ipcMain.handle('backend:check-health', async () => {
    try {
      // Use the main API to check health (it already has proper auth configured)
      const response = await fetch('http://127.0.0.1:4444/health', {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      
      return {
        success: true,
        isHealthy: response.ok,
        status: response.status
      };
    } catch (error) {
      // Backend not ready yet or connection failed
      return {
        success: true,
        isHealthy: false,
        error: (error as Error).message
      };
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
  ipcMain.removeHandler('api:getAggregatedMetrics');
  
  // Profile management handlers cleanup
  ipcMain.removeHandler('profiles:initialize');
  ipcMain.removeHandler('profiles:get-all');
  ipcMain.removeHandler('profiles:get');
  ipcMain.removeHandler('profiles:create');
  ipcMain.removeHandler('profiles:update');
  ipcMain.removeHandler('profiles:delete');
  ipcMain.removeHandler('profiles:switch');
  ipcMain.removeHandler('profiles:login');
  ipcMain.removeHandler('profiles:logout');
  ipcMain.removeHandler('profiles:get-current');
  ipcMain.removeHandler('profiles:test-credentials');
  
  // Backend preferences handlers cleanup
  ipcMain.removeHandler('backend:get-preferences');
  ipcMain.removeHandler('backend:set-auto-start');
  ipcMain.removeHandler('backend:check-health');
}