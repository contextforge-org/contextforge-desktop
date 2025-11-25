/**
 * Custom hook for user management with RBAC support
 * Handles user CRUD operations with role assignment/revocation
 */

import { useState, useCallback } from 'react';
import * as api from '../lib/api/contextforge-api-ipc';
import { 
  mapUserFromApi, 
  mapUserToCreateRequest,
  mapUserToUpdateRequest,
  findAdminRoleId 
} from '../lib/api/type-mappers';
import type { User } from '../lib/api/type-mappers';
import type { RoleResponse } from '../lib/contextforge-client-ts/types.gen';
import { toast } from '../lib/toastWithTray';

export function useUserActions() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all users with their RBAC roles
   */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load users and roles in parallel
      const [usersData, rolesData] = await Promise.all([
        api.listUsers(),
        api.listRoles()
      ]);
      
      setRoles(rolesData);
      
      // Load roles for each user
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          try {
            const userRoles = await api.getUserRoles(user.email);
            return mapUserFromApi(user, userRoles);
          } catch (err) {
            console.warn(`Failed to load roles for ${user.email}:`, err);
            return mapUserFromApi(user, []);
          }
        })
      );
      
      setUsers(usersWithRoles);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new user with optional admin role assignment
   */
  const createUser = useCallback(async (userData: {
    email: string;
    password: string;
    fullName: string;
    role: 'Admin' | 'User';
  }) => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Create user profile
      const createRequest = mapUserToCreateRequest({
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName
      });
      
      await api.createUser(createRequest);
      
      // Step 2: Assign admin role if needed
      if (userData.role === 'Admin') {
        const adminRoleId = findAdminRoleId(roles);
        if (adminRoleId) {
          try {
            await api.assignRoleToUser(userData.email, adminRoleId);
          } catch (err) {
            console.warn('Failed to assign admin role:', err);
            toast.warning('User created but admin role assignment failed');
          }
        } else {
          toast.warning('User created but admin role not found');
        }
      }
      
      // Step 3: Activate user
      try {
        await api.activateUser(userData.email);
      } catch (err) {
        console.warn('Failed to activate user:', err);
        toast.warning(
          'User created but activation failed'
        );
      }
      
      // Reload users to get updated list
      await loadUsers();
      
      toast.success( `User ${userData.email} created`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roles, loadUsers]);

  /**
   * Update user profile and/or role
   */
  const updateUser = useCallback(async (
    email: string,
    updates: {
      fullName?: string;
      password?: string;
      role?: 'Admin' | 'User';
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Update profile if needed
      if (updates.fullName || updates.password) {
        const updateRequest = mapUserToUpdateRequest({
          fullName: updates.fullName,
          password: updates.password
        });
        await api.updateUser(email, updateRequest);
      }
      
      // Step 2: Update role if changed
      if (updates.role) {
        const currentUser = users.find(u => u.email === email);
        if (currentUser && currentUser.role !== updates.role) {
          const adminRoleId = findAdminRoleId(roles);
          
          if (!adminRoleId) {
            toast.warning( 'Admin role not found');
          } else {
            if (updates.role === 'Admin') {
              // Assign admin role
              try {
                await api.assignRoleToUser(email, adminRoleId);
              } catch (err) {
                console.warn('Failed to assign admin role:', err);
                toast.warning( 'Failed to assign admin role');
              }
            } else if (updates.role === 'User') {
              // Revoke admin role
              const adminAssignment = currentUser.roles.find(
                r => r.role_id === adminRoleId && r.is_active
              );
              if (adminAssignment) {
                try {
                  await api.revokeRoleFromUser(email, adminRoleId);
                } catch (err) {
                  console.warn('Failed to revoke admin role:', err);
                  toast.warning( 'Failed to revoke admin role');
                }
              }
            }
          }
        }
      }
      
      await loadUsers();
      toast.success( `User ${email} updated`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users, roles, loadUsers]);

  /**
   * Delete user
   */
  const deleteUser = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteUser(email);
      await loadUsers();
      toast.success( `User ${email} deleted`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  /**
   * Toggle user active status
   */
  const toggleUserStatus = useCallback(async (email: string, activate: boolean) => {
    setLoading(true);
    setError(null);
    try {
      if (activate) {
        await api.activateUser(email);
      } else {
        await api.deactivateUser(email);
      }
      await loadUsers();
      toast.success(
        `User ${email} ${activate ? 'activated' : 'deactivated'}`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user status';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  return {
    users,
    roles,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
  };
}
