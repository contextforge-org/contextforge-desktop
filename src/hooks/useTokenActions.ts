/**
 * Custom hook for API token management
 * Handles token CRUD operations
 */

import { useState, useCallback } from 'react';
import * as api from '../lib/api/contextforge-api-ipc';
import { toast } from '../lib/toastWithTray';

export interface APIToken {
  id: string;
  tokenName: string;
  expires: string;
  description: string;
  serverId: string;
  permissions: string[];
  dateCreated: string;
  lastUsed: string;
}

export function useTokenActions() {
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all tokens
   */
  const loadTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listTokens();
      // Map API response to UI model
      const mappedTokens = data.map(token => ({
        id: token.id,
        tokenName: token.name,
        expires: token.expires_at || 'Never',
        description: token.description || '',
        serverId: token.server_id || '',
        permissions: token.resource_scopes || [],
        dateCreated: new Date(token.created_at).toISOString().split('T')[0],
        lastUsed: token.last_used 
          ? new Date(token.last_used).toISOString().split('T')[0]
          : 'Never'
      }));
      setTokens(mappedTokens);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tokens';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new token
   */
  const createToken = useCallback(async (tokenData: Omit<APIToken, 'id' | 'dateCreated' | 'lastUsed'>) => {
    setLoading(true);
    setError(null);
    try {
      // Calculate expires_in_days from expires date if provided
      let expiresInDays: number | null = null;
      if (tokenData.expires !== 'Never') {
        const expiryDate = new Date(tokenData.expires);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        expiresInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      await api.createToken({
        name: tokenData.tokenName,
        description: tokenData.description,
        expires_in_days: expiresInDays,
        scope: (tokenData.permissions.length > 0 || tokenData.serverId) ? {
          server_id: tokenData.serverId || null,
          permissions: tokenData.permissions
        } : null
      });
      await loadTokens();
      toast.success(`Token ${tokenData.tokenName} created`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create token';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTokens]);

  /**
   * Update existing token
   */
  const updateToken = useCallback(async (tokenId: string, updates: Partial<APIToken>) => {
    setLoading(true);
    setError(null);
    try {
      await api.updateToken(tokenId, {
        name: updates.tokenName,
        description: updates.description,
        scope: updates.permissions ? {
          permissions: updates.permissions
        } : null
      });
      await loadTokens();
      toast.success('Token updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update token';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTokens]);

  /**
   * Revoke token
   */
  const revokeToken = useCallback(async (tokenId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.revokeToken(tokenId);
      await loadTokens();
      toast.success('Token revoked');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke token';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTokens]);

  return {
    tokens,
    loading,
    error,
    loadTokens,
    createToken,
    updateToken,
    revokeToken
  };
}
