import { Pencil, Trash2, Copy } from 'lucide-react';

interface CustomAction {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  variant?: 'default' | 'danger';
}

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  customActions?: CustomAction[];
  theme: string;
}

export function ActionButtons({ 
  onEdit, 
  onDelete, 
  onDuplicate, 
  customActions = [], 
  theme 
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {onEdit && (
        <button 
          className={`p-1.5 rounded transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-zinc-700 text-zinc-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          title="Edit"
          onClick={onEdit}
        >
          <Pencil size={16} />
        </button>
      )}
      
      {onDuplicate && (
        <button 
          className={`p-1.5 rounded transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-zinc-700 text-zinc-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          title="Duplicate"
          onClick={onDuplicate}
        >
          <Copy size={16} />
        </button>
      )}
      
      {customActions.map((action, index) => (
        <button 
          key={index}
          className={`p-1.5 rounded transition-colors ${
            action.variant === 'danger'
              ? theme === 'dark' 
                ? 'hover:bg-red-900/30 text-zinc-400 hover:text-red-400' 
                : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
              : theme === 'dark' 
                ? 'hover:bg-zinc-700 text-zinc-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          title={action.title}
          onClick={action.onClick}
        >
          {action.icon}
        </button>
      ))}
      
      {onDelete && (
        <button 
          className={`p-1.5 rounded transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-red-900/30 text-zinc-400 hover:text-red-400' 
              : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
          }`}
          title="Delete"
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}


