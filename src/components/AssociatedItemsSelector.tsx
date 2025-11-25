import { X, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AssociatedItemsSelectorProps {
  label: string;
  items: string[];
  selectedItems: string[];
  availableItems: Array<{id: string, name: string}>;
  searchValue: string;
  theme: string;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onSearchChange: (value: string) => void;
}

export function AssociatedItemsSelector({
  label,
  items,
  selectedItems,
  availableItems,
  searchValue,
  theme,
  onToggle,
  onRemove,
  onSearchChange,
}: AssociatedItemsSelectorProps) {
  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );
  
  // Helper to get name from ID
  const getNameById = (id: string) => {
    const item = availableItems.find(i => i.id === id);
    return item ? item.name : id;
  };

  return (
    <div>
      <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
        {label} ({selectedItems.length})
      </label>
      <div className={`border rounded-md p-4 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap gap-2 items-start">
          {selectedItems.map((itemId) => (
            <div
              key={itemId}
              className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {getNameById(itemId)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(itemId)}
                className={`rounded transition-colors ${
                  theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1 px-2.5 py-1 border rounded-md text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                    : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                Add {label.toLowerCase().replace('associated ', '')}
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className={`w-64 max-h-80 overflow-y-auto ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
              }`}
            >
              <div className="px-2 py-2 sticky top-0 bg-inherit">
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
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
              {filteredItems.length === 0 ? (
                <div className={`px-2 py-4 text-center text-sm ${
                  theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                }`}>
                  No items found
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(item.id);
                      }}
                      className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-4 h-4 rounded border ${
                          isSelected
                            ? theme === 'dark'
                              ? 'bg-cyan-500 border-cyan-500'
                              : 'bg-cyan-600 border-cyan-600'
                            : theme === 'dark'
                            ? 'border-zinc-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </span>
                    </div>
                  );
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
