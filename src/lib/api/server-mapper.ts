import { ServerRead } from './contextforge-api';
import { GatewayRead } from '../contextforge-client-ts';
import { MCPServer } from '../../types/server';

/**
 * Maps a ServerRead from the API to the MCPServer type used in the UI
 */
export function mapServerReadToMCPServer(server: ServerRead): MCPServer {
  return {
    id: server.id,
    name: server.name,
    logoUrl: server.icon || '', // Use icon as logoUrl, default to empty string
    url: '', // ServerRead doesn't have endpoint_url, we'll need to handle this
    description: server.description || '',
    tags: server.tags || [],
    active: server.isActive,
    lastSeen: formatLastSeen(server.updatedAt),
    team: server.team || 'Unknown',
    visibility: (server.visibility as 'public' | 'team' | 'private') || 'private',
    transportType: 'SSE', // Default, would need to come from server config
    authenticationType: 'OAuth 2.0', // Default, would need to come from server config
    passthroughHeaders: [], // Would need to come from server config
    associatedTools: (server as any).associatedTools || [],
    associatedResources: (server as any).associatedResources || [],
    associatedPrompts: (server as any).associatedPrompts || [],
  } as any;
}

/**
 * Maps an MCPServer to ServerCreate for API calls
 */
export function mapMCPServerToServerCreate(server: Partial<MCPServer> & { associatedTools?: string[], associatedResources?: string[], associatedPrompts?: string[] }) {
  const payload: any = {
    name: server.name || '',
    description: server.description || null,
    icon: server.logoUrl || null,
    tags: server.tags || [],
    visibility: server.visibility || 'private',
    associated_tools: server.associatedTools || [],
    associated_resources: server.associatedResources || [],
    associated_prompts: server.associatedPrompts || [],
  };
  
  // Only include id if provided (custom UUID)
  if (server.id) {
    payload.id = server.id;
  }
  
  return payload;
}

/**
 * Maps an MCPServer to ServerUpdate for API calls
 */
export function mapMCPServerToServerUpdate(server: Partial<MCPServer> & { associatedTools?: string[], associatedResources?: string[], associatedPrompts?: string[] }) {
  return {
    name: server.name,
    description: server.description || null,
    icon: server.logoUrl || null,
    tags: server.tags,
    visibility: server.visibility,
    isActive: server.active,
    associated_tools: server.associatedTools,
    associated_resources: server.associatedResources,
    associated_prompts: server.associatedPrompts,
  };
}

/**
 * Formats the updatedAt timestamp to a human-readable "last seen" string
 */
function formatLastSeen(updatedAt: string): string {
  const now = new Date();
  const updated = new Date(updatedAt);
  const diffMs = now.getTime() - updated.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Maps a GatewayRead from the API to the MCPServer type used in the UI
 */
export function mapGatewayReadToMCPServer(gateway: GatewayRead): MCPServer {
  return {
    id: gateway.id || '',
    name: gateway.name,
    logoUrl: '', // GatewayRead doesn't have icon field
    url: gateway.url || '',
    description: gateway.description || '',
    tags: gateway.tags || [],
    active: gateway.enabled || false,
    lastSeen: gateway.lastSeen ? formatLastSeen(gateway.lastSeen) : 'Never',
    team: gateway.team || 'Unknown',
    visibility: (gateway.visibility as 'public' | 'team' | 'private') || 'private',
    transportType: gateway.transport || 'SSE',
    authenticationType: gateway.authType || 'None',
    passthroughHeaders: gateway.passthroughHeaders || [],
  };
}

/**
 * Maps UI authentication type to API auth_type
 * Returns null for "None" since the API doesn't accept "none" as a value
 */
function mapAuthTypeToAPI(authType: string | undefined): string | null {
  if (!authType || authType === 'None') return null;
  
  const mapping: Record<string, string> = {
    'Basic': 'basic',
    'Bearer Token': 'bearer',
    'Custom Headers': 'headers',
    'OAuth 2.0': 'oauth',
  };
  
  return mapping[authType] || authType.toLowerCase();
}

/**
 * Maps an MCPServer to GatewayCreate for API calls
 */
export function mapMCPServerToGatewayCreate(server: Partial<MCPServer>) {
  const payload: any = {
    name: server.name || '',
    url: server.url || '',
    description: server.description || null,
    tags: server.tags || [],
    visibility: server.visibility || 'private',
    transport: server.transportType || 'SSE',
    passthrough_headers: server.passthroughHeaders || [],
  };
  
  // Only include auth_type if it's not null (i.e., not "None")
  const authType = mapAuthTypeToAPI(server.authenticationType);
  if (authType !== null) {
    payload.auth_type = authType;
  }
  
  return payload;
}

/**
 * Maps an MCPServer to GatewayUpdate for API calls
 */
export function mapMCPServerToGatewayUpdate(server: Partial<MCPServer>) {
  const payload: any = {
    name: server.name,
    url: server.url,
    description: server.description || null,
    tags: server.tags,
    visibility: server.visibility,
    transport: server.transportType,
    passthrough_headers: server.passthroughHeaders,
    enabled: server.active,
  };
  
  // Only include auth_type if it's not null (i.e., not "None")
  const authType = mapAuthTypeToAPI(server.authenticationType);
  if (authType !== null) {
    payload.auth_type = authType;
  }
  
  return payload;
}
