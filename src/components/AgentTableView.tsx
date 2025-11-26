import { ImageWithFallback } from './figma/ImageWithFallback';
import { AgentActionsDropdown } from './AgentActionsDropdown';
import { A2AAgent } from '../types/agent';

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

// Helper to format auth type for display
const formatAuthType = (authType: string | null): string => {
  if (!authType || authType === 'none') return 'None';
  if (authType === 'basic') return 'Basic Auth';
  if (authType === 'bearer') return 'Bearer Token';
  if (authType === 'headers') return 'Custom Headers';
  if (authType === 'oauth') return 'OAuth 2.0';
  return authType;
};

interface AgentTableViewProps {
  agents: A2AAgent[];
  theme: string;
  selectedAgent: A2AAgent | null;
  onAgentClick: (agent: A2AAgent) => void;
  onToggleEnabled: (agentId: string) => void;
  onDuplicate: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  onTestConnection?: (agentId: string) => void;
}

export function AgentTableView({
  agents,
  theme,
  selectedAgent,
  onAgentClick,
  onToggleEnabled,
  onDuplicate,
  onDelete,
  onTestConnection,
}: AgentTableViewProps) {
  return (
    <table className="w-full">
      <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
        <tr>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Name</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Endpoint</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Auth Type</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Description</th>
          <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Tags</th>
          <th className={`text-left px-4 py-3 text-sm font-medium w-12 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}></th>
        </tr>
      </thead>
      <tbody>
        {agents.map((agent) => (
          <tr
            key={agent.id}
            onClick={() => onAgentClick(agent)}
            className={`border-b last:border-b-0 transition-colors cursor-pointer ${
              selectedAgent?.id === agent.id
                ? theme === 'dark'
                  ? 'bg-cyan-950/20 border-cyan-800/50'
                  : 'bg-cyan-50 border-cyan-200'
                : theme === 'dark' 
                  ? 'border-zinc-800 hover:bg-zinc-800/50' 
                  : 'border-gray-200 hover:bg-gray-50'
            } ${selectedAgent?.id === agent.id ? 'border-l-4 border-l-cyan-500' : ''}`}
          >
            <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center gap-3">
                <div className="size-8 flex items-center justify-center shrink-0">
                  <ImageWithFallback
                    src={agent.logoUrl || undefined}
                    alt={`${agent.name} logo`}
                    fallbackName={agent.name}
                    className="max-w-8 max-h-8 w-auto h-auto object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>{agent.name}</span>
                  <div className={`size-2 rounded-full shrink-0 ${agent.enabled ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-400'}`} title={agent.enabled ? 'Enabled' : 'Disabled'}></div>
                </div>
              </div>
            </td>
            <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              <div className="max-w-xs truncate" title={agent.endpointUrl}>
                {agent.endpointUrl}
              </div>
            </td>
            <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'}`}>
                {formatAuthType(agent.authType)}
              </span>
            </td>
            <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              <div className="max-w-xs truncate" title={agent.description}>
                {agent.description}
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-1">
                {agent.tags.map((tag, idx) => {
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
              <AgentActionsDropdown
                agent={agent}
                theme={theme}
                onToggleEnabled={onToggleEnabled}
                onEdit={onAgentClick}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onTestConnection={onTestConnection}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
