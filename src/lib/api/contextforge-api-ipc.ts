import {
  type ServerRead,
  type ServerCreate,
  type ServerUpdate,
  type GatewayRead,
  type GatewayCreate,
  type GatewayUpdate,
  type EmailUserResponse,
  type TeamListResponse
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
export async function listResources() {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listResources();
  
  if (!response.success) {
    throw new Error('Failed to list resources: ' + response.error);
  }
  
  return response.data || [];
}

// Prompt operations
export async function listPrompts() {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listPrompts();
  
  if (!response.success) {
    throw new Error('Failed to list prompts: ' + response.error);
  }
  
  return response.data || [];
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

// Team operations
export async function listTeams(): Promise<TeamListResponse> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.listTeams();
  
  if (!response.success) {
    throw new Error('Failed to list teams: ' + response.error);
  }
  
  return response.data || { teams: [], total: 0 };
}

// Type exports for convenience
export type { ServerRead, ServerCreate, ServerUpdate, GatewayRead, GatewayCreate, GatewayUpdate };
