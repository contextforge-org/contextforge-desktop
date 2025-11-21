import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  selectedItem?: T;
  getRowKey: (item: T) => string | number;
  actions?: (item: T) => ReactNode;
  theme: string;
  emptyMessage?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  onRowClick, 
  selectedItem,
  getRowKey,
  actions, 
  theme,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  return (
    <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
      <table className="w-full">
        <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                className={`text-left px-4 py-3 text-sm font-medium ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
                } ${column.width || ''} ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className={`text-left px-4 py-3 text-sm font-medium w-24 ${
                theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
              }`}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className={theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white'}>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length + (actions ? 1 : 0)} 
                className={`px-4 py-8 text-center text-sm ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                }`}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => {
              const rowKey = getRowKey(item);
              const isSelected = selectedItem && getRowKey(selectedItem) === rowKey;
              
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b last:border-b-0 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? theme === 'dark'
                        ? 'bg-cyan-950/20 border-cyan-800/50'
                        : 'bg-cyan-50 border-cyan-200'
                      : theme === 'dark' 
                        ? 'border-zinc-800 hover:bg-zinc-800/80' 
                        : 'border-gray-200 hover:bg-gray-50'
                  } ${isSelected ? 'border-l-4 border-l-cyan-500' : ''}`}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key}
                      className={`px-4 py-5 text-sm ${column.className || ''}`}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-5">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}


