import { MoreVertical, Power, Pencil, Copy, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { MCPServer } from '../types/server';

interface ServerActionsDropdownProps {
  server: MCPServer;
  theme: string;
  onToggleActive: (serverId: string) => void;
  onEdit: (server: MCPServer) => void;
  onDuplicate: (serverId: string) => void;
  onDelete: (serverId: string) => void;
}

export function ServerActionsDropdown({
  server,
  theme,
  onToggleActive,
  onEdit,
  onDuplicate,
  onDelete,
}: ServerActionsDropdownProps) {
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
            onToggleActive(server.id);
          }}
          className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          <Power size={14} className="mr-2" />
          {server.active ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(server);
          }}
          className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          <Pencil size={14} className="mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(server.id);
          }}
          className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          <Copy size={14} className="mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(server.id);
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


