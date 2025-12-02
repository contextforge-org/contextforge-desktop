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
  // Transform backend oauth_config (authorization_url) to UI format (auth_url)
  let oauthConfig = null;
  const backendOAuthConfig = (gateway as any).oauthConfig;
  if (backendOAuthConfig) {
    oauthConfig = {
      grant_type: backendOAuthConfig.grant_type,
      client_id: backendOAuthConfig.client_id,
      client_secret: backendOAuthConfig.client_secret,
      token_url: backendOAuthConfig.token_url,
      // Backend uses 'authorization_url', UI uses 'auth_url'
      auth_url: backendOAuthConfig.authorization_url || backendOAuthConfig.auth_url,
      redirect_uri: backendOAuthConfig.redirect_uri,
      scopes: backendOAuthConfig.scopes || [],
      access_token: backendOAuthConfig.access_token,
      refresh_token: backendOAuthConfig.refresh_token,
      token_expires_at: backendOAuthConfig.token_expires_at,
    };
  }

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
    teamId: gateway.teamId || null,
    visibility: (gateway.visibility as 'public' | 'team' | 'private') || 'private',
    transportType: mapTransportTypeToUI(gateway.transport),
    authenticationType: mapAPIAuthTypeToUI(gateway.authType) || 'None',
    passthroughHeaders: gateway.passthroughHeaders || [],
    oauthConfig: oauthConfig,
    authToken: (gateway as any).authToken || '',
    authUsername: (gateway as any).authUsername || '',
    authPassword: (gateway as any).authPassword || '',
    authHeaders: (gateway as any).authHeaders || [],
  };
}

/**
 * Maps API auth_type to UI authentication type
 */
function mapAPIAuthTypeToUI(authType: string | null | undefined): string {
  if (!authType) return 'None';
  
  const mapping: Record<string, string> = {
    'basic': 'Basic',
    'bearer': 'Bearer Token',
    'headers': 'Custom Headers',
    'oauth': 'OAuth 2.0',
  };
  
  return mapping[authType.toLowerCase()] || authType;
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
 * Maps UI transport type to API transport type
 */
function mapTransportTypeToAPI(transportType: string | undefined): string {
  if (!transportType) return 'SSE';
  // UI uses "Streamable HTTP" but API expects "STREAMABLEHTTP"
  if (transportType === 'Streamable HTTP') return 'STREAMABLEHTTP';
  return transportType;
}

/**
 * Maps API transport type to UI transport type
 */
function mapTransportTypeToUI(transportType: string | undefined): string {
  if (!transportType) return 'SSE';
  // API uses "STREAMABLEHTTP" but UI expects "Streamable HTTP"
  if (transportType === 'STREAMABLEHTTP') return 'Streamable HTTP';
  return transportType;
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
    transport: mapTransportTypeToAPI(server.transportType),
    passthrough_headers: server.passthroughHeaders || [],
  };
  
  // Only include auth_type if it's not null (i.e., not "None")
  const authType = mapAuthTypeToAPI(server.authenticationType);
  if (authType !== null) {
    payload.auth_type = authType;
  }
  
  // Include auth credentials based on authentication type
  if (server.authenticationType === 'Bearer Token' && server.authToken) {
    payload.auth_token = server.authToken;
  }
  
  if (server.authenticationType === 'Basic' && (server.authUsername || server.authPassword)) {
    payload.auth_username = server.authUsername || '';
    payload.auth_password = server.authPassword || '';
  }
  
  if (server.authenticationType === 'Custom Headers' && server.authHeaders && server.authHeaders.length > 0) {
    // Filter out empty headers and convert to API format (array of single key-value objects)
    const validHeaders = server.authHeaders.filter(h => h.key && h.key.trim());
    if (validHeaders.length > 0) {
      payload.auth_headers = validHeaders.map(h => ({ [h.key]: h.value }));
    }
  }
  
  // Include OAuth config if authentication type is OAuth 2.0 and config exists
  if (server.authenticationType === 'OAuth 2.0' && server.oauthConfig) {
    const isAuthCodeFlow = server.oauthConfig.grant_type === 'authorization_code';
    
    payload.oauth_config = {
      grant_type: server.oauthConfig.grant_type,
      client_id: server.oauthConfig.client_id,
      client_secret: server.oauthConfig.client_secret,
      token_url: server.oauthConfig.token_url,
      // Backend expects 'authorization_url', not 'auth_url'
      authorization_url: server.oauthConfig.auth_url,
      redirect_uri: server.oauthConfig.redirect_uri,
      scopes: server.oauthConfig.scopes,
    };
    
    // For client_credentials flow: include tokens (backend uses them from oauth_config)
    // For authorization_code flow: DON'T include tokens (backend uses per-user oauth_tokens table)
    if (!isAuthCodeFlow) {
      payload.oauth_config.access_token = server.oauthConfig.access_token;
      payload.oauth_config.refresh_token = server.oauthConfig.refresh_token;
      payload.oauth_config.token_expires_at = server.oauthConfig.token_expires_at;
      // Tell backend that authorization is complete if we have an access token (client_credentials only)
      payload.oauth_config.is_authorized = !!server.oauthConfig.access_token;
    }
    
    console.log('[mapMCPServerToGatewayCreate] OAuth config included:', {
      grant_type: server.oauthConfig.grant_type,
      client_id: server.oauthConfig.client_id ? '***' : undefined,
      authorization_url: server.oauthConfig.auth_url,
      redirect_uri: server.oauthConfig.redirect_uri,
      is_auth_code_flow: isAuthCodeFlow,
      has_access_token: !isAuthCodeFlow && !!server.oauthConfig.access_token,
      is_authorized: !isAuthCodeFlow && !!server.oauthConfig.access_token,
    });
  } else if (server.authenticationType === 'OAuth 2.0') {
    console.warn('[mapMCPServerToGatewayCreate] OAuth 2.0 selected but no oauthConfig provided');
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
    transport: mapTransportTypeToAPI(server.transportType),
    passthrough_headers: server.passthroughHeaders,
    enabled: server.active,
  };
  
  // Only include auth_type if it's not null (i.e., not "None")
  const authType = mapAuthTypeToAPI(server.authenticationType);
  if (authType !== null) {
    payload.auth_type = authType;
  }
  
  // Include auth credentials based on authentication type
  if (server.authenticationType === 'Bearer Token') {
    payload.auth_token = server.authToken || '';
  }
  
  if (server.authenticationType === 'Basic') {
    payload.auth_username = server.authUsername || '';
    payload.auth_password = server.authPassword || '';
  }
  
  if (server.authenticationType === 'Custom Headers') {
    // Filter out empty headers and convert to API format (array of single key-value objects)
    const validHeaders = (server.authHeaders || []).filter(h => h.key && h.key.trim());
    payload.auth_headers = validHeaders.length > 0 
      ? validHeaders.map(h => ({ [h.key]: h.value }))
      : [];
  }
  
  // Include OAuth config if authentication type is OAuth 2.0 and config exists
  if (server.authenticationType === 'OAuth 2.0' && server.oauthConfig) {
    const isAuthCodeFlow = server.oauthConfig.grant_type === 'authorization_code';
    
    payload.oauth_config = {
      grant_type: server.oauthConfig.grant_type,
      client_id: server.oauthConfig.client_id,
      client_secret: server.oauthConfig.client_secret,
      token_url: server.oauthConfig.token_url,
      // Backend expects 'authorization_url', not 'auth_url'
      authorization_url: server.oauthConfig.auth_url,
      redirect_uri: server.oauthConfig.redirect_uri,
      scopes: server.oauthConfig.scopes,
    };
    
    // For client_credentials flow: include tokens (backend uses them from oauth_config)
    // For authorization_code flow: DON'T include tokens (backend uses per-user oauth_tokens table)
    if (!isAuthCodeFlow) {
      payload.oauth_config.access_token = server.oauthConfig.access_token;
      payload.oauth_config.refresh_token = server.oauthConfig.refresh_token;
      payload.oauth_config.token_expires_at = server.oauthConfig.token_expires_at;
      payload.oauth_config.is_authorized = !!server.oauthConfig.access_token;
    }
  }
  
  return payload;
}
