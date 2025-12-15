// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Tray methods
  showNotification: (title: string, body: string, options?: { silent?: boolean }) => {
    ipcRenderer.send('tray:show-notification', title, body, options);
  },
  updateBadge: (count: number) => {
    ipcRenderer.send('tray:update-badge', count);
  },
  getTrayConfig: () => ipcRenderer.invoke('tray:get-config'),
  updateTrayConfig: (config: any) => {
    ipcRenderer.send('tray:update-config', config);
  },

  // Window methods
  showWindow: () => {
    ipcRenderer.send('window:show');
  },
  hideWindow: () => {
    ipcRenderer.send('window:hide');
  },
  toggleWindow: () => {
    ipcRenderer.send('window:toggle');
  },
  isWindowVisible: () => ipcRenderer.invoke('window:is-visible'),

  // API methods
  api: {
    login: (email: string, password: string) => ipcRenderer.invoke('api:login', email, password),
    getCurrentUser: () => ipcRenderer.invoke('api:get-current-user'),
    listServers: () => ipcRenderer.invoke('api:list-servers'),
    createServer: (serverData: any) => ipcRenderer.invoke('api:create-server', serverData),
    updateServer: (serverId: string, serverData: any) => ipcRenderer.invoke('api:update-server', serverId, serverData),
    deleteServer: (serverId: string) => ipcRenderer.invoke('api:delete-server', serverId),
    toggleServerStatus: (serverId: string, activate?: boolean) => ipcRenderer.invoke('api:toggle-server-status', serverId, activate),
    listGateways: () => ipcRenderer.invoke('api:list-gateways'),
    createGateway: (gatewayData: any) => ipcRenderer.invoke('api:create-gateway', gatewayData),
    updateGateway: (gatewayId: string, gatewayData: any) => ipcRenderer.invoke('api:update-gateway', gatewayId, gatewayData),
    deleteGateway: (gatewayId: string) => ipcRenderer.invoke('api:delete-gateway', gatewayId),
    toggleGatewayStatus: (gatewayId: string, activate?: boolean) => ipcRenderer.invoke('api:toggle-gateway-status', gatewayId, activate),
    listA2AAgents: () => ipcRenderer.invoke('api:list-a2a-agents'),
    createA2AAgent: (agentData: any) => ipcRenderer.invoke('api:create-a2a-agent', agentData),
    getA2AAgent: (agentId: string) => ipcRenderer.invoke('api:get-a2a-agent', agentId),
    updateA2AAgent: (agentId: string, agentData: any) => ipcRenderer.invoke('api:update-a2a-agent', agentId, agentData),
    deleteA2AAgent: (agentId: string) => ipcRenderer.invoke('api:delete-a2a-agent', agentId),
    toggleA2AAgentStatus: (agentId: string, activate?: boolean) => ipcRenderer.invoke('api:toggle-a2a-agent-status', agentId, activate),
    testA2AAgent: (agentId: string) => ipcRenderer.invoke('api:test-a2a-agent', agentId),
    // OAuth Gateway-based operations
    initiateOAuthFlow: (gatewayId: string) => ipcRenderer.invoke('api:initiate-oauth-flow', gatewayId),
    getOAuthStatus: (gatewayId: string) => ipcRenderer.invoke('api:get-oauth-status', gatewayId),
    fetchToolsAfterOAuth: (gatewayId: string) => ipcRenderer.invoke('api:fetch-tools-after-oauth', gatewayId),
    openBackendOAuthFlow: (gatewayId: string) => ipcRenderer.invoke('api:open-backend-oauth-flow', gatewayId),
    listRegisteredOAuthClients: () => ipcRenderer.invoke('api:list-registered-oauth-clients'),
    getRegisteredClientForGateway: (gatewayId: string) => ipcRenderer.invoke('api:get-registered-client-for-gateway', gatewayId),
    deleteRegisteredOAuthClient: (clientId: string) => ipcRenderer.invoke('api:delete-registered-oauth-client', clientId),
    // Legacy OAuth operations (for direct OAuth testing)
    testAgentConnection: (agentEndpoint: string, accessToken: string) => ipcRenderer.invoke('api:test-agent-connection', agentEndpoint, accessToken),
    refreshOAuthToken: (refreshToken: string, oauthConfig: any) => ipcRenderer.invoke('api:refresh-oauth-token', refreshToken, oauthConfig),
    getClientCredentialsToken: (oauthConfig: any) => ipcRenderer.invoke('api:get-client-credentials-token', oauthConfig),
    // Native OAuth flow - performs complete authorization code flow with local callback server
    performNativeOAuthFlow: (oauthConfig: any, timeoutMs?: number) => ipcRenderer.invoke('api:perform-native-oauth-flow', oauthConfig, timeoutMs),
    listTools: () => ipcRenderer.invoke('api:list-tools'),
    createTool: (toolData: any) => ipcRenderer.invoke('api:create-tool', toolData),
    updateTool: (toolId: string, toolData: any) => ipcRenderer.invoke('api:update-tool', toolId, toolData),
    deleteTool: (toolId: string) => ipcRenderer.invoke('api:delete-tool', toolId),
    toggleToolStatus: (toolId: string, activate?: boolean) => ipcRenderer.invoke('api:toggle-tool-status', toolId, activate),
    listResources: (includeInactive?: boolean) => ipcRenderer.invoke('api:list-resources', includeInactive),
    createResource: (resourceData: any) => ipcRenderer.invoke('api:create-resource', resourceData),
    readResource: (resourceId: string) => ipcRenderer.invoke('api:read-resource', resourceId),
    updateResource: (resourceId: string, resourceData: any) => ipcRenderer.invoke('api:update-resource', resourceId, resourceData),
    deleteResource: (resourceId: string) => ipcRenderer.invoke('api:delete-resource', resourceId),
    toggleResourceStatus: (resourceId: string, activate?: boolean) => ipcRenderer.invoke('api:toggle-resource-status', resourceId, activate),
    listPrompts: (includeInactive = true) => ipcRenderer.invoke('api:list-prompts', includeInactive),
    createPrompt: (promptData: any) => ipcRenderer.invoke('api:create-prompt', promptData),
    updatePrompt: (promptId: string, promptData: any) => ipcRenderer.invoke('api:update-prompt', promptId, promptData),
    deletePrompt: (promptId: string) => ipcRenderer.invoke('api:delete-prompt', promptId),
    togglePromptStatus: (promptId: string, activate?: boolean) => ipcRenderer.invoke('api:toggle-prompt-status', promptId, activate),
    executePrompt: (promptId: string, args: Record<string, any>) => ipcRenderer.invoke('api:execute-prompt', promptId, args),
    listUsers: () => ipcRenderer.invoke('api:list-users'),
    createUser: (userData: any) => ipcRenderer.invoke('api:create-user', userData),
    updateUser: (email: string, userData: any) => ipcRenderer.invoke('api:update-user', email, userData),
    deleteUser: (email: string) => ipcRenderer.invoke('api:delete-user', email),
    activateUser: (email: string) => ipcRenderer.invoke('api:activate-user', email),
    deactivateUser: (email: string) => ipcRenderer.invoke('api:deactivate-user', email),
    listRoles: () => ipcRenderer.invoke('api:list-roles'),
    getUserRoles: (email: string) => ipcRenderer.invoke('api:get-user-roles', email),
    assignRoleToUser: (email: string, roleId: string) => ipcRenderer.invoke('api:assign-role-to-user', email, roleId),
    revokeRoleFromUser: (email: string, roleId: string) => ipcRenderer.invoke('api:revoke-role-from-user', email, roleId),
    listTeams: () => ipcRenderer.invoke('api:list-teams'),
    createTeam: (teamData: any) => ipcRenderer.invoke('api:create-team', teamData),
    updateTeam: (teamId: string, teamData: any) => ipcRenderer.invoke('api:update-team', teamId, teamData),
    deleteTeam: (teamId: string) => ipcRenderer.invoke('api:delete-team', teamId),
    listTokens: () => ipcRenderer.invoke('api:list-tokens'),
    createToken: (tokenData: any) => ipcRenderer.invoke('api:create-token', tokenData),
    updateToken: (tokenId: string, tokenData: any) => ipcRenderer.invoke('api:update-token', tokenId, tokenData),
    revokeToken: (tokenId: string) => ipcRenderer.invoke('api:revoke-token', tokenId),
    getAvailablePermissions: () => ipcRenderer.invoke('api:get-available-permissions'),
    executeToolRpc: (toolName: string, params: Record<string, any>, passthroughHeaders: Record<string, string>, timeout: number) =>
      ipcRenderer.invoke('api:execute-tool-rpc', toolName, params, passthroughHeaders, timeout),
    getAggregatedMetrics: () => ipcRenderer.invoke('api:getAggregatedMetrics'),
    listPlugins: (filters?: any) => ipcRenderer.invoke('api:list-plugins', filters),
    getPluginStats: () => ipcRenderer.invoke('api:get-plugin-stats'),
    getPluginDetails: (name: string) => ipcRenderer.invoke('api:get-plugin-details', name),
    
    // Observability and tracing methods
    getObservabilityStats: (params?: any) => ipcRenderer.invoke('api:get-observability-stats', params),
    getTraces: (filters?: any) => ipcRenderer.invoke('api:get-traces', filters),
    getTraceDetail: (traceId: string) => ipcRenderer.invoke('api:get-trace-detail', traceId),
    getTimeSeriesMetrics: (params?: any) => ipcRenderer.invoke('api:get-timeseries-metrics', params),
    getTopSlowEndpoints: (params?: any) => ipcRenderer.invoke('api:get-top-slow-endpoints', params),
    getTopVolumeEndpoints: (params?: any) => ipcRenderer.invoke('api:get-top-volume-endpoints', params),
    getTopErrorEndpoints: (params?: any) => ipcRenderer.invoke('api:get-top-error-endpoints', params),
    getToolUsage: (params?: any) => ipcRenderer.invoke('api:get-tool-usage', params),
    getToolPerformance: (params?: any) => ipcRenderer.invoke('api:get-tool-performance', params),
    getToolErrors: (params?: any) => ipcRenderer.invoke('api:get-tool-errors', params),
    getToolChains: (params?: any) => ipcRenderer.invoke('api:get-tool-chains', params),
    listSavedQueries: () => ipcRenderer.invoke('api:list-saved-queries'),
    saveQuery: (data: any) => ipcRenderer.invoke('api:save-query', data),
    deleteQuery: (queryId: string) => ipcRenderer.invoke('api:delete-query', queryId),
    useQuery: (queryId: string) => ipcRenderer.invoke('api:use-query', queryId),
    
    // Profile management methods
    initializeProfiles: () => ipcRenderer.invoke('profiles:initialize'),
    getAllProfiles: () => ipcRenderer.invoke('profiles:get-all'),
    getProfile: (profileId: string) => ipcRenderer.invoke('profiles:get', profileId),
    createProfile: (request: any) => ipcRenderer.invoke('profiles:create', request),
    updateProfile: (profileId: string, updates: any) => ipcRenderer.invoke('profiles:update', profileId, updates),
    deleteProfile: (profileId: string) => ipcRenderer.invoke('profiles:delete', profileId),
    switchProfile: (profileId: string) => ipcRenderer.invoke('profiles:switch', profileId),
    loginWithProfile: (profileId: string) => ipcRenderer.invoke('profiles:login', profileId),
    logoutProfile: () => ipcRenderer.invoke('profiles:logout'),
    getCurrentProfile: () => ipcRenderer.invoke('profiles:get-current'),
    testProfileCredentials: (email: string, password: string, apiUrl: string) => ipcRenderer.invoke('profiles:test-credentials', email, password, apiUrl),
    
    // Backend health check
    // Backend preferences
    getBackendPreferences: () => ipcRenderer.invoke('backend:get-preferences'),
    setAutoStartEmbedded: (value: boolean) => ipcRenderer.invoke('backend:set-auto-start', value),
    // Catalog operations
    listCatalogServers: (filters?: any) => ipcRenderer.invoke('api:list-catalog-servers', filters),
    registerCatalogServer: (serverId: string, request?: any) => ipcRenderer.invoke('api:register-catalog-server', serverId, request),
    checkCatalogServerStatus: (serverId: string) => ipcRenderer.invoke('api:check-catalog-server-status', serverId),
    bulkRegisterCatalogServers: (request: any) => ipcRenderer.invoke('api:bulk-register-catalog-servers', request),
    checkBackendHealth: () => ipcRenderer.invoke('backend:check-health'),
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      showNotification: (title: string, body: string, options?: { silent?: boolean }) => void;
      updateBadge: (count: number) => void;
      getTrayConfig: () => Promise<any>;
      updateTrayConfig: (config: any) => void;
      showWindow: () => void;
      hideWindow: () => void;
      toggleWindow: () => void;
      isWindowVisible: () => Promise<boolean>;
      api: {
        login: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        getCurrentUser: () => Promise<{ success: boolean; data?: any; error?: string }>;
        listServers: () => Promise<{ success: boolean; data?: any; error?: string }>;
        createServer: (serverData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        updateServer: (serverId: string, serverData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteServer: (serverId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        toggleServerStatus: (serverId: string, activate?: boolean) => Promise<{ success: boolean; data?: any; error?: string }>;
        listGateways: () => Promise<{ success: boolean; data?: any; error?: string }>;
        createGateway: (gatewayData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        updateGateway: (gatewayId: string, gatewayData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteGateway: (gatewayId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        toggleGatewayStatus: (gatewayId: string, activate?: boolean) => Promise<{ success: boolean; data?: any; error?: string }>;
        listA2AAgents: () => Promise<{ success: boolean; data?: any; error?: string }>;
        createA2AAgent: (agentData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getA2AAgent: (agentId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        updateA2AAgent: (agentId: string, agentData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteA2AAgent: (agentId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        toggleA2AAgentStatus: (agentId: string, activate?: boolean) => Promise<{ success: boolean; data?: any; error?: string }>;
        testA2AAgent: (agentId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        // OAuth Gateway-based operations
        initiateOAuthFlow: (gatewayId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        getOAuthStatus: (gatewayId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        fetchToolsAfterOAuth: (gatewayId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        openBackendOAuthFlow: (gatewayId: string) => Promise<{ success: boolean; data?: { url: string }; error?: string }>;
        listRegisteredOAuthClients: () => Promise<{ success: boolean; data?: any; error?: string }>;
        getRegisteredClientForGateway: (gatewayId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteRegisteredOAuthClient: (clientId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        // Legacy OAuth operations
        testAgentConnection: (agentEndpoint: string, accessToken: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        refreshOAuthToken: (refreshToken: string, oauthConfig: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getClientCredentialsToken: (oauthConfig: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        // Native OAuth flow - performs complete authorization code flow with local callback server
        performNativeOAuthFlow: (oauthConfig: any, timeoutMs?: number) => Promise<{ success: boolean; data?: any; error?: string }>;
        listTools: () => Promise<{ success: boolean; data?: any; error?: string }>;
        createTool: (toolData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        updateTool: (toolId: string, toolData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteTool: (toolId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        toggleToolStatus: (toolId: string, activate?: boolean) => Promise<{ success: boolean; data?: any; error?: string }>;
        listResources: (includeInactive?: boolean) => Promise<{ success: boolean; data?: any; error?: string }>;
        createResource: (resourceData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        readResource: (resourceId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        updateResource: (resourceId: string, resourceData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteResource: (resourceId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        toggleResourceStatus: (resourceId: string, activate?: boolean) => Promise<{ success: boolean; data?: any; error?: string }>;
        listPrompts: (includeInactive?: boolean) => Promise<{ success: boolean; data?: any; error?: string }>;
        createPrompt: (promptData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        updatePrompt: (promptId: string, promptData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deletePrompt: (promptId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        togglePromptStatus: (promptId: string, activate?: boolean) => Promise<{ success: boolean; data?: any; error?: string }>;
        executePrompt: (promptId: string, args: Record<string, any>) => Promise<{ success: boolean; data?: any; error?: string }>;
        listUsers: () => Promise<{ success: boolean; data?: any; error?: string }>;
        createUser: (userData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        updateUser: (email: string, userData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteUser: (email: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        activateUser: (email: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        deactivateUser: (email: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        listRoles: () => Promise<{ success: boolean; data?: any; error?: string }>;
        getUserRoles: (email: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        assignRoleToUser: (email: string, roleId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        revokeRoleFromUser: (email: string, roleId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        listTeams: () => Promise<{ success: boolean; data?: any; error?: string }>;
        createTeam: (teamData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        updateTeam: (teamId: string, teamData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteTeam: (teamId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        listTokens: () => Promise<{ success: boolean; data?: any; error?: string }>;
        createToken: (tokenData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        updateToken: (tokenId: string, tokenData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        revokeToken: (tokenId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        getAvailablePermissions: () => Promise<{ success: boolean; data?: any; error?: string }>;
        executeToolRpc: (toolName: string, params: Record<string, any>, passthroughHeaders: Record<string, string>, timeout: number) => Promise<{ success: boolean; data?: any; error?: string }>;
        getAggregatedMetrics: () => Promise<{ success: boolean; data?: any; error?: string }>;
        listPlugins: (filters?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getPluginStats: () => Promise<{ success: boolean; data?: any; error?: string }>;
        getPluginDetails: (name: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        
        // Observability and tracing methods
        getObservabilityStats: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getTraces: (filters?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getTraceDetail: (traceId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        getTimeSeriesMetrics: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getTopSlowEndpoints: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getTopVolumeEndpoints: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getTopErrorEndpoints: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getToolUsage: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getToolPerformance: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getToolErrors: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        getToolChains: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        listSavedQueries: () => Promise<{ success: boolean; data?: any; error?: string }>;
        saveQuery: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteQuery: (queryId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        useQuery: (queryId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        
        // Profile management methods
        initializeProfiles: () => Promise<{ success: boolean; error?: string }>;
        getAllProfiles: () => Promise<{ success: boolean; data?: any; error?: string }>;
        getProfile: (profileId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        createProfile: (request: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        updateProfile: (profileId: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteProfile: (profileId: string) => Promise<{ success: boolean; error?: string }>;
        switchProfile: (profileId: string) => Promise<{ success: boolean; profile?: any; token?: string; error?: string }>;
        loginWithProfile: (profileId: string) => Promise<{ success: boolean; profile?: any; token?: string; error?: string }>;
        logoutProfile: () => Promise<{ success: boolean; error?: string }>;
        getCurrentProfile: () => Promise<{ success: boolean; data?: { profile: any; token: string; isAuthenticated: boolean }; error?: string }>;
        testProfileCredentials: (email: string, password: string, apiUrl: string) => Promise<{ success: boolean; error?: string }>;
        
        // Backend health check
        
        // Backend preferences
        getBackendPreferences: () => Promise<{ success: boolean; data?: { autoStartEmbedded: boolean }; error?: string }>;
        setAutoStartEmbedded: (value: boolean) => Promise<{ success: boolean; error?: string }>;
        checkBackendHealth: () => Promise<{ success: boolean; isHealthy: boolean; status?: number; error?: string }>;
      };
    };
  }
}


