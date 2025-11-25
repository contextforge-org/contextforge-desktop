import { useState, useMemo } from 'react';
import { MCPServer } from '../types/server';

type Filters = {
  names: string[];
  tags: string[];
  statuses: string[];
  transports: string[];
  authTypes: string[];
  visibilities: string[];
  teams: string[];
};

export function useServerFilters(serversData: MCPServer[]) {
  const [filters, setFilters] = useState<Filters>({
    names: [],
    tags: [],
    statuses: [],
    transports: [],
    authTypes: [],
    visibilities: [],
    teams: []
  });

  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [categorySearches, setCategorySearches] = useState<{[key: string]: string}>({});

  // Extract unique values for each filter category (memoized)
  const uniqueValues = useMemo(() => ({
    names: [...new Set(serversData.map(s => s.name))],
    tags: [...new Set(serversData.flatMap(s => s.tags))],
    statuses: ['Active', 'Inactive'],
    transports: [...new Set(serversData.map(s => s.transportType))],
    authTypes: [...new Set(serversData.map(s => s.authenticationType))],
    visibilities: ['public', 'team', 'private'],
    teams: [...new Set(serversData.map(s => s.team))],
  }), [serversData]);

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const selectAllInCategory = (category: keyof Filters, items: string[]) => {
    setFilters(prev => ({
      ...prev,
      [category]: items
    }));
  };

  const deselectAllInCategory = (category: keyof Filters) => {
    setFilters(prev => ({
      ...prev,
      [category]: []
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  // Filter data based on selected filters (memoized)
  const filteredData = useMemo(() => {
    return serversData.filter(server => {
      // Name filter
      if (filters.names.length > 0 && !filters.names.includes(server.name)) return false;
      
      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => server.tags.includes(tag))) return false;
      
      // Status filter
      if (filters.statuses.length > 0) {
        const isActive = server.active ? 'Active' : 'Inactive';
        if (!filters.statuses.includes(isActive)) return false;
      }
      
      // Transport filter
      if (filters.transports.length > 0 && !filters.transports.includes(server.transportType)) return false;
      
      // Auth Type filter
      if (filters.authTypes.length > 0 && !filters.authTypes.includes(server.authenticationType)) return false;
      
      // Visibility filter
      if (filters.visibilities.length > 0 && !filters.visibilities.includes(server.visibility)) return false;
      
      // Team filter
      if (filters.teams.length > 0 && !filters.teams.includes(server.team)) return false;
      
      return true;
    });
  }, [serversData, filters]);

  return {
    filters,
    expandedCategories,
    categorySearches,
    uniqueValues,
    hasActiveFilters,
    filteredData,
    toggleFilter,
    selectAllInCategory,
    deselectAllInCategory,
    setExpandedCategories,
    setCategorySearches,
  };
}


