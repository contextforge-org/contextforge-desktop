import { ImageWithFallback } from './figma/ImageWithFallback';
import { ServerActionsDropdown } from './ServerActionsDropdown';
import { MCPServer } from '../types/server';
import { ConfigType } from '../lib/serverUtils';

// Helper function to get consistent tag colors
type TagColors = {
  bg: string;
  text: string;
  border: string;
};

const getTagColor = (tag: string, theme: string): TagColors => {
  const darkColors: TagColors[] = [
    { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
    { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
    { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/40' },
    { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/40' },
    { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
  ];
  
  const lightColors: TagColors[] = [
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
    { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  ];
  
  const colors = theme === 'dark' ? darkColors : lightColors;
  
  // Simple hash function for consistent color assignment
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index]!; // Non-null assertion: modulo ensures valid index
};

interface ServerTableViewProps {
  servers: MCPServer[];
  theme: string;
  selectedServer: MCPServer | null;
  onServerClick: (server: MCPServer) => void;
  onToggleActive: (serverId: string) => void;
  onDuplicate: (serverId: string) => void;
  onDelete: (serverId: string) => void;
  onDownloadConfig?: (serverId: string, configType: ConfigType) => void;
  onFetchTools?: (serverId: string) => void;
}

export function ServerTableView({
  servers,
  theme,
  selectedServer,
  onServerClick,
  onToggleActive,
  onDuplicate,
  onDelete,
  onDownloadConfig,
  onFetchTools,
}: ServerTableViewProps) {
  return (
    <table className="w-full">
      <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
        <tr>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Name</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>UUID</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Description</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Tags</th>
          <th className={`text-left px-4 py-3 text-sm font-medium w-12 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}></th>
        </tr>
      </thead>
      <tbody>
        {servers.map((server) => (
          <tr
            key={server.id}
            onClick={() => onServerClick(server)}
            className={`border-b last:border-b-0 transition-colors cursor-pointer ${
              selectedServer?.id === server.id
                ? theme === 'dark'
                  ? 'bg-cyan-950/20 border-cyan-800/50'
                  : 'bg-cyan-50 border-cyan-200'
                : theme === 'dark' 
                  ? 'border-zinc-800 hover:bg-zinc-800/50' 
                  : 'border-gray-200 hover:bg-gray-50'
            } ${selectedServer?.id === server.id ? 'border-l-4 border-l-cyan-500' : ''}`}
          >
            <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center gap-3">
                <div className="size-8 flex items-center justify-center shrink-0">
                  <ImageWithFallback
                    src={server.logoUrl}
                    alt={`${server.name} logo`}
                    fallbackName={server.name}
                    className="max-w-8 max-h-8 w-auto h-auto object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>{server.name}</span>
                  <div className={`size-2 rounded-full shrink-0 ${server.active ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-400'}`} title={server.active ? 'Active' : 'Inactive'}></div>
                </div>
              </div>
            </td>
            <td className={`px-4 py-4 text-sm font-mono ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              {server.id}
            </td>
            <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              {server.description}
            </td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-1">
                {server.tags.map((tag, idx) => {
                  const colors = getTagColor(tag, theme);
                  return (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded-full text-xs border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </td>
            <td className="px-4 py-4">
              <ServerActionsDropdown
                server={server}
                theme={theme}
                onToggleActive={onToggleActive}
                onEdit={onServerClick}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onDownloadConfig={onDownloadConfig}
                onFetchTools={onFetchTools}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


