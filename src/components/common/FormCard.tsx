import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface FormCardProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  onCancel: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  theme: string;
}

export function FormCard({ 
  title, 
  onClose, 
  onSave, 
  onCancel, 
  saveDisabled = false,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  children, 
  theme 
}: FormCardProps) {
  return (
    <div className={`mt-4 p-6 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-zinc-900 border-zinc-800' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h4>
        <button
          onClick={onClose}
          className={`p-1 rounded transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-zinc-800 text-zinc-400' 
              : 'hover:bg-gray-200 text-gray-600'
          }`}
        >
          <X size={18} />
        </button>
      </div>
      
      {children}
      
      <div className="flex items-center gap-2 mt-6">
        <Button
          onClick={onSave}
          disabled={saveDisabled}
          className={`${
            theme === 'dark' 
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-zinc-700 disabled:text-zinc-500' 
              : 'bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
          }`}
        >
          {saveLabel}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className={theme === 'dark' 
            ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white' 
            : 'border-gray-300 text-gray-900 hover:bg-gray-50'
          }
        >
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}


