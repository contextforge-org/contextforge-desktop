import { useMemo } from 'react';
import { A2AAgent } from '../types/agent';

export interface AgentFilters {
  searchQuery: string;
  authType: string;
  status: string;
  tags: string[];
}

export function useAgentFilters(
  agentsData: A2AAgent[],
  filters: AgentFilters
) {
  const filteredAgents = useMemo(() => {
    return agentsData.filter(agent => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          agent.name.toLowerCase().includes(query) ||
          agent.description?.toLowerCase().includes(query) ||
          agent.endpointUrl.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Auth type filter
      if (filters.authType && filters.authType !== 'all') {
        if (agent.authType !== filters.authType) return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'enabled' && !agent.enabled) return false;
        if (filters.status === 'disabled' && agent.enabled) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const agentTags = agent.tags || [];
        const hasAllTags = filters.tags.every(tag =>
          agentTags.includes(tag)
        );
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [agentsData, filters]);

  // Get unique tags from all agents
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    agentsData.forEach(agent => {
      agent.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [agentsData]);

  // Get unique auth types from all agents
  const availableAuthTypes = useMemo(() => {
    const authTypesSet = new Set<string>();
    agentsData.forEach(agent => {
      if (agent.authType) {
        authTypesSet.add(agent.authType);
      }
    });
    return Array.from(authTypesSet).sort();
  }, [agentsData]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: agentsData.length,
      enabled: agentsData.filter(a => a.enabled).length,
      disabled: agentsData.filter(a => !a.enabled).length,
      byAuthType: agentsData.reduce((acc, agent) => {
        const authType = agent.authType || 'none';
        acc[authType] = (acc[authType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [agentsData]);

  return {
    filteredAgents,
    availableTags,
    availableAuthTypes,
    stats,
  };
}
