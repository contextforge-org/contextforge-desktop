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
  listToolsToolsGet,
  createToolToolsPost,
  updateToolToolsToolIdPut,
  deleteToolToolsToolIdDelete,
  toggleToolStatusToolsToolIdTogglePost,
  listResourcesResourcesGet,
  listPromptsPromptsGet,
  createPromptPromptsPost,
  updatePromptPromptsPromptIdPut,
  deletePromptPromptsPromptIdDelete,
  togglePromptStatusPromptsPromptIdTogglePost,
  getPromptPromptsPromptIdPost,
  listGatewaysGatewaysGet,
  registerGatewayGatewaysPost,
  updateGatewayGatewaysGatewayIdPut,
  deleteGatewayGatewaysGatewayIdDelete,
  toggleGatewayStatusGatewaysGatewayIdTogglePost,
  listTeamsTeamsGet,
  handleRpcRpcPost,
  type ServerRead,
  type ServerCreate,
  type ServerUpdate,
  type EmailUserResponse,
  type GatewayRead,
  type GatewayCreate,
  type GatewayUpdate,
  type TeamListResponse,
  type PromptRead,
  type PromptCreate,
  type PromptUpdate,
} from '../contextforge-client-ts';
import { client } from '../contextforge-client-ts/client.gen';
import { createElectronFetchAdapter } from './electron-fetch-adapter';

// API Configuration
const API_BASE_URL = 'http://localhost:4444';
let authToken: string | null = null;

// Create and configure the Electron fetch adapter
const electronFetch = createElectronFetchAdapter();

/**
 * Configure the client for main process with optional authentication token
 */
export function configureMainClient(token?: string) {
  authToken = token || null;
  
  client.setConfig({
    baseUrl: API_BASE_URL,
    fetch: electronFetch as any, // Use Electron adapter instead of native fetch
    headers: token ? {
      'Authorization': `Bearer ${token}`
    } : {}
  });
}

// Initialize client on module load
configureMainClient();

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
    configureMainClient(token);
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

export async function listResources() {
  const response = await listResourcesResourcesGet();
  
  if (response.error) {
    throw new Error('Failed to list resources: ' + JSON.stringify(response.error));
  }
  
  return response.data || [];
}

// ============================================================================
// Prompt Operations
// ============================================================================

export async function listPrompts(): Promise<PromptRead[]> {
  const response = await listPromptsPromptsGet();
  
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
// Team Operations
// ============================================================================

export async function listTeams(): Promise<TeamListResponse> {
  const response = await listTeamsTeamsGet();
  
  if (response.error) {
    throw new Error('Failed to list teams: ' + JSON.stringify(response.error));
  }
  
  return (response.data as TeamListResponse) || { teams: [], total: 0 };
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
 * @returns The JSON-RPC response
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
  TeamListResponse,
  PromptRead,
  PromptCreate,
  PromptUpdate,
};
