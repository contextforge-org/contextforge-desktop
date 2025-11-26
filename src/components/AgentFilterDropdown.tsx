import { Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { FilterCategory } from './FilterCategory';

type Filters = {
  names: string[];
  tags: string[];
  statuses: string[];
  authTypes: string[];
  visibilities: string[];
  teams: string[];
};

interface AgentFilterDropdownProps {
  theme: string;
  filters: Filters;
  hasActiveFilters: boolean;
  uniqueNames: string[];
  uniqueTags: string[];
  uniqueStatuses: string[];
  uniqueAuthTypes: string[];
  uniqueVisibilities: string[];
  uniqueTeams: string[];
  categorySearches: {[key: string]: string};
  expandedCategories: {[key: string]: boolean};
  onToggleFilter: (category: keyof Filters, value: string) => void;
  onSelectAll: (category: keyof Filters, items: string[]) => void;
  onDeselectAll: (category: keyof Filters) => void;
  onSearchChange: (category: string, value: string) => void;
  onExpandChange: (category: string, expanded: boolean) => void;
}

export function AgentFilterDropdown({
  theme,
  filters,
  hasActiveFilters,
  uniqueNames,
  uniqueTags,
  uniqueStatuses,
  uniqueAuthTypes,
  uniqueVisibilities,
  uniqueTeams,
  categorySearches,
  expandedCategories,
  onToggleFilter,
  onSelectAll,
  onDeselectAll,
  onSearchChange,
  onExpandChange,
}: AgentFilterDropdownProps) {
  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`relative flex items-center justify-center size-[32px] border rounded-[6px] transition-colors ${
          hasActiveFilters
            ? theme === 'dark' 
              ? 'bg-cyan-900/30 border-cyan-500 hover:bg-cyan-900/40' 
              : 'bg-cyan-50 border-cyan-500 hover:bg-cyan-100'
            : theme === 'dark' 
              ? 'bg-zinc-950 border-zinc-700 hover:bg-zinc-800' 
              : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
        }`}>
          <Filter size={14} className={hasActiveFilters ? 'text-cyan-500' : theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-cyan-500 rounded-full text-white text-[10px] font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className={`w-64 max-h-[500px] overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Filter agents</DropdownMenuLabel>
        <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
        
        {/* Name */}
        <FilterCategory
          label="Name"
          items={uniqueNames}
          selectedItems={filters.names}
          onToggle={(name) => onToggleFilter('names', name)}
          theme={theme}
          searchValue={categorySearches['names']}
          onSearchChange={(value) => onSearchChange('names', value)}
          expanded={expandedCategories['names']}
          onExpandChange={(expanded) => onExpandChange('names', expanded)}
          onSelectAll={() => onSelectAll('names', uniqueNames)}
          onDeselectAll={() => onDeselectAll('names')}
        />
        
        {/* Tags */}
        <FilterCategory
          label="Tags"
          items={uniqueTags}
          selectedItems={filters.tags}
          onToggle={(tag) => onToggleFilter('tags', tag)}
          theme={theme}
          searchValue={categorySearches['tags']}
          onSearchChange={(value) => onSearchChange('tags', value)}
          expanded={expandedCategories['tags']}
          onExpandChange={(expanded) => onExpandChange('tags', expanded)}
          onSelectAll={() => onSelectAll('tags', uniqueTags)}
          onDeselectAll={() => onDeselectAll('tags')}
        />
        
        {/* Status */}
        <FilterCategory
          label="Status"
          items={uniqueStatuses}
          selectedItems={filters.statuses}
          onToggle={(status) => onToggleFilter('statuses', status)}
          theme={theme}
          onSelectAll={() => onSelectAll('statuses', uniqueStatuses)}
          onDeselectAll={() => onDeselectAll('statuses')}
        />
        
        {/* Authentication Type */}
        <FilterCategory
          label="Authentication Type"
          items={uniqueAuthTypes}
          selectedItems={filters.authTypes}
          onToggle={(authType) => onToggleFilter('authTypes', authType)}
          theme={theme}
          transformLabel={(item) => {
            if (item === 'none') return 'None';
            if (item === 'basic') return 'Basic Auth';
            if (item === 'bearer') return 'Bearer Token';
            if (item === 'headers') return 'Custom Headers';
            if (item === 'oauth') return 'OAuth 2.0';
            return item;
          }}
          onSelectAll={() => onSelectAll('authTypes', uniqueAuthTypes)}
          onDeselectAll={() => onDeselectAll('authTypes')}
        />
        
        {/* Visibility */}
        <FilterCategory
          label="Visibility"
          items={uniqueVisibilities}
          selectedItems={filters.visibilities}
          onToggle={(visibility) => onToggleFilter('visibilities', visibility)}
          theme={theme}
          transformLabel={(item) => item.charAt(0).toUpperCase() + item.slice(1)}
          onSelectAll={() => onSelectAll('visibilities', uniqueVisibilities)}
          onDeselectAll={() => onDeselectAll('visibilities')}
        />
        
        {/* Team */}
        <FilterCategory
          label="Team"
          items={uniqueTeams}
          selectedItems={filters.teams}
          onToggle={(team) => onToggleFilter('teams', team)}
          theme={theme}
          onSelectAll={() => onSelectAll('teams', uniqueTeams)}
          onDeselectAll={() => onDeselectAll('teams')}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
