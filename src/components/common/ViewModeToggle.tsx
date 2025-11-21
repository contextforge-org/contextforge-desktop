import { LayoutGrid, Table } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  theme: string;
}

export function ViewModeToggle({ viewMode, onViewModeChange, theme }: ViewModeToggleProps) {
  return (
    <div className={`flex items-center gap-1 p-1 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
      <button
        onClick={() => onViewModeChange('table')}
        className={`p-2 rounded transition-colors ${
          viewMode === 'table'
            ? theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-white text-gray-900 shadow-sm'
            : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Table view"
      >
        <Table size={18} />
      </button>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded transition-colors ${
          viewMode === 'grid'
            ? theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-white text-gray-900 shadow-sm'
            : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Grid view"
      >
        <LayoutGrid size={18} />
      </button>
    </div>
  );
}


