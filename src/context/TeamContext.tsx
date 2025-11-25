import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TeamResponse } from '../lib/contextforge-client-ts/types.gen';
import * as api from '../lib/api/contextforge-api-ipc';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface TeamContextType {
  selectedTeamId: string | null;
  setSelectedTeamId: (teamId: string | null) => void;
  teams: TeamResponse[];
  isLoading: boolean;
  error: string | null;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useCurrentUser();
  const [selectedTeamId, setSelectedTeamIdState] = useState<string | null>(() => {
    // Load from localStorage on init
    return localStorage.getItem('selectedTeamId');
  });
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setSelectedTeamId = (teamId: string | null) => {
    setSelectedTeamIdState(teamId);
    if (teamId) {
      localStorage.setItem('selectedTeamId', teamId);
    } else {
      localStorage.removeItem('selectedTeamId');
    }
  };

  const refreshTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.listTeams();
      // listTeams now returns TeamResponse[] directly
      setTeams(response || []);
      
      // If we have a selected team that no longer exists, clear it
      if (selectedTeamId && !response?.find((t: TeamResponse) => t.id === selectedTeamId)) {
        setSelectedTeamId(null);
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error('Failed to fetch teams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch teams after user is loaded and authenticated
    if (!userLoading && user) {
      refreshTeams();
    } else if (!userLoading && !user) {
      // User is not authenticated, clear teams
      setTeams([]);
      setIsLoading(false);
    }
  }, [user, userLoading]);

  // Listen for login events to refresh teams
  useEffect(() => {
    const handleLogin = () => {
      console.log('TeamContext: Login event received, refreshing teams');
      refreshTeams();
    };

    window.addEventListener('contextforge-login', handleLogin);

    return () => {
      window.removeEventListener('contextforge-login', handleLogin);
    };
  }, []);

  return (
    <TeamContext.Provider
      value={{
        selectedTeamId,
        setSelectedTeamId,
        teams,
        isLoading,
        error,
        refreshTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
