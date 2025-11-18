import { useState } from 'react';
import { DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Check } from 'lucide-react';

interface FilterCategoryProps {
  label: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  theme: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  transformLabel?: (item: string) => string;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export function FilterCategory({
  label,
  items,
  selectedItems,
  onToggle,
  theme,
  searchValue = '',
  onSearchChange,
  expanded = false,
  onExpandChange,
  transformLabel = (item) => item,
  onSelectAll,
  onDeselectAll
}: FilterCategoryProps) {
  const needsSearch = items.length > 4;
  const filteredItems = items.filter(item => 
    !searchValue || item.toLowerCase().includes(searchValue.toLowerCase())
  );
  const displayedItems = expanded ? filteredItems : filteredItems.slice(0, 4);
  const hiddenCount = filteredItems.length - 4;
  const allSelected = items.length > 0 && items.every(item => selectedItems.includes(item));

  return (
    <>
      <div className="flex items-center justify-between px-2 py-1">
        <DropdownMenuLabel className={`text-xs p-0 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
          {label}
        </DropdownMenuLabel>
        {onSelectAll && onDeselectAll && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              allSelected ? onDeselectAll() : onSelectAll();
            }}
            className={`text-xs ${
              theme === 'dark' 
                ? 'text-cyan-400 hover:text-cyan-300' 
                : 'text-cyan-600 hover:text-cyan-700'
            }`}
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>
      
      {needsSearch && onSearchChange && (
        <div className="px-2 mb-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => {
              e.stopPropagation();
              onSearchChange(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full px-2 py-1 text-xs rounded border ${
              theme === 'dark' 
                ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
            }`}
          />
        </div>
      )}
      
      {displayedItems.map(item => {
        const isChecked = selectedItems.includes(item);
        return (
          <div
            key={item}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(item);
            }}
            className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${
              theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
            }`}
          >
            <div className={`flex items-center justify-center w-4 h-4 rounded border ${
              isChecked
                ? theme === 'dark' 
                  ? 'bg-cyan-500 border-cyan-500' 
                  : 'bg-cyan-600 border-cyan-600'
                : theme === 'dark'
                  ? 'border-zinc-600'
                  : 'border-gray-300'
            }`}>
              {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {transformLabel(item)}
            </span>
          </div>
        );
      })}
      
      {needsSearch && !expanded && hiddenCount > 0 && onExpandChange && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpandChange(true);
          }}
          className={`w-full px-2 py-1 text-xs text-left ${
            theme === 'dark' 
              ? 'text-cyan-400 hover:text-cyan-300' 
              : 'text-cyan-600 hover:text-cyan-700'
          }`}
        >
          View {hiddenCount} more
        </button>
      )}
      
      <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
    </>
  );
}