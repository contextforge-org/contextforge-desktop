import { Search } from 'lucide-react';
import { ViewModeToggle } from './ViewModeToggle';

interface PrimaryAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface DataTableToolbarProps {
  viewMode?: 'table' | 'grid';
  onViewModeChange?: (mode: 'table' | 'grid') => void;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filterComponent?: React.ReactNode;
  primaryAction?: PrimaryAction;
  secondaryActions?: React.ReactNode;
  theme: string;
}

export function DataTableToolbar({
  viewMode,
  onViewModeChange,
  showSearch = true,
  searchQuery,
  onSearchChange,
  filterComponent,
  primaryAction,
  secondaryActions,
  theme
}: DataTableToolbarProps) {
  return (
    <div className={`flex items-center justify-between gap-4 p-4 border-t border-b ${
      theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
    }`}>
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        {viewMode && onViewModeChange && (
          <ViewModeToggle 
            viewMode={viewMode} 
            onViewModeChange={onViewModeChange} 
            theme={theme} 
          />
        )}

        {/* Search */}
        {showSearch && (
          <>
            {onSearchChange ? (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search..."
                  className={`pl-8 pr-3 py-1.5 text-sm border rounded-[6px] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-400'
                  }`}
                />
                <Search 
                  size={14} 
                  className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                  }`} 
                />
              </div>
            ) : (
              <button 
                className={`flex items-center justify-center size-[32px] border rounded-[6px] transition-colors ${
                  theme === 'dark' 
                    ? 'bg-zinc-950 border-zinc-700 hover:bg-zinc-800' 
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Search size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
              </button>
            )}
          </>
        )}

        {/* Filter Component */}
        {filterComponent}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {secondaryActions}
        
        {/* Primary Action Button */}
        {primaryAction && (
          <button 
            onClick={primaryAction.onClick}
            className="bg-gradient-to-r from-orange-500 to-orange-600 box-border content-stretch flex gap-[6px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[6px] shrink-0 hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
          >
            {primaryAction.icon}
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[13px] text-white text-nowrap whitespace-pre">
              {primaryAction.label}
            </p>
          </button>
        )}
      </div>
    </div>
  );
}


