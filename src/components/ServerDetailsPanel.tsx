import { ChevronDown, X, Settings, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Switch } from "./ui/switch";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RightSidePanel } from './RightSidePanel';
import { MCPServer, OAuthConfig, AuthHeader } from '../types/server';

interface ServerDetailsPanelProps {
  server: MCPServer | null;
  panelMode: 'add' | 'view';
  theme: string;
  editedName: string;
  editedUrl: string;
  editedDescription: string;
  editedTags: string[];
  editedVisibility: 'public' | 'team' | 'private';
  editedTransportType: string;
  editedAuthenticationType: string;
  editedPassthroughHeaders: string[];
  editedActive: boolean;
  isTransportDropdownOpen: boolean;
  isAuthDropdownOpen: boolean;
  editedOAuthConfig: OAuthConfig | null;
  // Authentication credentials
  editedAuthToken: string;
  editedAuthUsername: string;
  editedAuthPassword: string;
  editedAuthHeaders: AuthHeader[];
  onClose: () => void;
  onSave: () => void;
  onNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onVisibilityChange: (visibility: 'public' | 'team' | 'private') => void;
  onTransportTypeChange: (type: string) => void;
  onAuthenticationTypeChange: (type: string) => void;
  onPassthroughHeadersChange: (headers: string[]) => void;
  onActiveChange: (active: boolean) => void;
  onTransportDropdownToggle: (open: boolean) => void;
  onAuthDropdownToggle: (open: boolean) => void;
  onOpenOAuthWizard: () => void;
  // Authentication credential handlers
  onAuthTokenChange: (value: string) => void;
  onAuthUsernameChange: (value: string) => void;
  onAuthPasswordChange: (value: string) => void;
  onAuthHeadersChange: (headers: AuthHeader[]) => void;
}

export function ServerDetailsPanel({
  server,
  panelMode,
  theme,
  editedName,
  editedUrl,
  editedDescription,
  editedTags,
  editedVisibility,
  editedTransportType,
  editedAuthenticationType,
  editedPassthroughHeaders,
  editedActive,
  isTransportDropdownOpen,
  isAuthDropdownOpen,
  editedOAuthConfig,
  editedAuthToken,
  editedAuthUsername,
  editedAuthPassword,
  editedAuthHeaders,
  onClose,
  onSave,
  onNameChange,
  onUrlChange,
  onDescriptionChange,
  onTagsChange,
  onVisibilityChange,
  onTransportTypeChange,
  onAuthenticationTypeChange,
  onPassthroughHeadersChange,
  onActiveChange,
  onTransportDropdownToggle,
  onAuthDropdownToggle,
  onOpenOAuthWizard,
  onAuthTokenChange,
  onAuthUsernameChange,
  onAuthPasswordChange,
  onAuthHeadersChange,
}: ServerDetailsPanelProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const removeTag = (index: number) => {
    onTagsChange(editedTags.filter((_, i) => i !== index));
  };

  const addAuthHeader = () => {
    onAuthHeadersChange([...editedAuthHeaders, { key: '', value: '' }]);
  };

  const updateAuthHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...editedAuthHeaders];
    if (newHeaders[index]) {
      newHeaders[index] = { key: newHeaders[index].key, value: newHeaders[index].value, [field]: value };
    }
    onAuthHeadersChange(newHeaders);
  };

  const removeAuthHeader = (index: number) => {
    onAuthHeadersChange(editedAuthHeaders.filter((_, i) => i !== index));
  };

  const footer = (
    <div className="flex gap-3">
      <button
        onClick={onClose}
        className={`flex-1 px-4 py-2 rounded-md transition-colors border ${theme === 'dark' ? 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-md hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
      >
        {panelMode === 'add' ? 'Add Gateway' : 'Save Changes'}
      </button>
    </div>
  );

  return (
    <RightSidePanel
      isOpen={true}
      onClose={onClose}
      title={panelMode === 'add' ? 'Add New Gateway' : 'MCP Server Details'}
      theme={theme as 'light' | 'dark'}
      width="w-[500px]"
      footer={footer}
    >
      <div className="space-y-6">
          {/* Logo, Name and Toggle Header */}
          {panelMode === 'view' && server && (
            <div className="flex items-start gap-4 pb-4">
              {/* Logo */}
              <div className={`size-12 flex items-center justify-center shrink-0`}>
                <ImageWithFallback
                  src={server.logoUrl}
                  alt={`${server.name} logo`}
                  fallbackName={server.name}
                  className="max-w-10 max-h-10 w-auto h-auto object-contain"
                />
              </div>
              
              {/* Name, URL and Toggle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {editedName}
                  </h3>
                  <Switch
                    checked={editedActive}
                    onCheckedChange={onActiveChange}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  {editedUrl}
                </p>
              </div>
            </div>
          )}

          {/* Add mode - show input fields for name and URL */}
          {panelMode === 'add' && (
            <>
              {/* MCP Server Name */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  MCP Server Name
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g., Azure MCP Server"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                />
              </div>

              {/* MCP Server URL */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  MCP Server URL
                </label>
                <input
                  type="text"
                  value={editedUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="https://api.example.com/mcp"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                />
              </div>
            </>
          )}

          {/* Description */}
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={editedDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={4}
              placeholder="Describe this MCP server..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
            />
          </div>

          {/* Tags */}
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Tags
            </label>
            <div className={`w-full px-3 py-2 border rounded-md focus-within:ring-2 focus-within:ring-cyan-500 flex flex-wrap gap-2 items-center ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
              {editedTags.map((tag, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className={`hover:opacity-70 transition-opacity`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder={editedTags.length === 0 ? "Enter tag" : ""}
                className={`flex-1 min-w-[120px] outline-none ${theme === 'dark' ? 'bg-zinc-900 text-white placeholder:text-zinc-500' : 'bg-white text-gray-900 placeholder:text-gray-400'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value && !editedTags.includes(value)) {
                      onTagsChange([...editedTags, value]);
                      e.currentTarget.value = '';
                    }
                  } else if (e.key === 'Backspace' && e.currentTarget.value === '' && editedTags.length > 0) {
                    onTagsChange(editedTags.slice(0, -1));
                  }
                }}
              />
            </div>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              Press Enter to submit a tag
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Visibility
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={editedVisibility === 'public'}
                  onChange={(e) => onVisibilityChange(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Public</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="team"
                  checked={editedVisibility === 'team'}
                  onChange={(e) => onVisibilityChange(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Team</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={editedVisibility === 'private'}
                  onChange={(e) => onVisibilityChange(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Private</span>
              </label>
            </div>
          </div>

          {/* Transport Type */}
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Transport Type
            </label>
            <div className="relative">
              <div className={`relative rounded-md w-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => onTransportDropdownToggle(!isTransportDropdownOpen)}
                  className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800/30' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                >
                  <span className={`text-sm ${!editedTransportType && (theme === 'dark' ? 'text-zinc-500' : 'text-gray-400')}`}>
                    {editedTransportType || 'Select Transport Type'}
                  </span>
                  <ChevronDown size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                </button>
              </div>
              
              {isTransportDropdownOpen && (
                <div className={`absolute top-full left-0 right-0 mt-1 rounded-md border shadow-lg z-50 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                  {['SSE', 'Streamable HTTP'].map((type) => (
                    <div
                      key={type}
                      className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                        editedTransportType === type 
                          ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                          : theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        onTransportTypeChange(type);
                        onTransportDropdownToggle(false);
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Authentication Type */}
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Authentication Type
            </label>
            <div className="relative">
              <div className={`relative rounded-md w-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => onAuthDropdownToggle(!isAuthDropdownOpen)}
                  className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800/30' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                >
                  <span className={`text-sm ${!editedAuthenticationType && (theme === 'dark' ? 'text-zinc-500' : 'text-gray-400')}`}>
                    {editedAuthenticationType || 'Select Authentication Type'}
                  </span>
                  <ChevronDown size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                </button>
              </div>
              
              {isAuthDropdownOpen && (
                <div className={`absolute top-full left-0 right-0 mt-1 rounded-md border shadow-lg z-50 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                  {['None', 'Basic', 'Bearer Token', 'Custom Headers', 'OAuth 2.0'].map((type) => (
                    <div
                      key={type}
                      className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                        editedAuthenticationType === type
                          ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                          : theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        onAuthenticationTypeChange(type);
                        onAuthDropdownToggle(false);
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bearer Token Configuration */}
          {editedAuthenticationType === 'Bearer Token' && (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Bearer Token Authentication
              </h4>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={editedAuthToken}
                  onChange={(e) => onAuthTokenChange(e.target.value)}
                  placeholder="Enter your bearer token"
                  className={`w-full px-3 py-2 pr-10 border rounded-md text-sm transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-opacity-10 ${theme === 'dark' ? 'text-zinc-400 hover:bg-white' : 'text-gray-500 hover:bg-gray-900'}`}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                The token will be sent as "Authorization: Bearer &lt;token&gt;"
              </p>
            </div>
          )}

          {/* Basic Authentication Configuration */}
          {editedAuthenticationType === 'Basic' && (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Basic Authentication
              </h4>
              <div className="space-y-3">
                <div>
                  <label className={`block mb-1 text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={editedAuthUsername}
                    onChange={(e) => onAuthUsernameChange(e.target.value)}
                    placeholder="Enter username"
                    className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editedAuthPassword}
                      onChange={(e) => onAuthPasswordChange(e.target.value)}
                      placeholder="Enter password"
                      className={`w-full px-3 py-2 pr-10 border rounded-md text-sm transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-opacity-10 ${theme === 'dark' ? 'text-zinc-400 hover:bg-white' : 'text-gray-500 hover:bg-gray-900'}`}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                Credentials will be Base64 encoded and sent as "Authorization: Basic &lt;encoded&gt;"
              </p>
            </div>
          )}

          {/* Custom Headers Configuration */}
          {editedAuthenticationType === 'Custom Headers' && (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Custom Headers
                </h4>
                <button
                  onClick={addAuthHeader}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300'
                  }`}
                >
                  <Plus size={12} />
                  Add Header
                </button>
              </div>
              
              {editedAuthHeaders.length === 0 ? (
                <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  No custom headers configured. Click "Add Header" to add one.
                </p>
              ) : (
                <div className="space-y-2">
                  {editedAuthHeaders.map((header, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => updateAuthHeader(index, 'key', e.target.value)}
                        placeholder="Header name"
                        className={`flex-1 px-3 py-2 border rounded-md text-sm ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => updateAuthHeader(index, 'value', e.target.value)}
                        placeholder="Header value"
                        className={`flex-1 px-3 py-2 border rounded-md text-sm ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                      />
                      <button
                        onClick={() => removeAuthHeader(index)}
                        className={`p-2 rounded transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                These headers will be sent with every request to the gateway.
              </p>
            </div>
          )}

          {/* OAuth Configuration Section */}
          {editedAuthenticationType === 'OAuth 2.0' && (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-blue-50 border-blue-200'}`}>
              {editedOAuthConfig ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      OAuth 2.0 Configuration
                    </h4>
                    <button
                      onClick={onOpenOAuthWizard}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                        theme === 'dark'
                          ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                          : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300'
                      }`}
                    >
                      <Settings size={12} />
                      Edit Config
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Grant Type:</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {editedOAuthConfig.grant_type === 'client_credentials' ? 'Client Credentials' : 'Authorization Code'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Client ID:</span>
                      <span className={`font-mono text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {editedOAuthConfig.client_id.substring(0, 20)}...
                      </span>
                    </div>
                    {editedOAuthConfig.scopes && editedOAuthConfig.scopes.length > 0 && (
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Scopes:</span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {editedOAuthConfig.scopes.join(', ')}
                        </span>
                      </div>
                    )}
                    {editedOAuthConfig.access_token && (
                      <div className={`mt-2 pt-2 border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-blue-200'}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                            Token Active
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                    OAuth 2.0 requires configuration
                  </p>
                  <button
                    onClick={onOpenOAuthWizard}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
                  >
                    Configure OAuth 2.0
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Passthrough Headers */}
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Passthrough Headers
            </label>
            <input
              type="text"
              value={editedPassthroughHeaders.join(', ')}
              onChange={(e) => onPassthroughHeadersChange(e.target.value.split(',').map(h => h.trim()).filter(h => h))}
              placeholder="e.g., Authorization, X-Tenant-Id, X-Trace-Id"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
            />
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              List of headers to pass through from client requests (comma-separated, e.g., "Authorization, X-Tenant-Id, X-Trace-Id"). Leave empty to use global defaults.
            </p>
          </div>
        </div>
    </RightSidePanel>
  );
}


