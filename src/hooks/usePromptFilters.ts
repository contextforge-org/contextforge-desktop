import { useState, useMemo } from 'react';
import { Prompt } from '../types/prompt';

type Filters = {
  names: string[];
  tags: string[];
  statuses: string[];
  visibilities: string[];
  teams: string[];
  hasArguments: boolean | null;
  performance: string[];
};

export function usePromptFilters(promptsData: Prompt[]) {
  const [filters, setFilters] = useState<Filters>({
    names: [],
    tags: [],
    statuses: [],
    visibilities: [],
    teams: [],
    hasArguments: null,
    performance: []
  });

  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [categorySearches, setCategorySearches] = useState<{[key: string]: string}>({});

  // Extract unique values for each filter category (memoized)
  const uniqueValues = useMemo(() => ({
    names: [...new Set(promptsData.map(p => p.name))],
    tags: [...new Set(promptsData.flatMap(p => p.tags || []))],
    statuses: ['Active', 'Inactive'],
    visibilities: ['public', 'team', 'private'],
    teams: [...new Set(promptsData.map(p => p.teamId).filter(Boolean) as string[])],
    performance: ['High (>90%)', 'Medium (70-90%)', 'Low (<70%)', 'No Data']
  }), [promptsData]);

  const toggleFilter = (category: keyof Omit<Filters, 'hasArguments'>, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? (prev[category] as string[]).filter(v => v !== value)
        : [...(prev[category] as string[]), value]
    }));
  };

  const toggleHasArguments = (value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      hasArguments: prev.hasArguments === value ? null : value
    }));
  };

  const selectAllInCategory = (category: keyof Omit<Filters, 'hasArguments'>, items: string[]) => {
    setFilters(prev => ({
      ...prev,
      [category]: items
    }));
  };

  const deselectAllInCategory = (category: keyof Omit<Filters, 'hasArguments'>) => {
    setFilters(prev => ({
      ...prev,
      [category]: []
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = 
    Object.entries(filters).some(([key, value]) => 
      key === 'hasArguments' ? value !== null : (value as string[]).length > 0
    );

  // Helper function to get performance category
  const getPerformanceCategory = (prompt: Prompt): string => {
    if (prompt.metrics.totalExecutions === 0) return 'No Data';
    const successRate = (prompt.metrics.successfulExecutions / prompt.metrics.totalExecutions) * 100;
    if (successRate > 90) return 'High (>90%)';
    if (successRate >= 70) return 'Medium (70-90%)';
    return 'Low (<70%)';
  };

  // Filter data based on selected filters (memoized)
  const filteredData = useMemo(() => {
    return promptsData.filter(prompt => {
      // Name filter
      if (filters.names.length > 0 && !filters.names.includes(prompt.name)) return false;
      
      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => prompt.tags?.includes(tag))) return false;
      
      // Status filter
      if (filters.statuses.length > 0) {
        const isActive = prompt.isActive ? 'Active' : 'Inactive';
        if (!filters.statuses.includes(isActive)) return false;
      }
      
      // Visibility filter
      if (filters.visibilities.length > 0 && (!prompt.visibility || !filters.visibilities.includes(prompt.visibility))) return false;
      
      // Team filter
      if (filters.teams.length > 0 && (!prompt.teamId || !filters.teams.includes(prompt.teamId))) return false;
      
      // Has Arguments filter
      if (filters.hasArguments !== null) {
        const hasArgs = prompt.arguments.length > 0;
        if (filters.hasArguments !== hasArgs) return false;
      }
      
      // Performance filter
      if (filters.performance.length > 0) {
        const perfCategory = getPerformanceCategory(prompt);
        if (!filters.performance.includes(perfCategory)) return false;
      }
      
      return true;
    });
  }, [promptsData, filters]);

  return {
    filters,
    expandedCategories,
    categorySearches,
    uniqueValues,
    hasActiveFilters,
    filteredData,
    toggleFilter,
    toggleHasArguments,
    selectAllInCategory,
    deselectAllInCategory,
    setExpandedCategories,
    setCategorySearches,
  };
}
