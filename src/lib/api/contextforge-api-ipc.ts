import {
  type ServerRead,
  type ServerCreate,
  type ServerUpdate,
  type GatewayRead,
  type GatewayCreate,
  type GatewayUpdate,
  type A2aAgentRead,
  type A2aAgentCreate,
  type A2aAgentUpdate,
  type EmailUserResponse,
  type TeamListResponse,
  type TeamResponse,
  type TeamCreateRequest,
  type TeamUpdateRequest,
  type TokenResponse,
  type TokenCreateRequest,
  type TokenUpdateRequest,
  type PromptRead,
  type PromptCreate,
  type PromptUpdate,
  type PermissionListResponse,
  type ResourceRead,
  type ResourceCreate,
  type ResourceUpdate
} from '../contextforge-client-ts';

// Check if we're in Electron environment
const isElectron = typeof window !== 'undefined' && window.electronAPI;

// Authentication
export async function login(email: string, password: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  console.log('IPC: Login attempt for', email);
  const response = await window.electronAPI.api.login(email, password);
  
  if (!response.success) {
    console.error('IPC: Login failed', response.error);
    throw new Error('Login failed: ' + response.error);
  }
  
  console.log('IPC: Login successful, dispatching event');
  // Dispatch custom event to notify components of login
  window.dispatchEvent(new Event('contextforge-login'));
  
  return response.data;
}

// Get current user
export async function getCurrentUser(): Promise<EmailUserResponse> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.getCurrentUser();
  
  if (!response.success) {
    throw new Error('Failed to get current user: ' + response.error);
  }
  
  return response.data;
}

// Server operations
export async function listServers(): Promise<ServerRead[]> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listServers();
  
  if (!response.success) {
    throw new Error('Failed to list servers: ' + response.error);
  }
  
  return response.data || [];
}

export async function createServer(serverData: ServerCreate) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.createServer(serverData);
  
  if (!response.success) {
    throw new Error('Failed to create server: ' + response.error);
  }
  
  return response.data;
}

export async function updateServer(serverId: string, serverData: ServerUpdate) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.updateServer(serverId, serverData);
  
  if (!response.success) {
    throw new Error('Failed to update server: ' + response.error);
  }
  
  return response.data;
}

export async function deleteServer(serverId: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.deleteServer(serverId);
  
  if (!response.success) {
    throw new Error('Failed to delete server: ' + response.error);
  }
  
  return response.data;
}

export async function toggleServerStatus(serverId: string, activate?: boolean) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.toggleServerStatus(serverId, activate);
  
  if (!response.success) {
    throw new Error('Failed to toggle server status: ' + response.error);
  }
  
  return response.data;
}

// Tool operations
export async function listTools() {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listTools();
  
  if (!response.success) {
    throw new Error('Failed to list tools: ' + response.error);
  }
  
  return response.data || [];
}

export async function createTool(toolData: any) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.createTool(toolData);
  
  if (!response.success) {
    throw new Error('Failed to create tool: ' + response.error);
  }
  
  return response.data;
}

export async function updateTool(toolId: string, toolData: any) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.updateTool(toolId, toolData);
  
  if (!response.success) {
    throw new Error('Failed to update tool: ' + response.error);
  }
  
  return response.data;
}

export async function deleteTool(toolId: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.deleteTool(toolId);
  
  if (!response.success) {
    throw new Error('Failed to delete tool: ' + response.error);
  }
  
  return response.data;
}

export async function toggleToolStatus(toolId: string, activate?: boolean) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.toggleToolStatus(toolId, activate);
  
  if (!response.success) {
    throw new Error('Failed to toggle tool status: ' + response.error);
  }
  
  return response.data;
}

// Resource operations
export async function listResources(includeInactive = true): Promise<ResourceRead[]> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listResources(includeInactive);
  
  if (!response.success) {
    throw new Error('Failed to list resources: ' + response.error);
  }
  
  return response.data || [];
}

export async function createResource(resourceData: ResourceCreate) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.createResource(resourceData);
  
  if (!response.success) {
    throw new Error('Failed to create resource: ' + response.error);
  }
  
  return response.data;
}

export async function readResource(resourceId: string): Promise<ResourceRead> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.readResource(resourceId);
  
  if (!response.success) {
    throw new Error('Failed to read resource: ' + response.error);
  }
  
  return response.data;
}

export async function updateResource(resourceId: string, resourceData: ResourceUpdate) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.updateResource(resourceId, resourceData);
  
  if (!response.success) {
    throw new Error('Failed to update resource: ' + response.error);
  }
  
  return response.data;
}

export async function deleteResource(resourceId: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.deleteResource(resourceId);
  
  if (!response.success) {
    throw new Error('Failed to delete resource: ' + response.error);
  }
  
  return response.data;
}

export async function toggleResourceStatus(resourceId: string, activate?: boolean) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.toggleResourceStatus(resourceId, activate);
  
  if (!response.success) {
    throw new Error('Failed to toggle resource status: ' + response.error);
  }
  
  return response.data;
}

// Prompt operations
export async function listPrompts(includeInactive = true): Promise<PromptRead[]> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listPrompts(includeInactive);
  
  if (!response.success) {
    throw new Error('Failed to list prompts: ' + response.error);
  }
  
  return response.data || [];
}

export async function createPrompt(promptData: PromptCreate) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.createPrompt(promptData);
  
  if (!response.success) {
    throw new Error('Failed to create prompt: ' + response.error);
  }
  
  return response.data;
}

export async function updatePrompt(promptId: string, promptData: PromptUpdate) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.updatePrompt(promptId, promptData);
  
  if (!response.success) {
    throw new Error('Failed to update prompt: ' + response.error);
  }
  
  return response.data;
}

export async function deletePrompt(promptId: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.deletePrompt(promptId);
  
  if (!response.success) {
    throw new Error('Failed to delete prompt: ' + response.error);
  }
  
  return response.data;
}

export async function togglePromptStatus(promptId: string, activate?: boolean) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.togglePromptStatus(promptId, activate);
  
  if (!response.success) {
    throw new Error('Failed to toggle prompt status: ' + response.error);
  }
  
  return response.data;
}

export async function executePrompt(promptId: string, args: Record<string, any>) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.executePrompt(promptId, args);
  
  if (!response.success) {
    throw new Error('Failed to execute prompt: ' + response.error);
  }
  
  return response.data;
}

// Gateway operations
export async function listGateways(): Promise<GatewayRead[]> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listGateways();
  
  if (!response.success) {
    throw new Error('Failed to list gateways: ' + response.error);
  }
  
  return response.data || [];
}

export async function createGateway(gatewayData: GatewayCreate) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.createGateway(gatewayData);
  
  if (!response.success) {
    throw new Error('Failed to create gateway: ' + response.error);
  }
  
  return response.data;
}

export async function updateGateway(gatewayId: string, gatewayData: GatewayUpdate) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.updateGateway(gatewayId, gatewayData);
  
  if (!response.success) {
    throw new Error('Failed to update gateway: ' + response.error);
  }
  
  return response.data;
}

export async function deleteGateway(gatewayId: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.deleteGateway(gatewayId);
  
  if (!response.success) {
    throw new Error('Failed to delete gateway: ' + response.error);
  }
  
  return response.data;
}

export async function toggleGatewayStatus(gatewayId: string, activate?: boolean) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.toggleGatewayStatus(gatewayId, activate);
  
  if (!response.success) {
    throw new Error('Failed to toggle gateway status: ' + response.error);
  }
  
  return response.data;
}

// A2A Agent operations
export async function listA2AAgents(): Promise<A2aAgentRead[]> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listA2AAgents();
  
  if (!response.success) {
    throw new Error('Failed to list A2A agents: ' + response.error);
  }
  
  return response.data || [];
}

export async function createA2AAgent(agentData: A2aAgentCreate) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.createA2AAgent(agentData);
  
  if (!response.success) {
    throw new Error('Failed to create A2A agent: ' + response.error);
  }
  
  return response.data;
}

export async function getA2AAgent(agentId: string): Promise<A2aAgentRead> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.getA2AAgent(agentId);
  
  if (!response.success) {
    throw new Error('Failed to get A2A agent: ' + response.error);
  }
  
  return response.data;
}

export async function updateA2AAgent(agentId: string, agentData: A2aAgentUpdate) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.updateA2AAgent(agentId, agentData);
  
  if (!response.success) {
    throw new Error('Failed to update A2A agent: ' + response.error);
  }
  
  return response.data;
}

export async function deleteA2AAgent(agentId: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.deleteA2AAgent(agentId);
  
  if (!response.success) {
    throw new Error('Failed to delete A2A agent: ' + response.error);
  }
  
  return response.data;
}

export async function toggleA2AAgentStatus(agentId: string, activate?: boolean) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.toggleA2AAgentStatus(agentId, activate);
  
  if (!response.success) {
    throw new Error('Failed to toggle A2A agent status: ' + response.error);
  }
  
  return response.data;
}

// OAuth Testing operations
export async function getOAuthAuthorizationUrl(oauthConfig: any): Promise<string> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.getOAuthAuthorizationUrl(oauthConfig);
  
  if (!response.success) {
    throw new Error('Failed to get OAuth authorization URL: ' + response.error);
  }
  
  return response.data;
}

export async function exchangeOAuthCode(code: string, oauthConfig: any): Promise<any> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.exchangeOAuthCode(code, oauthConfig);
  
  if (!response.success) {
    throw new Error('Failed to exchange OAuth code: ' + response.error);
  }
  
  return response.data;
}

export async function testAgentConnection(agentEndpoint: string, accessToken: string): Promise<any> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.testAgentConnection(agentEndpoint, accessToken);
  
  if (!response.success) {
    throw new Error('Failed to test agent connection: ' + response.error);
  }
  
  return response.data;
}

export async function refreshOAuthToken(refreshToken: string, oauthConfig: any): Promise<any> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.refreshOAuthToken(refreshToken, oauthConfig);
  
  if (!response.success) {
    throw new Error('Failed to refresh OAuth token: ' + response.error);
  }
  
  return response.data;
}

export async function getClientCredentialsToken(oauthConfig: any): Promise<any> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.getClientCredentialsToken(oauthConfig);
  
  if (!response.success) {
    throw new Error('Failed to get client credentials token: ' + response.error);
  }
  
  return response.data;
}

// User operations
export async function listUsers(): Promise<EmailUserResponse[]> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listUsers();
  
  if (!response.success) {
    throw new Error('Failed to list users: ' + response.error);
  }
  
  return response.data || [];
}

export async function createUser(userData: {
  email: string;
  password: string;
  full_name?: string;
  is_admin?: boolean;
}) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.createUser(userData);
  
  if (!response.success) {
    throw new Error('Failed to create user: ' + response.error);
  }
  
  return response.data;
}

export async function updateUser(email: string, userData: {
  full_name?: string;
  password?: string;
  is_admin?: boolean;
  is_active?: boolean;
}) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.updateUser(email, userData);
  
  if (!response.success) {
    throw new Error('Failed to update user: ' + response.error);
  }
  
  return response.data;
}

export async function deleteUser(email: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.deleteUser(email);
  
  if (!response.success) {
    throw new Error('Failed to delete user: ' + response.error);
  }
  
  return response.data;
}

export async function activateUser(email: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.activateUser(email);
  
  if (!response.success) {
    throw new Error('Failed to activate user: ' + response.error);
  }
  
  return response.data;
}

export async function deactivateUser(email: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.deactivateUser(email);
  
  if (!response.success) {
    throw new Error('Failed to deactivate user: ' + response.error);
  }
  
  return response.data;
}

// RBAC operations
export async function listRoles() {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listRoles();
  
  if (!response.success) {
    throw new Error('Failed to list roles: ' + response.error);
  }
  
  return response.data || [];
}

export async function getUserRoles(email: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.getUserRoles(email);
  
  if (!response.success) {
    throw new Error('Failed to get user roles: ' + response.error);
  }
  
  return response.data || [];
}

export async function assignRoleToUser(email: string, roleId: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.assignRoleToUser(email, roleId);
  
  if (!response.success) {
    throw new Error('Failed to assign role: ' + response.error);
  }
  
  return response.data;
}

export async function revokeRoleFromUser(email: string, roleId: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.revokeRoleFromUser(email, roleId);
  
  if (!response.success) {
    throw new Error('Failed to revoke role: ' + response.error);
  }
  
  return response.data;
}

// Team operations
export async function listTeams(): Promise<TeamResponse[]> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listTeams();
  
  if (!response.success) {
    throw new Error('Failed to list teams: ' + response.error);
  }
  
  return response.data || [];
}

export async function createTeam(teamData: TeamCreateRequest) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.createTeam(teamData);
  
  if (!response.success) {
    throw new Error('Failed to create team: ' + response.error);
  }
  
  return response.data;
}

export async function updateTeam(teamId: string, teamData: TeamUpdateRequest) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.updateTeam(teamId, teamData);
  
  if (!response.success) {
    throw new Error('Failed to update team: ' + response.error);
  }
  
  return response.data;
}

export async function deleteTeam(teamId: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.deleteTeam(teamId);
  
  if (!response.success) {
    throw new Error('Failed to delete team: ' + response.error);
  }
  
  return response.data;
}

// Token operations
export async function listTokens(): Promise<TokenResponse[]> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listTokens();
  
  if (!response.success) {
    throw new Error('Failed to list tokens: ' + response.error);
  }
  
  return response.data || [];
}

export async function createToken(tokenData: TokenCreateRequest) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.createToken(tokenData);
  
  if (!response.success) {
    throw new Error('Failed to create token: ' + response.error);
  }
  
  return response.data;
}

export async function updateToken(tokenId: string, tokenData: TokenUpdateRequest) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.updateToken(tokenId, tokenData);
  
  if (!response.success) {
    throw new Error('Failed to update token: ' + response.error);
  }
  
  return response.data;
}

export async function revokeToken(tokenId: string) {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.revokeToken(tokenId);
  
  if (!response.success) {
    throw new Error('Failed to revoke token: ' + response.error);
  }
  
  return response.data;
}

// RBAC / Permissions operations
export async function getAvailablePermissions(): Promise<PermissionListResponse> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.getAvailablePermissions();
  
  if (!response.success) {
    throw new Error('Failed to get available permissions: ' + response.error);
  }
  
  return response.data;
}

// RPC operations (Tool Execution)
export async function executeToolRpc(
  toolName: string,
  params: Record<string, any> = {},
  passthroughHeaders: Record<string, string> = {},
  timeout: number = 60000
): Promise<any> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.executeToolRpc(
    toolName,
    params,
    passthroughHeaders,
    timeout
  );
  
  if (!response.success) {
    throw new Error('Failed to execute tool: ' + response.error);
  }
  
  return response.data;
}

// Type exports for convenience
export type {
  ServerRead,
  ServerCreate,
  ServerUpdate,
  GatewayRead,
  GatewayCreate,
  GatewayUpdate,
  A2aAgentRead,
  A2aAgentCreate,
  A2aAgentUpdate,
  PromptRead,
  PromptCreate,
  PromptUpdate,
  ResourceRead,
  ResourceCreate,
  ResourceUpdate
};
