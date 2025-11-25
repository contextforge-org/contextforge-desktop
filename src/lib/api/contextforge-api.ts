import { 
  listServersServersGet,
  createServerServersPost,
  updateServerServersServerIdPut,
  deleteServerServersServerIdDelete,
  toggleServerStatusServersServerIdTogglePost,
  loginAuthEmailLoginPost,
  type ServerRead,
  type ServerCreate,
  type ServerUpdate
} from '../contextforge-client-ts';
import { client } from '../contextforge-client-ts/client.gen';

// Configure the client
const API_BASE_URL = 'http://localhost:4444';

export function configureClient(token?: string) {
  client.setConfig({
    baseUrl: API_BASE_URL,
    headers: token ? {
      'Authorization': `Bearer ${token}`
    } : {}
  });
}

// Authentication
export async function login(email: string, password: string) {
  const response = await loginAuthEmailLoginPost({
    body: { email, password }
  });
  
  if (response.error) {
    throw new Error('Login failed: ' + JSON.stringify(response.error));
  }
  
  const token = (response.data as any)?.access_token;
  if (token) {
    configureClient(token);
    // Store token in localStorage for persistence
    localStorage.setItem('contextforge_token', token);
  }
  
  return response.data;
}

// Initialize client with stored token if available
export function initializeClient() {
  const token = localStorage.getItem('contextforge_token');
  if (token) {
    configureClient(token);
  } else {
    configureClient();
  }
}

// Server operations
export async function listServers() {
  const response = await listServersServersGet();
  
  if (response.error) {
    throw new Error('Failed to list servers: ' + JSON.stringify(response.error));
  }
  
  return response.data || [];
}

export async function createServer(serverData: ServerCreate) {
  const response = await createServerServersPost({
    body: {
      server: serverData
    }
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

export async function toggleServerStatus(serverId: string) {
  const response = await toggleServerStatusServersServerIdTogglePost({
    path: { server_id: serverId }
  });
  
  if (response.error) {
    throw new Error('Failed to toggle server status: ' + JSON.stringify(response.error));
  }
  
  return response.data;
}

// Type exports for convenience
export type { ServerRead, ServerCreate, ServerUpdate };
