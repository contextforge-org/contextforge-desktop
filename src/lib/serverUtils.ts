import { toast } from './toastWithTray';
import { MCPServer } from '../types/server';
import imgAzure from "../../assets/icons/brands/azure.png";

/**
 * Type for edited server data (excludes auto-generated fields)
 */
export type EditedServerData = {
  name: string;
  url: string;
  iconUrl?: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'team' | 'private';
  transportType: string;
  authenticationType: string;
  passthroughHeaders: string[];
  active: boolean;
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
  LOGO_URL: imgAzure,
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

