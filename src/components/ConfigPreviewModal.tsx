import { Copy, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { MCPServer } from '../types/server';
import { generateConfig, ConfigType } from '../lib/serverUtils';
import { toast } from '../lib/toastWithTray';
import { useState } from 'react';

interface ConfigPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: MCPServer | null;
  configType: ConfigType | null;
  theme: string;
}

export function ConfigPreviewModal({
  isOpen,
  onClose,
  server,
  configType,
  theme,
}: ConfigPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!server || !configType) return null;

  const config = generateConfig(server, configType);
  const configJson = JSON.stringify(config, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(configJson);
    setCopied(true);
    toast.success('Configuration copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${server.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${configType}-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Configuration downloaded', {
      description: `${configType.toUpperCase()} config for "${server.name}"`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl w-[90vw] max-h-[85vh] flex flex-col ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className={`flex items-center justify-between pr-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <span>{configType?.toUpperCase()} Configuration - {server.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
          {/* Config Preview */}
          <div className={`flex-1 rounded-lg border overflow-hidden ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
            <pre className={`p-4 h-full overflow-auto text-sm font-mono ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-800'}`}>
              {configJson}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex gap-3 justify-end">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors border ${
                theme === 'dark'
                  ? 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800'
                  : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 py-2 rounded-md hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Download size={16} />
              Download Config
            </button>
          </div>

          {/* Help Text */}
          <div className={`flex-shrink-0 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            <p className="mb-2">
              <strong>Note:</strong> Replace <code className={`px-1 py-0.5 rounded ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`}>your-token-here</code> with your actual API token.
            </p>
            <p>
              You can find your API tokens in the Settings page under the API Tokens section.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
