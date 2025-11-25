/**
 * Custom hook for team management
 * Handles team CRUD operations
 */

import { useState, useCallback } from 'react';
import * as api from '../lib/api/contextforge-api-ipc';
import { toast } from '../lib/toastWithTray';

export interface Team {
  id: string;
  teamName: string;
  description: string;
  visibility: 'Public' | 'Private';
  maxMembers: number;
  creator: string;
  dateCreated: string;
}

export function useTeamActions() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all teams
   */
  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listTeams();
      // Map API response to UI model
      const mappedTeams = data.map(team => ({
        id: team.id,
        teamName: team.name,
        description: team.description || '',
        visibility: team.visibility === 'public' ? 'Public' as const : 'Private' as const,
        maxMembers: team.max_members || 0,
        creator: team.created_by,
        dateCreated: new Date(team.created_at).toISOString().split('T')[0]
      }));
      setTeams(mappedTeams);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load teams';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new team
   */
  const createTeam = useCallback(async (teamData: Omit<Team, 'id' | 'creator' | 'dateCreated'>) => {
    setLoading(true);
    setError(null);
    try {
      await api.createTeam({
        name: teamData.teamName,
        description: teamData.description,
        visibility: teamData.visibility.toLowerCase() as 'public' | 'private',
        max_members: teamData.maxMembers
      });
      await loadTeams();
      toast.success(`Team ${teamData.teamName} created`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create team';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTeams]);

  /**
   * Update existing team
   */
  const updateTeam = useCallback(async (teamId: string, updates: Partial<Team>) => {
    setLoading(true);
    setError(null);
    try {
      await api.updateTeam(teamId, {
        name: updates.teamName,
        description: updates.description,
        visibility: updates.visibility?.toLowerCase() as 'public' | 'private' | undefined,
        max_members: updates.maxMembers
      });
      await loadTeams();
      toast.success('Team updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update team';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTeams]);

  /**
   * Delete team
   */
  const deleteTeam = useCallback(async (teamId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteTeam(teamId);
      await loadTeams();
      toast.success('Team deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete team';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTeams]);

  return {
    teams,
    loading,
    error,
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam
  };
}
