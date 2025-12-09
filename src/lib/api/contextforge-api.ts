import {
  listServersServersGet,
  createServerServersPost,
  updateServerServersServerIdPut,
  deleteServerServersServerIdDelete,
  toggleServerStatusServersServerIdTogglePost,
  loginAuthEmailLoginPost,
  getCurrentUserProfileAuthEmailMeGet,
  type ServerRead,
  type ServerCreate,
  type ServerUpdate,
  type EmailUserResponse
} from '../contextforge-client-ts';
import { client } from '../contextforge-client-ts/client.gen';

// Configure the client
// API_BASE_URL can be set via environment variable or defaults to localhost
const API_BASE_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:4444';

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
  console.log('API: Login attempt for', email);
  const response = await loginAuthEmailLoginPost({
    body: { email, password }
  });
  
  if (response.error) {
    console.error('API: Login failed', response.error);
    throw new Error('Login failed: ' + JSON.stringify(response.error));
  }
  
  const token = (response.data as any)?.access_token;
  console.log('API: Login response received, token:', token ? 'exists' : 'missing');
  if (token) {
    configureClient(token);
    // Store token in localStorage for persistence
    localStorage.setItem('contextforge_token', token);
    console.log('API: Token stored in localStorage');
    // Dispatch custom event to notify components of login
    const event = new Event('contextforge-login');
    window.dispatchEvent(event);
    console.log('API: Dispatched contextforge-login event');
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

// Get current user profile
export async function getCurrentUser() {
  const response = await getCurrentUserProfileAuthEmailMeGet();
  
  if (response.error) {
    throw new Error('Failed to get current user: ' + JSON.stringify(response.error));
  }
  
  return response.data;
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
export type { ServerRead, ServerCreate, ServerUpdate, EmailUserResponse };
