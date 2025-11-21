import { ImageWithFallback } from './figma/ImageWithFallback';
import { ServerActionsDropdown } from './ServerActionsDropdown';

type MCPServer = {
  id: number;
  name: string;
  logoUrl: string;
  url: string;
  description: string;
  tags: string[];
  active: boolean;
  lastSeen: string;
  team: string;
  visibility: 'public' | 'team' | 'private';
  transportType: string;
  authenticationType: string;
  passthroughHeaders: string[];
};

// Helper function to get consistent tag colors
const getTagColor = (tag: string, theme: string) => {
  const darkColors = [
    { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
    { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
    { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/40' },
    { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/40' },
    { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
  ];
  
  const lightColors = [
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
  return colors[Math.abs(hash) % colors.length];
};

interface ServerGridViewProps {
  servers: MCPServer[];
  theme: string;
  onServerClick: (server: MCPServer) => void;
  onToggleActive: (serverId: number) => void;
  onDuplicate: (serverId: number) => void;
  onDelete: (serverId: number) => void;
}

export function ServerGridView({
  servers,
  theme,
  onServerClick,
  onToggleActive,
  onDuplicate,
  onDelete,
}: ServerGridViewProps) {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {servers.map((server) => (
        <div
          key={server.id}
          onClick={() => onServerClick(server)}
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
            theme === 'dark'
              ? 'bg-zinc-900/50 border-zinc-800 hover:border-cyan-500'
              : 'bg-white border-gray-200 hover:border-cyan-500'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="size-8 flex items-center justify-center shrink-0">
                <ImageWithFallback
                  src={server.logoUrl}
                  alt={`${server.name} logo`}
                  className="max-w-8 max-h-8 w-auto h-auto object-contain"
                />
              </div>
              <h3 className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {server.name}
              </h3>
            </div>
            <ServerActionsDropdown
              server={server}
              theme={theme}
              onToggleActive={onToggleActive}
              onEdit={onServerClick}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
          
          <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
            {server.url}
          </p>
          
          <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            {server.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
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

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${server.active ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              {server.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}


