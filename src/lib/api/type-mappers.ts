/**
 * Type mapping utilities for converting between API types and UI models
 * Handles RBAC-aware user management
 */

import type { 
  EmailUserResponse, 
  RoleResponse, 
  UserRoleResponse 
} from '../contextforge-client-ts/types.gen';

// UI Model for Settings Page - Users
export interface User {
  email: string;
  fullName: string;
  role: 'Admin' | 'User';  // Simplified for UI
  roles: UserRoleResponse[]; // Full RBAC roles
  provider: string;
  dateAdded: string;
  isActive: boolean;
}

/**
 * Map API user response to UI model
 * Determines admin status from RBAC roles
 */
export function mapUserFromApi(
  apiUser: EmailUserResponse,
  userRoles: UserRoleResponse[] = []
): User {
  // Determine if user has admin role from RBAC
  const hasAdminRole = userRoles.some(
    role => role.role_name?.toLowerCase().includes('admin') && role.is_active
  );
  
  return {
    email: apiUser.email,
    fullName: apiUser.full_name || apiUser.email,
    role: hasAdminRole ? 'Admin' : 'User',
    roles: userRoles,
    provider: apiUser.auth_provider,
    dateAdded: (apiUser.created_at
      ? new Date(apiUser.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0])!,
    isActive: apiUser.is_active
  };
}

/**
 * Map UI user model to API request for creation
 */
export function mapUserToCreateRequest(user: {
  email: string;
  password: string;
  fullName?: string;
}) {
  return {
    email: user.email,
    password: user.password,
    full_name: user.fullName || undefined
  };
}

/**
 * Map UI user model to API request for update
 */
export function mapUserToUpdateRequest(user: {
  fullName?: string;
  password?: string;
}) {
  return {
    full_name: user.fullName || undefined,
    password: user.password || undefined
  };
}

/**
 * Find admin role ID from list of roles
 * Looks for active global admin role
 */
export function findAdminRoleId(roles: RoleResponse[]): string | null {
  const adminRole = roles.find(
    role => role.name.toLowerCase().includes('admin') && 
            role.is_active &&
            role.scope === 'global'
  );
  return adminRole?.id || null;
}

/**
 * Check if user has specific role
 */
export function userHasRole(user: User, roleName: string): boolean {
  return user.roles.some(
    role => role.role_name?.toLowerCase() === roleName.toLowerCase() && role.is_active
  );
}

/**
 * Get user's active role names
 */
export function getUserRoleNames(user: User): string[] {
  return user.roles
    .filter(role => role.is_active)
    .map(role => role.role_name || 'Unknown')
    .filter(name => name !== 'Unknown');
}
