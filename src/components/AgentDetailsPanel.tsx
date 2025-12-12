import { ChevronDown, X, Plus, Wand2, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Switch } from "./ui/switch";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RightSidePanel } from './RightSidePanel';
import { A2AAgent, AuthHeader } from '../types/agent';
import { useState } from 'react';
import { OAuthFlowWizard, type OAuthConfig } from './OAuthFlowWizard';
import * as api from '../lib/api/contextforge-api-ipc';
import { toast } from '../lib/toastWithTray';

interface AgentDetailsPanelProps {
  agent: A2AAgent | null;
  panelMode: 'add' | 'view';
  theme: string;
  editedName: string;
  editedEndpointUrl: string;
  editedDescription: string;
  editedTags: string[];
  editedAuthType: string;
  editedAuthUsername: string;
  editedAuthPassword: string;
  editedAuthToken: string;
  editedAuthHeaders: AuthHeader[];
  editedOAuthClientId: string;
  editedOAuthClientSecret: string;
  editedOAuthAuthorizationUrl: string;
  editedOAuthTokenUrl: string;
  editedOAuthScopes: string[];
  editedOAuthGrantType: string;
  editedCapabilitiesJson: string;
  editedConfigJson: string;
  editedEnabled: boolean;
  isAuthTypeDropdownOpen: boolean;
  isGrantTypeDropdownOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (value: string) => void;
  onEndpointUrlChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onAuthTypeChange: (type: string) => void;
  onAuthUsernameChange: (value: string) => void;
  onAuthPasswordChange: (value: string) => void;
  onAuthTokenChange: (value: string) => void;
  onAuthHeadersChange: (headers: AuthHeader[]) => void;
  onOAuthClientIdChange: (value: string) => void;
  onOAuthClientSecretChange: (value: string) => void;
  onOAuthAuthorizationUrlChange: (value: string) => void;
  onOAuthTokenUrlChange: (value: string) => void;
  onOAuthScopesChange: (scopes: string[]) => void;
  onOAuthGrantTypeChange: (type: string) => void;
  onCapabilitiesJsonChange: (value: string) => void;
  onConfigJsonChange: (value: string) => void;
  onEnabledChange: (enabled: boolean) => void;
  onAuthTypeDropdownToggle: (open: boolean) => void;
  onGrantTypeDropdownToggle: (open: boolean) => void;
  onTestOAuth?: () => void;
}

export function AgentDetailsPanel({
  agent,
  panelMode,
  theme,
  editedName,
  editedEndpointUrl,
  editedDescription,
  editedTags,
  editedAuthType,
  editedAuthUsername,
  editedAuthPassword,
  editedAuthToken,
  editedAuthHeaders,
  editedOAuthClientId,
  editedOAuthClientSecret,
  editedOAuthAuthorizationUrl,
  editedOAuthTokenUrl,
  editedOAuthScopes,
  editedOAuthGrantType,
  editedCapabilitiesJson,
  editedConfigJson,
  editedEnabled,
  isAuthTypeDropdownOpen,
  isGrantTypeDropdownOpen: _isGrantTypeDropdownOpen,
  onClose,
  onSave,
  onNameChange,
  onEndpointUrlChange,
  onDescriptionChange,
  onTagsChange,
  onAuthTypeChange,
  onAuthUsernameChange,
  onAuthPasswordChange,
  onAuthTokenChange,
  onAuthHeadersChange,
  onOAuthClientIdChange,
  onOAuthClientSecretChange,
  onOAuthAuthorizationUrlChange,
  onOAuthTokenUrlChange,
  onOAuthScopesChange,
  onOAuthGrantTypeChange,
  onCapabilitiesJsonChange,
  onConfigJsonChange,
  onEnabledChange,
  onAuthTypeDropdownToggle,
  onGrantTypeDropdownToggle: _onGrantTypeDropdownToggle,
  onTestOAuth: _onTestOAuth,
}: AgentDetailsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showOAuthWizard, setShowOAuthWizard] = useState(false);

  const removeTag = (index: number) => {
    onTagsChange(editedTags.filter((_, i) => i !== index));
  };

  const addAuthHeader = () => {
    onAuthHeadersChange([...editedAuthHeaders, { key: '', value: '' }]);
  };

  const updateAuthHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...editedAuthHeaders];
    const currentHeader = newHeaders[index];
    if (!currentHeader) return;
    
    newHeaders[index] = {
      key: field === 'key' ? value : currentHeader.key,
      value: field === 'value' ? value : currentHeader.value,
    };
    onAuthHeadersChange(newHeaders);
  };

  const removeAuthHeader = (index: number) => {
    onAuthHeadersChange(editedAuthHeaders.filter((_, i) => i !== index));
  };

  const handleOAuthWizardComplete = (config: OAuthConfig) => {
    // Update all OAuth fields from the wizard
    onOAuthGrantTypeChange(config.grant_type);
    onOAuthClientIdChange(config.client_id);
    onOAuthClientSecretChange(config.client_secret);
    onOAuthTokenUrlChange(config.token_url);
    if (config.auth_url) {
      onOAuthAuthorizationUrlChange(config.auth_url);
    }
    onOAuthScopesChange(config.scopes || []);
    setShowOAuthWizard(false);
  };

  // Test OAuth for existing agent
  const [testingOAuth, setTestingOAuth] = useState(false);
  
  const handleTestAgent = async () => {
    if (!agent?.id) {
      toast.error('Save the agent first before testing');
      return;
    }
    
    setTestingOAuth(true);
    try {
      const result = await api.testA2AAgent(agent.id);
      if (result.success) {
        toast.success('Agent connection test successful!');
      } else {
        toast.error('Agent connection test failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      toast.error('Test failed: ' + (err as Error).message);
    } finally {
      setTestingOAuth(false);
    }
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
        {panelMode === 'add' ? 'Add Agent' : 'Save Changes'}
      </button>
    </div>
  );

  return (
    <RightSidePanel
      isOpen={true}
      onClose={onClose}
      title={panelMode === 'add' ? 'Add New A2A Agent' : 'A2A Agent Details'}
      theme={theme as 'light' | 'dark'}
      width="w-[500px]"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Logo, Name and Toggle Header */}
        {panelMode === 'view' && agent && (
          <div className="flex items-start gap-4 pb-4">
            {/* Logo */}
            <div className={`size-12 flex items-center justify-center shrink-0`}>
              <ImageWithFallback
                src={agent.logoUrl || undefined}
                alt={`${agent.name} logo`}
                fallbackName={agent.name}
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
                  checked={editedEnabled}
                  onCheckedChange={onEnabledChange}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                {editedEndpointUrl}
              </p>
            </div>
          </div>
        )}

        {/* Add mode - show input fields for name and URL */}
        {panelMode === 'add' && (
          <>
            {/* Agent Name */}
            <div>
              <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Agent Name
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g., Customer Support Agent"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
              />
            </div>

            {/* Endpoint URL */}
            <div>
              <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Endpoint URL
              </label>
              <input
                type="text"
                value={editedEndpointUrl}
                onChange={(e) => onEndpointUrlChange(e.target.value)}
                placeholder="https://api.example.com/agent"
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
            placeholder="Describe this agent..."
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

        {/* Authentication Type */}
        <div>
          <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            Authentication Type
          </label>
          <div className="relative">
            <div className={`relative rounded-md w-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
              <button
                onClick={() => onAuthTypeDropdownToggle(!isAuthTypeDropdownOpen)}
                className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800/30' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'}`}
              >
                <span className={`text-sm ${!editedAuthType && (theme === 'dark' ? 'text-zinc-500' : 'text-gray-400')}`}>
                  {editedAuthType || 'Select Authentication Type'}
                </span>
                <ChevronDown size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
              </button>
            </div>
            
            {isAuthTypeDropdownOpen && (
              <div className={`absolute top-full left-0 right-0 mt-1 rounded-md border shadow-lg z-50 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                {['none', 'basic', 'bearer', 'headers', 'oauth'].map((type) => (
                  <div
                    key={type}
                    className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                      editedAuthType === type 
                        ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                        : theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      onAuthTypeChange(type);
                      onAuthTypeDropdownToggle(false);
                    }}
                  >
                    {type === 'none' ? 'None' : type === 'basic' ? 'Basic Auth' : type === 'bearer' ? 'Bearer Token' : type === 'headers' ? 'Custom Headers' : 'OAuth 2.0'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Basic Auth Fields */}
        {editedAuthType === 'basic' && (
          <>
            <div>
              <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Username
              </label>
              <input
                type="text"
                value={editedAuthUsername}
                onChange={(e) => onAuthUsernameChange(e.target.value)}
                placeholder="Enter username"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
              />
            </div>
            <div>
              <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Password
              </label>
              <input
                type="password"
                value={editedAuthPassword}
                onChange={(e) => onAuthPasswordChange(e.target.value)}
                placeholder="Enter password"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
              />
            </div>
          </>
        )}

        {/* Bearer Token Field */}
        {editedAuthType === 'bearer' && (
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Bearer Token
            </label>
            <input
              type="password"
              value={editedAuthToken}
              onChange={(e) => onAuthTokenChange(e.target.value)}
              placeholder="Enter bearer token"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
            />
          </div>
        )}

        {/* Custom Headers */}
        {editedAuthType === 'headers' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Custom Headers
              </label>
              <button
                onClick={addAuthHeader}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${theme === 'dark' ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
              >
                <Plus size={14} />
                Add Header
              </button>
            </div>
            <div className="space-y-2">
              {editedAuthHeaders.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) => updateAuthHeader(index, 'key', e.target.value)}
                    placeholder="Header name"
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                  />
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) => updateAuthHeader(index, 'value', e.target.value)}
                    placeholder="Header value"
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                  />
                  <button
                    onClick={() => removeAuthHeader(index)}
                    className={`px-2 py-2 rounded transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {editedAuthHeaders.length === 0 && (
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  No custom headers added yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* OAuth 2.0 Configuration */}
        {editedAuthType === 'oauth' && (
          <div className="space-y-4">
            {/* Configuration Status */}
            {editedOAuthClientId && editedOAuthTokenUrl ? (
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">OAuth Configured</h4>
                    <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      <p><span className="font-medium">Grant Type:</span> {editedOAuthGrantType === 'authorization_code' ? 'Authorization Code' : 'Client Credentials'}</p>
                      <p><span className="font-medium">Client ID:</span> {editedOAuthClientId}</p>
                      {editedOAuthScopes.length > 0 && (
                        <p><span className="font-medium">Scopes:</span> {editedOAuthScopes.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-700' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Use the wizard below to configure OAuth 2.0 authentication. The wizard will guide you through the setup and test your configuration.
                </p>
              </div>
            )}

            {/* Wizard and Test Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowOAuthWizard(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors border-2 ${
                  editedOAuthClientId && editedOAuthTokenUrl
                    ? theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                    : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                }`}
              >
                <Wand2 size={18} />
                {editedOAuthClientId && editedOAuthTokenUrl ? 'Reconfigure' : 'Configure OAuth'}
              </button>
              
              {/* Test button - only show for existing agents with OAuth configured */}
              {agent?.id && editedOAuthClientId && editedOAuthTokenUrl && (
                <button
                  onClick={handleTestAgent}
                  disabled={testingOAuth}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors border-2 ${
                    theme === 'dark' 
                      ? 'bg-cyan-600 text-white border-cyan-600 hover:bg-cyan-700 disabled:bg-zinc-700 disabled:border-zinc-700' 
                      : 'bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:border-gray-300'
                  }`}
                >
                  {testingOAuth ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ExternalLink size={18} />
                  )}
                  Test
                </button>
              )}
            </div>
            
            {/* Info about testing for new agents */}
            {panelMode === 'add' && editedOAuthClientId && editedOAuthTokenUrl && (
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                Save the agent first to test the OAuth connection.
              </p>
            )}
          </div>
        )}
      </div>

      {/* OAuth Configuration Wizard */}
      <OAuthFlowWizard
        isOpen={showOAuthWizard}
        onClose={() => setShowOAuthWizard(false)}
        onComplete={handleOAuthWizardComplete}
        theme={theme as 'light' | 'dark'}
        entityType="agent"
        entityId={agent?.id}
        entityName={editedName || agent?.name}
        initialConfig={{
          grant_type: editedOAuthGrantType as 'authorization_code' | 'client_credentials',
          client_id: editedOAuthClientId,
          client_secret: editedOAuthClientSecret,
          token_url: editedOAuthTokenUrl,
          auth_url: editedOAuthAuthorizationUrl,
          scopes: editedOAuthScopes,
        }}
      />
    </RightSidePanel>
  );
}
