/**
 * Context Forge API wrapper for Electron Main Process
 *
 * This module provides a type-safe API interface for the main process
 * using the generated client with an Electron-compatible fetch adapter.
 *
 * Unlike the renderer process which has native fetch support, the main
 * process requires a custom adapter that wraps Electron's net module.
 */

import {
  listServersServersGet,
  createServerServersPost,
  updateServerServersServerIdPut,
  deleteServerServersServerIdDelete,
  toggleServerStatusServersServerIdTogglePost,
  loginAuthEmailLoginPost,
  getCurrentUserProfileAuthEmailMeGet,
  listUsersAuthEmailAdminUsersGet,
  createUserAuthEmailAdminUsersPost,
  getAggregatedMetricsAdminMetricsGet,
  getSystemStatsAdminSystemStatsGet,
  updateUserAuthEmailAdminUsersUserEmailPut,
  deleteUserAuthEmailAdminUsersUserEmailDelete,
  adminActivateUserAdminUsersUserEmailActivatePost,
  adminDeactivateUserAdminUsersUserEmailDeactivatePost,
  getUserRolesRbacUsersUserEmailRolesGet,
  assignRoleToUserRbacUsersUserEmailRolesPost,
  revokeUserRoleRbacUsersUserEmailRolesRoleIdDelete,
  listRolesRbacRolesGet,
  listToolsToolsGet,
  createToolToolsPost,
  updateToolToolsToolIdPut,
  deleteToolToolsToolIdDelete,
  toggleToolStatusToolsToolIdTogglePost,
  listResourcesResourcesGet,
  createResourceResourcesPost,
  readResourceResourcesResourceIdGet,
  updateResourceResourcesResourceIdPut,
  deleteResourceResourcesResourceIdDelete,
  toggleResourceStatusResourcesResourceIdTogglePost,
  listPromptsPromptsGet,
  createPromptPromptsPost,
  updatePromptPromptsPromptIdPut,
  deletePromptPromptsPromptIdDelete,
  togglePromptStatusPromptsPromptIdTogglePost,
  getPromptPromptsPromptIdPost,
  listGatewaysGatewaysGet,
  registerGatewayGatewaysPost,
  updateGatewayGatewaysGatewayIdPut,
  // OAuth operations
  initiateOauthFlowOauthAuthorizeGatewayIdGet,
  oauthCallbackOauthCallbackGet,
  getOauthStatusOauthStatusGatewayIdGet,
  fetchToolsAfterOauthOauthFetchToolsGatewayIdPost,
  listRegisteredOauthClientsOauthRegisteredClientsGet,
  getRegisteredClientForGatewayOauthRegisteredClientsGatewayIdGet,
  deleteRegisteredClientOauthRegisteredClientsClientIdDelete,
  deleteGatewayGatewaysGatewayIdDelete,
  toggleGatewayStatusGatewaysGatewayIdTogglePost,
  listA2aAgentsA2aGet,
  createA2aAgentA2aPost,
  getA2aAgentA2aAgentIdGet,
  updateA2aAgentA2aAgentIdPut,
  deleteA2aAgentA2aAgentIdDelete,
  toggleA2aAgentStatusA2aAgentIdTogglePost,
  adminTestA2aAgentAdminA2aAgentIdTestPost,
  listTeamsTeamsGet,
  createTeamTeamsPost,
  updateTeamTeamsTeamIdPut,
  deleteTeamTeamsTeamIdDelete,
  listTokensTokensGet,
  createTokenTokensPost,
  updateTokenTokensTokenIdPut,
  getAvailablePermissionsRbacPermissionsAvailableGet,
  revokeTokenTokensTokenIdDelete,
  handleRpcRpcPost,
  type ServerRead,
  type ServerCreate,
  type ServerUpdate,
  type EmailUserResponse,
  type GatewayRead,
  type GatewayCreate,
  type GatewayUpdate,
  type A2aAgentRead,
  type A2aAgentCreate,
  type A2aAgentUpdate,
  type TeamResponse,
  type TeamCreateRequest,
  type TeamUpdateRequest,
  type TokenResponse,
  type TokenCreateRequest,
  type TokenUpdateRequest,
  type PromptRead,
  type PermissionListResponse,
  type PromptCreate,
  type PromptUpdate,
  type ResourceRead,
  type ResourceCreate,
  type ResourceUpdate,
} from '../contextforge-client-ts';
import { client } from '../contextforge-client-ts/client.gen';
import { createElectronFetchAdapter } from './electron-fetch-adapter';

// API Configuration
const API_BASE_URL = 'http://localhost:4444';
let authToken: string | null = null;

// Create and configure the Electron fetch adapter
const electronFetch = createElectronFetchAdapter();

// Initialize client on module load with auth callback
// The callback will return undefined until login sets authToken
client.setConfig({
  baseUrl: API_BASE_URL,
  fetch: electronFetch as any,
  // Auth callback that always returns the current token value
  auth: () => {
    return authToken || undefined;
  }
});

// Add request interceptor to log headers
client.interceptors.request.use((request) => {
  return request;
});

/**
 * Update the authentication token (called after successful login)
 */
export function setAuthToken(token: string | null) {
  authToken = token;
}

// ============================================================================
// Authentication
// ============================================================================

export async function login(email: string, password: string) {
  const response = await loginAuthEmailLoginPost({
    body: { email, password }
  });
  
  if (response.error) {
    throw new Error('Login failed: ' + JSON.stringify(response.error));
  }
  
  const token = (response.data as any)?.access_token;
  
  if (token) {
    setAuthToken(token);
  }
  
  return response.data;
}

export async function getCurrentUser(): Promise<EmailUserResponse> {
  const response = await getCurrentUserProfileAuthEmailMeGet();
  
  if (response.error) {
    throw new Error('Failed to get current user: ' + JSON.stringify(response.error));
  }
  
  return response.data as EmailUserResponse;
}

// ============================================================================
// Server Operations
// ============================================================================

export async function listServers(includeInactive = true): Promise<ServerRead[]> {
  const response = await listServersServersGet({
    query: { include_inactive: includeInactive }
  });
  
  if (response.error) {
    throw new Error('Failed to list servers: ' + JSON.stringify(response.error));
  }
  
  return (response.data as ServerRead[]) || [];
}

export async function createServer(serverData: ServerCreate) {
  const response = await createServerServersPost({
    body: { server: serverData }
  });
  
  if (response.error) {
    throw new Error('Failed to create server: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function updateServer(serverId: string, serverData: ServerUpdate) {
  const response = await updateServerServersServerIdPut({
    path: { server_id: serverId },
    body: serverData
  });
  
  if (response.error) {
    throw new Error('Failed to update server: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function deleteServer(serverId: string) {
  const response = await deleteServerServersServerIdDelete({
    path: { server_id: serverId }
  });
  
  if (response.error) {
    throw new Error('Failed to delete server: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function toggleServerStatus(serverId: string, activate?: boolean) {
  const response = await toggleServerStatusServersServerIdTogglePost({
    path: { server_id: serverId },
    query: activate !== undefined ? { activate } : undefined
  });
  
  if (response.error) {
    throw new Error('Failed to toggle server status: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// ============================================================================
// Tool Operations
// ============================================================================

export async function listTools(includeInactive = true) {
  const response = await listToolsToolsGet({
    query: { include_inactive: includeInactive }
  });
  
  if (response.error) {
    throw new Error('Failed to list tools: ' + JSON.stringify(response.error));
  }
  
  return response.data || [];
}

export async function createTool(toolData: any) {
  const response = await createToolToolsPost({
    body: { tool: toolData }
  });
  
  if (response.error) {
    throw new Error('Failed to create tool: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function updateTool(toolId: string, toolData: any) {
  const response = await updateToolToolsToolIdPut({
    path: { tool_id: toolId },
    body: toolData
  });
  
  if (response.error) {
    throw new Error('Failed to update tool: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function deleteTool(toolId: string) {
  const response = await deleteToolToolsToolIdDelete({
    path: { tool_id: toolId }
  });
  
  if (response.error) {
    throw new Error('Failed to delete tool: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function toggleToolStatus(toolId: string, activate?: boolean) {
  const response = await toggleToolStatusToolsToolIdTogglePost({
    path: { tool_id: toolId },
    query: activate !== undefined ? { activate } : undefined
  });
  
  if (response.error) {
    throw new Error('Failed to toggle tool status: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// ============================================================================
// Resource Operations
// ============================================================================

export async function listResources(includeInactive = true): Promise<ResourceRead[]> {
  const response = await listResourcesResourcesGet({
    query: { include_inactive: includeInactive }
  });
  
  if (response.error) {
    throw new Error('Failed to list resources: ' + JSON.stringify(response.error));
  }
  
  return response.data || [];
}

export async function createResource(resourceData: ResourceCreate): Promise<ResourceRead> {
  const response = await createResourceResourcesPost({
    body: {
      resource: resourceData
    }
  });
  
  if (response.error) {
    throw new Error('Failed to create resource: ' + JSON.stringify(response.error));
  }
  
  return response.data as ResourceRead;
}

export async function readResource(resourceId: string): Promise<ResourceRead> {
  const response = await readResourceResourcesResourceIdGet({
    path: { resource_id: resourceId }
  });
  
  if (response.error) {
    throw new Error('Failed to read resource: ' + JSON.stringify(response.error));
  }
  
  return response.data as ResourceRead;
}

export async function updateResource(resourceId: string, resourceData: ResourceUpdate): Promise<ResourceRead> {
  const response = await updateResourceResourcesResourceIdPut({
    path: { resource_id: resourceId },
    body: resourceData
  });
  
  if (response.error) {
    throw new Error('Failed to update resource: ' + JSON.stringify(response.error));
  }
  
  return response.data as ResourceRead;
}

export async function deleteResource(resourceId: string): Promise<any> {
  const response = await deleteResourceResourcesResourceIdDelete({
    path: { resource_id: resourceId }
  });
  
  if (response.error) {
    throw new Error('Failed to delete resource: ' + JSON.stringify(response.error));
  }
  
  return response.data || { success: true };
}

export async function toggleResourceStatus(resourceId: string, activate?: boolean) {
  const response = await toggleResourceStatusResourcesResourceIdTogglePost({
    path: { resource_id: parseInt(resourceId) },
    query: activate !== undefined ? { activate } : undefined
  });
  
  if (response.error) {
    throw new Error('Failed to toggle resource status: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// ============================================================================
// Prompt Operations
// ============================================================================

export async function listPrompts(includeInactive = true): Promise<PromptRead[]> {
  const response = await listPromptsPromptsGet({
    query: { include_inactive: includeInactive }
  });
  
  if (response.error) {
    throw new Error('Failed to list prompts: ' + JSON.stringify(response.error));
  }
  
  return (response.data as PromptRead[]) || [];
}

export async function createPrompt(promptData: PromptCreate) {
  const response = await createPromptPromptsPost({
    body: { prompt: promptData }
  });
  
  if (response.error) {
    throw new Error('Failed to create prompt: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function updatePrompt(promptId: string, promptData: PromptUpdate) {
  const response = await updatePromptPromptsPromptIdPut({
    path: { prompt_id: promptId },
    body: promptData
  });
  
  if (response.error) {
    throw new Error('Failed to update prompt: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function deletePrompt(promptId: string) {
  const response = await deletePromptPromptsPromptIdDelete({
    path: { prompt_id: promptId }
  });
  
  if (response.error) {
    throw new Error('Failed to delete prompt: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function togglePromptStatus(promptId: string, activate?: boolean) {
  const response = await togglePromptStatusPromptsPromptIdTogglePost({
    path: { prompt_id: Number(promptId) },
    query: activate !== undefined ? { activate } : undefined
  });
  
  if (response.error) {
    throw new Error('Failed to toggle prompt status: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function executePrompt(promptId: string, args: Record<string, any>) {
  const response = await getPromptPromptsPromptIdPost({
    path: { prompt_id: promptId },
    body: args as any
  });
  
  if (response.error) {
    throw new Error('Failed to execute prompt: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// ============================================================================
// Gateway Operations
// ============================================================================

export async function listGateways(includeInactive = true): Promise<GatewayRead[]> {
  const response = await listGatewaysGatewaysGet({
    query: { include_inactive: includeInactive }
  });
  
  if (response.error) {
    throw new Error('Failed to list gateways: ' + JSON.stringify(response.error));
  }
  
  return (response.data as GatewayRead[]) || [];
}

export async function createGateway(gatewayData: GatewayCreate) {
  const response = await registerGatewayGatewaysPost({
    body: gatewayData
  });
  
  if (response.error) {
    throw new Error('Failed to create gateway: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function updateGateway(gatewayId: string, gatewayData: GatewayUpdate) {
  const response = await updateGatewayGatewaysGatewayIdPut({
    path: { gateway_id: gatewayId },
    body: gatewayData
  });
  
  if (response.error) {
    throw new Error('Failed to update gateway: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function deleteGateway(gatewayId: string) {
  const response = await deleteGatewayGatewaysGatewayIdDelete({
    path: { gateway_id: gatewayId }
  });
  
  if (response.error) {
    throw new Error('Failed to delete gateway: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function toggleGatewayStatus(gatewayId: string, activate?: boolean) {
  const response = await toggleGatewayStatusGatewaysGatewayIdTogglePost({
    path: { gateway_id: gatewayId },
    query: activate !== undefined ? { activate } : undefined
  });
  
  if (response.error) {
    throw new Error('Failed to toggle gateway status: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// ============================================================================
// A2A Agent Operations
// ============================================================================

export async function listA2AAgents(includeInactive = true): Promise<A2aAgentRead[]> {
  const response = await listA2aAgentsA2aGet({
    query: { include_inactive: includeInactive }
  });
  
  if (response.error) {
    throw new Error('Failed to list A2A agents: ' + JSON.stringify(response.error));
  }
  
  return response.data || [];
}

export async function createA2AAgent(agentData: A2aAgentCreate) {
  const response = await createA2aAgentA2aPost({
    body: { agent: agentData }
  });
  
  if (response.error) {
    throw new Error('Failed to create A2A agent: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function getA2AAgent(agentId: string): Promise<A2aAgentRead> {
  const response = await getA2aAgentA2aAgentIdGet({
    path: { agent_id: agentId }
  });
  
  if (response.error) {
    throw new Error('Failed to get A2A agent: ' + JSON.stringify(response.error));
  }
  
  return response.data!;
}

export async function updateA2AAgent(agentId: string, agentData: A2aAgentUpdate) {
  const response = await updateA2aAgentA2aAgentIdPut({
    path: { agent_id: agentId },
    body: agentData
  });
  
  if (response.error) {
    throw new Error('Failed to update A2A agent: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function deleteA2AAgent(agentId: string) {
  const response = await deleteA2aAgentA2aAgentIdDelete({
    path: { agent_id: agentId }
  });
  
  if (response.error) {
    throw new Error('Failed to delete A2A agent: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function toggleA2AAgentStatus(agentId: string, activate?: boolean) {
  const response = await toggleA2aAgentStatusA2aAgentIdTogglePost({
    path: { agent_id: agentId },
    query: activate !== undefined ? { activate } : undefined
  });
  
  if (response.error) {
    throw new Error('Failed to toggle A2A agent status: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

/**
 * Test A2A agent connection
 * This endpoint tests the agent's connectivity and authentication
 */
export async function testA2AAgent(agentId: string): Promise<any> {
  const response = await adminTestA2aAgentAdminA2aAgentIdTestPost({
    path: { agent_id: agentId }
  });
  
  if (response.error) {
    throw new Error('Failed to test A2A agent: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// ============================================================================
// OAuth Operations (using backend endpoints)
// ============================================================================

/**
 * Initiate OAuth flow for a gateway
 * This redirects to the OAuth provider's authorization page
 * The backend handles generating the proper authorization URL with correct redirect URI
 */
export async function initiateOAuthFlow(gatewayId: string): Promise<any> {
  const response = await initiateOauthFlowOauthAuthorizeGatewayIdGet({
    path: { gateway_id: gatewayId }
  });
  
  if (response.error) {
    throw new Error('Failed to initiate OAuth flow: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

/**
 * Handle OAuth callback (typically called by the backend, but exposed for completeness)
 */
export async function handleOAuthCallback(code: string, state: string): Promise<any> {
  const response = await oauthCallbackOauthCallbackGet({
    query: { code, state }
  });
  
  if (response.error) {
    throw new Error('OAuth callback failed: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

/**
 * Get OAuth status for a gateway
 * Use this to check if OAuth is complete and tokens are available
 */
export async function getOAuthStatus(gatewayId: string): Promise<any> {
  const response = await getOauthStatusOauthStatusGatewayIdGet({
    path: { gateway_id: gatewayId }
  });
  
  if (response.error) {
    throw new Error('Failed to get OAuth status: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

/**
 * Fetch tools after OAuth completion
 */
export async function fetchToolsAfterOAuth(gatewayId: string): Promise<any> {
  const response = await fetchToolsAfterOauthOauthFetchToolsGatewayIdPost({
    path: { gateway_id: gatewayId }
  });
  
  if (response.error) {
    throw new Error('Failed to fetch tools after OAuth: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

/**
 * Get the backend's OAuth authorize URL for a gateway
 * This URL should be opened in a browser for the user to complete authorization
 * The backend handles the OAuth callback and stores tokens per-user
 */
export function getBackendOAuthAuthorizeUrl(gatewayId: string): string {
  return `${API_BASE_URL}/oauth/authorize/${gatewayId}`;
}

/**
 * List registered OAuth clients
 */
export async function listRegisteredOAuthClients(): Promise<any> {
  const response = await listRegisteredOauthClientsOauthRegisteredClientsGet();
  
  if (response.error) {
    throw new Error('Failed to list registered OAuth clients: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

/**
 * Get registered OAuth client for a gateway
 */
export async function getRegisteredClientForGateway(gatewayId: string): Promise<any> {
  const response = await getRegisteredClientForGatewayOauthRegisteredClientsGatewayIdGet({
    path: { gateway_id: gatewayId }
  });
  
  if (response.error) {
    throw new Error('Failed to get registered client: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

/**
 * Delete a registered OAuth client
 */
export async function deleteRegisteredOAuthClient(clientId: string): Promise<any> {
  const response = await deleteRegisteredClientOauthRegisteredClientsClientIdDelete({
    path: { client_id: clientId }
  });
  
  if (response.error) {
    throw new Error('Failed to delete registered client: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// Legacy OAuth functions - kept for backwards compatibility but now use electronFetch for direct calls
// These are used when testing OAuth with external providers directly (not through gateways)

export async function getClientCredentialsToken(oauthConfig: any): Promise<any> {
  // Client Credentials flow - directly request token from token endpoint
  const response = await electronFetch(oauthConfig.token_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: oauthConfig.client_id,
      client_secret: oauthConfig.client_secret,
      scope: oauthConfig.scopes?.join(' ') || '',
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Client credentials token request failed: ${error}`);
  }

  return await response.json();
}

export async function testAgentConnection(agentEndpoint: string, accessToken: string): Promise<any> {
  // Test the agent connection with the obtained token
  const response = await electronFetch(agentEndpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Agent connection test failed: ${error}`);
  }

  return {
    success: true,
    message: 'Agent connection successful',
    responseTime: 0, // Could measure this
  };
}

export async function refreshOAuthToken(refreshToken: string, oauthConfig: any): Promise<any> {
  // Refresh the OAuth token
  const response = await electronFetch(oauthConfig.token_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: oauthConfig.client_id,
      client_secret: oauthConfig.client_secret,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  return await response.json();
}

// ============================================================================
// User Operations
// ============================================================================

export async function listUsers(): Promise<EmailUserResponse[]> {
  console.log('listUsers: Making request');
  console.log('listUsers: authToken exists?', !!authToken);
  console.log('listUsers: authToken value:', authToken ? authToken.substring(0, 30) + '...' : 'null');
  
  const response = await listUsersAuthEmailAdminUsersGet();
  
  if (response.error) {
    console.error('listUsers: Error response:', response.error);
    throw new Error('Failed to list users: ' + JSON.stringify(response.error));
  }
  
  console.log('listUsers: Success, got', ((response.data as any)?.users as EmailUserResponse[])?.length || 0, 'users');
  // The API returns UserListResponse with a users array
  return ((response.data as any)?.users as EmailUserResponse[]) || [];
}

export async function createUser(userData: {
  email: string;
  password: string;
  full_name?: string;
  is_admin?: boolean;
}) {
  const response = await createUserAuthEmailAdminUsersPost({
    body: userData
  });
  
  if (response.error) {
    throw new Error('Failed to create user: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function updateUser(email: string, userData: {
  full_name?: string;
  password?: string;
  is_admin?: boolean;
  is_active?: boolean;
}) {
  const response = await updateUserAuthEmailAdminUsersUserEmailPut({
    path: { user_email: email },
    body: {
      email, // Required by the API
      ...userData
    } as any
  });
  
  if (response.error) {
    throw new Error('Failed to update user: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function deleteUser(email: string) {
  const response = await deleteUserAuthEmailAdminUsersUserEmailDelete({
    path: { user_email: email }
  });
  
  if (response.error) {
    throw new Error('Failed to delete user: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function activateUser(email: string) {
  const response = await adminActivateUserAdminUsersUserEmailActivatePost({
    path: { user_email: email }
  });
  
  if (response.error) {
    throw new Error('Failed to activate user: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function deactivateUser(email: string) {
  const response = await adminDeactivateUserAdminUsersUserEmailDeactivatePost({
    path: { user_email: email }
  });
  
  if (response.error) {
    throw new Error('Failed to deactivate user: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// ============================================================================
// RBAC (Role-Based Access Control) Operations
// ============================================================================

export async function listRoles() {
  const response = await listRolesRbacRolesGet();
  
  if (response.error) {
    throw new Error('Failed to list roles: ' + JSON.stringify(response.error));
  }
  
  return response.data || [];
}

export async function getUserRoles(email: string) {
  const response = await getUserRolesRbacUsersUserEmailRolesGet({
    path: { user_email: email }
  });
  
  if (response.error) {
    throw new Error('Failed to get user roles: ' + JSON.stringify(response.error));
  }
  
  return response.data || [];
}

export async function assignRoleToUser(email: string, roleId: string) {
  const response = await assignRoleToUserRbacUsersUserEmailRolesPost({
    path: { user_email: email },
    body: { role_id: roleId } as any
  });
  
  if (response.error) {
    throw new Error('Failed to assign role: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function revokeRoleFromUser(email: string, roleId: string) {
  const response = await revokeUserRoleRbacUsersUserEmailRolesRoleIdDelete({
    path: { user_email: email, role_id: roleId }
  });
  
  if (response.error) {
    throw new Error('Failed to revoke role: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// ============================================================================
// Team Operations
// ============================================================================

export async function listTeams(): Promise<TeamResponse[]> {
  const response = await listTeamsTeamsGet();
  
  if (response.error) {
    throw new Error('Failed to list teams: ' + JSON.stringify(response.error));
  }
  
  // The API returns TeamListResponse with a teams array
  return ((response.data as any)?.teams as TeamResponse[]) || [];
}

export async function createTeam(teamData: TeamCreateRequest) {
  const response = await createTeamTeamsPost({
    body: teamData
  });
  
  if (response.error) {
    throw new Error('Failed to create team: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function updateTeam(teamId: string, teamData: TeamUpdateRequest) {
  const response = await updateTeamTeamsTeamIdPut({
    path: { team_id: teamId },
    body: teamData
  });
  
  if (response.error) {
    throw new Error('Failed to update team: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function deleteTeam(teamId: string) {
  const response = await deleteTeamTeamsTeamIdDelete({
    path: { team_id: teamId }
  });
  
  if (response.error) {
    throw new Error('Failed to delete team: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// ============================================================================
// Token Operations
// ============================================================================

export async function listTokens(): Promise<TokenResponse[]> {
  const response = await listTokensTokensGet();
  
  if (response.error) {
    throw new Error('Failed to list tokens: ' + JSON.stringify(response.error));
  }
  
  // The API returns TokenListResponse with a tokens array
  return ((response.data as any)?.tokens as TokenResponse[]) || [];
}

export async function createToken(tokenData: TokenCreateRequest) {
  const response = await createTokenTokensPost({
    body: tokenData
  });
  
  if (response.error) {
    throw new Error('Failed to create token: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function updateToken(tokenId: string, tokenData: TokenUpdateRequest) {
  const response = await updateTokenTokensTokenIdPut({
    path: { token_id: tokenId },
    body: tokenData
  });
  
  if (response.error) {
    throw new Error('Failed to update token: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

export async function revokeToken(tokenId: string) {
  const response = await revokeTokenTokensTokenIdDelete({
    path: { token_id: tokenId }
  });
  
  if (response.error) {
    throw new Error('Failed to revoke token: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// ============================================================================
// RBAC / Permissions Operations
// ============================================================================

export async function getAvailablePermissions(): Promise<PermissionListResponse> {
  const response = await getAvailablePermissionsRbacPermissionsAvailableGet();
  
  if (response.error) {
    throw new Error('Failed to get available permissions: ' + JSON.stringify(response.error));
  }
  
  return response.data as PermissionListResponse;
}

// ============================================================================
// RPC Operations (Tool Execution)
// ============================================================================

/**
 * Execute a tool via JSON-RPC
 *
 * @param toolName - The name of the tool/method to execute
 * @param params - Parameters to pass to the tool
 * @param passthroughHeaders - Optional custom headers to pass through
 * @param timeout - Request timeout in milliseconds (default: 60000)
 * @returns The JSON-RPC response **/
// ============================================================================
// Metrics Operations
// ============================================================================

export async function getAggregatedMetrics() {
  // Call both endpoints to get complete data:
  // - system stats for users, teams, and resource counts
  // - metrics for execution stats and top performers
  const [systemStatsResponse, metricsResponse] = await Promise.all([
    getSystemStatsAdminSystemStatsGet(),
    getAggregatedMetricsAdminMetricsGet()
  ]);
  
  if (systemStatsResponse.error) {
    throw new Error('Failed to get system stats: ' + JSON.stringify(systemStatsResponse.error));
  }
  
  if (metricsResponse.error) {
    throw new Error('Failed to get metrics: ' + JSON.stringify(metricsResponse.error));
  }
  
  // Merge the two responses
  const mergedData = Object.assign({}, systemStatsResponse.data, {
    // Override metrics from system stats with detailed metrics from metrics endpoint
    metrics: metricsResponse.data
  });
  
  // Import the mapper
  const { mapMetricsResponse } = await import('./metrics-mapper');
  
  // Transform the merged response to match our interface
  return mapMetricsResponse(mergedData);
}

// ============================================================================
// RPC Operations
// ============================================================================

/**
 * Execute a tool via RPC
 */
export async function executeToolRpc(
  toolName: string,
  params: Record<string, any> = {},
  passthroughHeaders: Record<string, string> = {},
  timeout: number = 60000
): Promise<any> {
  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: toolName,
    params,
  };

  // Merge passthrough headers with default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...passthroughHeaders,
  };

  // Add authorization header if token is available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);
  });

  // Create the fetch promise with custom headers
  const fetchPromise = (async () => {
    try {
      // Use the Electron fetch adapter directly with the RPC endpoint
      const response = await electronFetch(`${API_BASE_URL}/rpc`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`RPC request failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  })();

  // Race between fetch and timeout
  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error during RPC execution');
  }
}

// ============================================================================
// Type Exports
// ============================================================================

export type {
  ServerRead,
  ServerCreate,
  ServerUpdate,
  GatewayRead,
  GatewayCreate,
  GatewayUpdate,
  EmailUserResponse,
  TeamResponse,
  TeamCreateRequest,
  TeamUpdateRequest,
  TokenResponse,
  TokenCreateRequest,
  TokenUpdateRequest,
  PromptRead,
  PromptCreate,
  PromptUpdate,
};
