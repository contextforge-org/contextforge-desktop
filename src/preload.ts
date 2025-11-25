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
    listTools: () => ipcRenderer.invoke('api:list-tools'),
    createTool: (toolData: any) => ipcRenderer.invoke('api:create-tool', toolData),
    updateTool: (toolId: string, toolData: any) => ipcRenderer.invoke('api:update-tool', toolId, toolData),
    deleteTool: (toolId: string) => ipcRenderer.invoke('api:delete-tool', toolId),
    toggleToolStatus: (toolId: string, activate?: boolean) => ipcRenderer.invoke('api:toggle-tool-status', toolId, activate),
    listResources: () => ipcRenderer.invoke('api:list-resources'),
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
        listTools: () => Promise<{ success: boolean; data?: any; error?: string }>;
        createTool: (toolData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        updateTool: (toolId: string, toolData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        deleteTool: (toolId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        toggleToolStatus: (toolId: string, activate?: boolean) => Promise<{ success: boolean; data?: any; error?: string }>;
        listResources: () => Promise<{ success: boolean; data?: any; error?: string }>;
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
      };
    };
  }
}


