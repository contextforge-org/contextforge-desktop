import { useState } from 'react';
import { X, Upload, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

interface BulkImportFormProps {
  onClose: () => void;
  onImport: (tools: any[]) => void;
}

export function BulkImportForm({ onClose, onImport }: BulkImportFormProps) {
  const { theme } = useTheme();
  const [importMethod, setImportMethod] = useState<'file' | 'paste'>('file');
  const [jsonText, setJsonText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const sampleJSON = `[
  {
    "name": "weather-api",
    "displayName": "Weather API Tool",
    "url": "https://api.openweathermap.org/data/2.5/weather",
    "integration_type": "REST",
    "request_type": "GET",
    "description": "Get current weather data",
    "auth_type": "bearer",
    "auth_value": "your-openweather-api-key-here",
    "headers": {
      "Accept": "application/json",
      "User-Agent": "MCP-Gateway/1.0"
    },
    "input_schema": {
      "type": "object",
      "properties": {
        "q": {"type": "string", "description": "City name"},
        "units": {"type": "string", "description": "Units (metric/imperial)"}
      },
      "required": ["q"]
    },
    "jsonpath_filter": "$.main",
    "tags": ["weather", "api", "external"]
  }
]`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-import-sample.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Sample JSON downloaded');
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setJsonText(content);
          toast.success(`Loaded ${parsed.length} tool(s) from file`);
        } else {
          toast.error('JSON must be an array of tools');
        }
      } catch (error) {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      handleFileUpload(file);
    } else {
      toast.error('Please upload a JSON file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleClear = () => {
    setJsonText('');
    setImportMethod('file');
    toast.info('Form cleared');
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        toast.error('JSON must be an array of tools');
        return;
      }
      if (parsed.length > 200) {
        toast.error('Maximum 200 tools per import');
        return;
      }
      
      // Validate required fields
      const requiredFields = ['name', 'url', 'integration_type', 'request_type'];
      const missingFields = parsed.some(tool => 
        requiredFields.some(field => !tool[field])
      );
      
      if (missingFields) {
        toast.error('Missing required fields in one or more tools');
        return;
      }

      onImport(parsed);
      toast.success(`Successfully imported ${parsed.length} tool(s)`);
      onClose();
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  return (
    <div className={`w-[600px] border-l shadow-xl flex flex-col ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`p-6 border-b sticky top-0 z-10 ${theme === 'dark' ? 'border-zinc-700 bg-zinc-900' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📋 Bulk Import Tools
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-200'}`}
          >
            <X size={20} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Description */}
        <div className="mb-6">
          <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            Import multiple tools from a JSON array. The system automatically handles common formatting issues like tool name spaces and tag formats.
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Maximum:</span> 200 tools per import
          </p>
        </div>

        {/* Sample JSON Template */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Sample JSON Template:
            </h3>
            <button
              onClick={handleDownloadSample}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm ${
                theme === 'dark' 
                  ? 'text-cyan-400 hover:bg-zinc-800' 
                  : 'text-cyan-600 hover:bg-gray-100'
              }`}
            >
              <Download size={14} />
              Download Sample
            </button>
          </div>
          
          <div className={`p-4 rounded-lg border overflow-x-auto ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
            <pre className={`text-xs ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              {sampleJSON}
            </pre>
          </div>
        </div>

        {/* Auth Types */}
        <div className="mb-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Auth Types:</span> basic, bearer, authheaders, oauth, or none
          </p>
        </div>

        {/* Required Fields */}
        <div className="mb-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Required Fields:</span> name, url, integration_type, request_type
          </p>
        </div>

        {/* Optional Fields */}
        <div className="mb-6">
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Optional Fields:</span> displayName, description, auth_type, auth_value, headers, input_schema, jsonpath_filter, tags
          </p>
        </div>

        {/* Import Method */}
        <div className="mb-6">
          <h3 className={`mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Choose Import Method:
          </h3>
          
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="importMethod"
                value="file"
                checked={importMethod === 'file'}
                onChange={() => setImportMethod('file')}
                className="w-4 h-4 text-cyan-500 accent-cyan-500"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Upload File
              </span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="importMethod"
                value="paste"
                checked={importMethod === 'paste'}
                onChange={() => setImportMethod('paste')}
                className="w-4 h-4 text-cyan-500 accent-cyan-500"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Paste JSON
              </span>
            </label>
          </div>

          {/* Upload File UI */}
          {importMethod === 'file' && (
            <div>
              <h4 className={`text-sm mb-3 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Upload JSON File
              </h4>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? theme === 'dark'
                      ? 'border-cyan-500 bg-cyan-950/20'
                      : 'border-cyan-500 bg-cyan-50'
                    : theme === 'dark'
                      ? 'border-zinc-700 hover:border-cyan-600'
                      : 'border-gray-300 hover:border-cyan-400'
                }`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload
                  size={40}
                  className={`mx-auto mb-3 ${
                    isDragging
                      ? 'text-cyan-500'
                      : theme === 'dark'
                        ? 'text-zinc-500'
                        : 'text-gray-400'
                  }`}
                />
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Click to upload JSON file
                </p>
                {jsonText && (
                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    ✓ File loaded
                  </p>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Paste JSON UI */}
          {importMethod === 'paste' && (
            <div>
              <h4 className={`text-sm mb-3 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Paste JSON
              </h4>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste your JSON array here..."
                className={`w-full h-64 p-3 rounded-lg border font-mono text-sm ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-300 placeholder-zinc-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className={`p-6 border-t flex items-center justify-between ${theme === 'dark' ? 'border-zinc-700 bg-zinc-900' : 'border-gray-200 bg-white'}`}>
        <button
          onClick={handleClear}
          className={`px-4 py-2 rounded transition-colors ${
            theme === 'dark'
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Clear
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`box-border content-stretch flex items-center justify-center overflow-clip px-[12px] py-[8px] rounded-[6px] transition-colors border ${
              theme === 'dark'
                ? 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-700'
                : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <span className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic text-[13px] text-nowrap whitespace-pre">
              Cancel
            </span>
          </button>
          
          <button
            onClick={handleImport}
            disabled={!jsonText}
            className={`box-border content-stretch flex items-center justify-center overflow-clip px-[12px] py-[8px] rounded-[6px] transition-all ${
              jsonText
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20'
                : theme === 'dark'
                  ? 'bg-zinc-800 cursor-not-allowed'
                  : 'bg-gray-200 cursor-not-allowed'
            }`}
          >
            <span className={`font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic text-[13px] text-nowrap whitespace-pre ${
              jsonText ? 'text-white' : theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
            }`}>
              Import Tools
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}