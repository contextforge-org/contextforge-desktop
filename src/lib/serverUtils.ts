import { toast } from './toastWithTray';
import { MCPServer, OAuthConfig, AuthHeader } from '../types/server';

/**
 * Type for edited server data (excludes auto-generated fields)
 */
export type EditedServerData = {
  name: string;
  url: string;
  iconUrl?: string;
  logoUrl?: string; // Alias for iconUrl, used by getEditedServer
  description: string;
  tags: string[];
  visibility: 'public' | 'team' | 'private';
  transportType: string;
  authenticationType: string;
  passthroughHeaders: string[];
  active: boolean;
  // Authentication credentials
  oauthConfig?: OAuthConfig | null;
  authToken?: string;
  authUsername?: string;
  authPassword?: string;
  authHeaders?: AuthHeader[];
  // Associated items
  associatedTools?: string[];
  associatedResources?: string[];
  associatedPrompts?: string[];
};

/**
 * Toast configuration constants
 */
export const TOAST_CONFIG = {
  UNDO_DURATION: 5000,
  MESSAGES: {
    DEACTIVATED: (name: string) => `"${name}" deactivated`,
    DEACTIVATION_DESC: 'The server has been deactivated',
    DELETED: (name: string) => `"${name}" deleted`,
    RESTORED: (name: string) => `"${name}" restored`,
    CREATED: (name: string) => `"${name}" created successfully`,
    UPDATED: (name: string) => `"${name}" updated successfully`,
    UNDO_LABEL: 'Undo',
    UNDO_INFO: 'Deactivation undone',
  }
} as const;

/**
 * Default values for new servers
 */
export const SERVER_DEFAULTS = {
  LOGO_URL: '',
  LAST_SEEN: 'Just now',
  TEAM: 'My Team',
  DEFAULT_NAME: 'New Gateway',
} as const;

/**
 * Find a server by ID in the servers array
 */
export function findServerById(
  servers: MCPServer[],
  serverId: string
): MCPServer | undefined {
  return servers.find(s => s.id === serverId);
}

/**
 * Generate the next available server ID (UUID format for API compatibility)
 */
export function generateNextId(servers: MCPServer[]): string {
  // Generate a simple UUID-like string for new servers
  // In production, the API will generate the actual UUID
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new server object from edited data
 */
export function createNewServer(
  editedServer: EditedServerData,
  nextId: string
): MCPServer {
  return {
    id: nextId,
    name: editedServer.name || SERVER_DEFAULTS.DEFAULT_NAME,
    logoUrl: SERVER_DEFAULTS.LOGO_URL,
    url: editedServer.url || '',
    description: editedServer.description || '',
    tags: editedServer.tags,
    active: editedServer.active,
    lastSeen: SERVER_DEFAULTS.LAST_SEEN,
    team: SERVER_DEFAULTS.TEAM,
    visibility: editedServer.visibility,
    transportType: editedServer.transportType,
    authenticationType: editedServer.authenticationType,
    passthroughHeaders: editedServer.passthroughHeaders
  };
}

/**
 * Create a duplicate of a server with a new ID and modified name
 */
export function duplicateServer(
  server: MCPServer,
  nextId: string
): MCPServer {
  return {
    ...server,
    id: nextId,
    name: `${server.name} (Copy)`
  };
}

/**
 * Update server properties while preserving other fields
 */
export function updateServerProperties(
  server: MCPServer,
  editedServer: EditedServerData
): MCPServer {
  return {
    ...server,
    name: editedServer.name,
    url: editedServer.url,
    description: editedServer.description,
    tags: editedServer.tags,
    visibility: editedServer.visibility,
    transportType: editedServer.transportType,
    authenticationType: editedServer.authenticationType,
    passthroughHeaders: editedServer.passthroughHeaders,
    active: editedServer.active
  };
}

/**
 * Show a toast notification with an undo action
 */
export function showUndoToast(
  message: string,
  onUndo: () => void,
  options?: {
    description?: string;
    duration?: number;
  }
): void {
  toast.success(message, {
    description: options?.description,
    action: {
      label: TOAST_CONFIG.MESSAGES.UNDO_LABEL,
      onClick: onUndo,
    },
    duration: options?.duration || TOAST_CONFIG.UNDO_DURATION
  });
}

/**
 * Configuration type for MCP server configs
 */
export type ConfigType = 'stdio' | 'sse' | 'http';

/**
 * Generate configuration object based on server and type
 * @param server - Server object from API
 * @param configType - Configuration type ('stdio', 'sse', or 'http')
 * @returns Generated configuration object
 */
export function generateConfig(server: MCPServer, configType: ConfigType): object {
  // Use the API URL from environment variable, fallback to localhost:4444
  const apiUrl = import.meta.env['VITE_API_URL'] || 'http://localhost:4444';
  const baseUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash if present

  // Clean server name for use as config key (alphanumeric and hyphens only)
  const cleanServerName = server.name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  switch (configType) {
    case 'stdio':
      return {
        mcpServers: {
          'mcpgateway-wrapper': {
            command: 'python',
            args: ['-m', 'mcpgateway.wrapper'],
            env: {
              MCP_AUTH: 'Bearer <your-token-here>',
              MCP_SERVER_URL: `${baseUrl}/servers/${server.id}`,
              MCP_TOOL_CALL_TIMEOUT: '120',
            },
          },
        },
      };

    case 'sse':
      return {
        servers: {
          [cleanServerName]: {
            type: 'sse',
            url: `${baseUrl}/servers/${server.id}/sse`,
            headers: {
              Authorization: 'Bearer your-token-here',
            },
          },
        },
      };

    case 'http':
      return {
        servers: {
          [cleanServerName]: {
            type: 'http',
            url: `${baseUrl}/servers/${server.id}/mcp`,
            headers: {
              Authorization: 'Bearer your-token-here',
            },
          },
        },
      };

    default:
      throw new Error(`Unknown config type: ${configType}`);
  }
}

/**
 * Download a configuration file for a server
 * @param server - Server object
 * @param configType - Configuration type
 */
export function downloadConfig(server: MCPServer, configType: ConfigType): void {
  try {
    const config = generateConfig(server, configType);
    const configJson = JSON.stringify(config, null, 2);
    
    // Create blob and download
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${server.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${configType}-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Configuration downloaded`, {
      description: `${configType.toUpperCase()} config for "${server.name}"`,
    });
  } catch (error) {
    toast.error('Failed to download configuration', {
      description: (error as Error).message,
    });
  }
}

