import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface RightSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  theme: 'light' | 'dark';
  width?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function RightSidePanel({
  isOpen,
  onClose,
  title,
  subtitle,
  theme,
  width = 'w-[500px]',
  children,
  footer,
}: RightSidePanelProps) {
  if (!isOpen) return null;

  return (
    <div className={`${width} border-l shadow-xl flex flex-col ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
      {/* Sticky Header */}
      <div className={`p-6 pb-4 border-b sticky top-0 z-10 ${theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'}`}
          >
            <X size={20} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
          </button>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className={`p-6 pt-4 border-t ${theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-gray-50'}`}>
          {footer}
        </div>
      )}
    </div>
  );
}


