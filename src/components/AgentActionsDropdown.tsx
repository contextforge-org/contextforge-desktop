import { MoreVertical, Power, Pencil, Copy, Trash2, TestTube } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { A2AAgent } from '../types/agent';

interface AgentActionsDropdownProps {
  agent: A2AAgent;
  theme: string;
  onToggleEnabled: (agentId: string) => void;
  onEdit: (agent: A2AAgent) => void;
  onDuplicate: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  onTestConnection?: (agentId: string) => void;
}

export function AgentActionsDropdown({
  agent,
  theme,
  onToggleEnabled,
  onEdit,
  onDuplicate,
  onDelete,
  onTestConnection,
}: AgentActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'}`}>
          <MoreVertical size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onToggleEnabled(agent.id);
          }}
          className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          <Power size={14} className="mr-2" />
          {agent.enabled ? 'Disable' : 'Enable'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit(agent);
          }}
          className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          <Pencil size={14} className="mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(agent.id);
          }}
          className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          <Copy size={14} className="mr-2" />
          Duplicate
        </DropdownMenuItem>
        
        {onTestConnection && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onTestConnection(agent.id);
            }}
            className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
          >
            <TestTube size={14} className="mr-2" />
            Test Connection
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(agent.id);
          }}
          className={`cursor-pointer ${theme === 'dark' ? 'text-red-400 hover:bg-zinc-800' : 'text-red-600 hover:bg-gray-100'}`}
        >
          <Trash2 size={14} className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
