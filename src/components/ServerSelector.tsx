import { useTheme } from '../context/ThemeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Server } from 'lucide-react';

interface ServerOption {
  id: string;
  name: string;
  status?: string;
}

interface ServerSelectorProps {
  servers: ServerOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ServerSelector({
  servers,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a server (optional)'
}: ServerSelectorProps) {
  const { theme } = useTheme();

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={`w-full ${
          theme === 'dark'
            ? 'bg-zinc-800 border-zinc-700 text-white'
            : 'bg-white border-gray-300'
        }`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={
          theme === 'dark'
            ? 'bg-zinc-800 border-zinc-700'
            : 'bg-white border-gray-300'
        }
      >
        {/* No Server option */}
        <SelectItem
          value="__none__"
          className={
            theme === 'dark'
              ? 'text-zinc-300 focus:bg-zinc-700 focus:text-white'
              : 'text-gray-700 focus:bg-gray-100'
          }
        >
          <div className="flex items-center gap-2">
            <Server size={14} className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'} />
            <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}>
              No Server (Global)
            </span>
          </div>
        </SelectItem>

        {/* Server options */}
        {servers.map((server) => (
          <SelectItem
            key={server.id}
            value={server.id}
            className={
              theme === 'dark'
                ? 'text-zinc-300 focus:bg-zinc-700 focus:text-white'
                : 'text-gray-700 focus:bg-gray-100'
            }
          >
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Server size={14} className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'} />
                <span className="truncate">{server.name}</span>
              </div>
              {server.status && (
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    server.status === 'active'
                      ? theme === 'dark'
                        ? 'bg-green-900/30 text-green-300'
                        : 'bg-green-100 text-green-700'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {server.status}
                </span>
              )}
            </div>
          </SelectItem>
        ))}

        {servers.length === 0 && (
          <div
            className={`px-2 py-6 text-center text-sm ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
            }`}
          >
            No servers available
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
