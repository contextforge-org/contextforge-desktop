import { useState, useEffect } from 'react';
import { MCPServer } from '../types/server';
import {
  LLMProvider,
  ServerSelectionMode,
  LLMConfig,
  PROVIDER_NAMES,
  PROVIDER_MODELS,
  PROVIDER_CONFIGS
} from '../types/playground';
import { useOllamaModels } from '../hooks/useOllamaModels';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Server, Plug, Zap, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface SavedPlaygroundConfig {
  serverMode: ServerSelectionMode;
  virtualServerId?: string;
  serverUrl?: string;
  serverTransport?: string;
  provider: LLMProvider;
  llmConfig: LLMConfig;
  streaming: boolean;
}

interface LLMConfigPanelProps {
  isConnected: boolean;
  onConnect: (config: {
    serverMode: ServerSelectionMode;
    virtualServerId?: string;
    serverUrl?: string;
    serverTransport?: string;
    serverAuthToken?: string;
    provider: LLMProvider;
    llmConfig: LLMConfig;
    streaming: boolean;
  }) => Promise<void>;
  onDisconnect: () => Promise<void>;
  availableTools?: string[];
  virtualServers: MCPServer[];
  isLoading?: boolean;
  savedConfig?: SavedPlaygroundConfig | null;
}

export function LLMConfigPanel({
  isConnected,
  onConnect,
  onDisconnect,
  availableTools = [],
  virtualServers,
  savedConfig,
  isLoading = false
}: LLMConfigPanelProps) {
  // Server configuration
  const [serverMode, setServerMode] = useState<ServerSelectionMode>(savedConfig?.serverMode || 'virtual');
  const [selectedVirtualServerId, setSelectedVirtualServerId] = useState<string>(savedConfig?.virtualServerId || '');
  const [customServerUrl, setCustomServerUrl] = useState(savedConfig?.serverUrl || 'http://localhost:8000/mcp');
  const [customServerTransport, setCustomServerTransport] = useState(savedConfig?.serverTransport || 'streamable_http');
  const [customServerAuthToken, setCustomServerAuthToken] = useState('');

  // LLM configuration
  const [provider, setProvider] = useState<LLMProvider>(savedConfig?.provider || 'openai');
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(savedConfig?.llmConfig || PROVIDER_CONFIGS.openai);
  const [streaming, setStreaming] = useState(savedConfig?.streaming || false);

  // Collapsible state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fetch Ollama models dynamically
  const ollamaBaseUrl = (llmConfig['base_url'] as string) || 'http://localhost:11434';
  const { models: ollamaModels, isLoading: isLoadingOllamaModels, error: ollamaError } = useOllamaModels(
    provider === 'ollama' ? ollamaBaseUrl : ''
  );

  // Auto-collapse when connected
  useEffect(() => {
    if (isConnected && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isConnected]);

  // Load saved config when it changes
  useEffect(() => {
    if (savedConfig) {
      setServerMode(savedConfig.serverMode);
      setSelectedVirtualServerId(savedConfig.virtualServerId || '');
      setCustomServerUrl(savedConfig.serverUrl || 'http://localhost:8000/mcp');
      setCustomServerTransport(savedConfig.serverTransport || 'streamable_http');
      setProvider(savedConfig.provider);
      setLlmConfig(savedConfig.llmConfig);
      setStreaming(savedConfig.streaming);
    }
  }, [savedConfig]);

  // Auto-populate server details when virtual server is selected
  useEffect(() => {
    if (serverMode === 'virtual' && selectedVirtualServerId) {
      const server = virtualServers.find(s => s.id === selectedVirtualServerId);
      if (server) {
        setCustomServerUrl(server.url);
        setCustomServerTransport(server.transportType || 'streamable_http');
        setCustomServerAuthToken(server.authToken || '');
      }
    }
  }, [selectedVirtualServerId, serverMode, virtualServers]);

  // Update LLM config when provider changes
  useEffect(() => {
    setLlmConfig(PROVIDER_CONFIGS[provider]);
  }, [provider]);

  const handleConnect = async () => {
    const config = {
      serverMode,
      virtualServerId: serverMode === 'virtual' ? selectedVirtualServerId : undefined,
      serverUrl: customServerUrl,
      serverTransport: customServerTransport,
      serverAuthToken: customServerAuthToken || undefined,
      provider,
      llmConfig,
      streaming
    };

    await onConnect(config);
  };

  const updateLlmConfig = (key: string, value: unknown) => {
    setLlmConfig(prev => ({ ...prev, [key]: value }));
  };

  const isConfigValid = () => {
    // Check server configuration
    if (serverMode === 'virtual' && !selectedVirtualServerId) {
      return false;
    }
    if (serverMode === 'custom' && !customServerUrl) {
      return false;
    }

    // Check LLM configuration
    if (provider === 'azure_openai') {
      return !!(llmConfig.azure_endpoint && llmConfig.azure_deployment);
    }
    if (provider === 'openai' || provider === 'anthropic') {
      return !!(llmConfig.api_key && llmConfig.model);
    }
    if (provider === 'ollama') {
      return !!llmConfig.model;
    }

    return true;
  };

  return (
    <Card className="relative">
      {/* Collapsed state - show minimal info with expand button */}
      {isCollapsed && isConnected && (
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-green-500">
                <Zap className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <span className="text-sm text-gray-600">
                {PROVIDER_NAMES[provider]}
              </span>
              {availableTools.length > 0 && (
                <span className="text-xs text-gray-500">
                  {availableTools.length} tools
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(false)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded state - show full configuration */}
      {!isCollapsed && (
        <>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <>
                    <Badge variant="default" className="bg-green-500">
                      <Zap className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCollapsed(true)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
        {/* MCP Server Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <Label className="text-base font-semibold">MCP Server</Label>
          </div>

          <RadioGroup
            value={serverMode}
            onValueChange={(value) => setServerMode(value as ServerSelectionMode)}
            disabled={isConnected}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="virtual" id="virtual" />
              <Label htmlFor="virtual">Use Virtual Server</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom URL</Label>
            </div>
          </RadioGroup>

          {serverMode === 'virtual' ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="virtual-server">Select Server</Label>
                <Select
                  value={selectedVirtualServerId}
                  onValueChange={setSelectedVirtualServerId}
                  disabled={isConnected}
                >
                  <SelectTrigger id="virtual-server">
                    <SelectValue placeholder="Select a virtual server" />
                  </SelectTrigger>
                  <SelectContent>
                    {virtualServers.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">
                        No virtual servers available
                      </div>
                    ) : (
                      virtualServers.map(server => (
                        <SelectItem key={server.id} value={server.id}>
                          <div className="flex items-center gap-2">
                            <span className={server.active ? 'text-green-500' : 'text-gray-400'}>
                              ●
                            </span>
                            <span>{server.name}</span>
                            <span className="text-xs text-gray-500">
                              ({server.url})
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="virtual-auth-token">
                  Auth Token
                  {selectedVirtualServerId && virtualServers.find(s => s.id === selectedVirtualServerId)?.authToken && (
                    <span className="ml-2 text-xs font-normal text-green-600">(Using server token)</span>
                  )}
                </Label>
                <Input
                  id="virtual-auth-token"
                  type="password"
                  placeholder={
                    selectedVirtualServerId && virtualServers.find(s => s.id === selectedVirtualServerId)?.authToken
                      ? "Using server's configured token"
                      : "Enter auth token if required..."
                  }
                  value={customServerAuthToken}
                  onChange={(e) => setCustomServerAuthToken(e.target.value)}
                  disabled={isConnected}
                />
                {selectedVirtualServerId && virtualServers.find(s => s.id === selectedVirtualServerId)?.authToken ? (
                  <p className="text-xs text-gray-500">
                    Server has a configured token. Enter a value to override it.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Enter auth token if the server requires authentication
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="server-url">Server URL</Label>
                <Input
                  id="server-url"
                  placeholder="http://localhost:8000/mcp"
                  value={customServerUrl}
                  onChange={(e) => setCustomServerUrl(e.target.value)}
                  disabled={isConnected}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transport">Transport</Label>
                <Select
                  value={customServerTransport}
                  onValueChange={setCustomServerTransport}
                  disabled={isConnected}
                >
                  <SelectTrigger id="transport">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="streamable_http">Streamable HTTP</SelectItem>
                    <SelectItem value="sse">Server-Sent Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-token">Auth Token (Optional)</Label>
                <Input
                  id="auth-token"
                  type="password"
                  placeholder="Bearer token..."
                  value={customServerAuthToken}
                  onChange={(e) => setCustomServerAuthToken(e.target.value)}
                  disabled={isConnected}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* LLM Provider Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            <Label className="text-base font-semibold">LLM Provider</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={provider}
              onValueChange={(value) => setProvider(value as LLMProvider)}
              disabled={isConnected}
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDER_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider-specific configuration */}
          {provider === 'azure_openai' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="azure-endpoint">Azure Endpoint</Label>
                <Input
                  id="azure-endpoint"
                  placeholder="https://your-resource.openai.azure.com"
                  value={llmConfig.azure_endpoint as string || ''}
                  onChange={(e) => updateLlmConfig('azure_endpoint', e.target.value)}
                  disabled={isConnected}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="azure-deployment">Deployment Name</Label>
                <Input
                  id="azure-deployment"
                  placeholder="gpt-4"
                  value={llmConfig.azure_deployment as string || ''}
                  onChange={(e) => updateLlmConfig('azure_deployment', e.target.value)}
                  disabled={isConnected}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-version">API Version</Label>
                <Input
                  id="api-version"
                  placeholder="2024-02-15-preview"
                  value={llmConfig.api_version as string || ''}
                  onChange={(e) => updateLlmConfig('api_version', e.target.value)}
                  disabled={isConnected}
                />
              </div>
            </>
          )}

          {(provider === 'openai' || provider === 'anthropic') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={llmConfig.api_key as string || ''}
                  onChange={(e) => updateLlmConfig('api_key', e.target.value)}
                  disabled={isConnected}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={llmConfig.model as string || ''}
                  onValueChange={(value) => updateLlmConfig('model', value)}
                  disabled={isConnected}
                >
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_MODELS[provider].map(model => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {provider === 'ollama' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="base-url">Base URL</Label>
                <Input
                  id="base-url"
                  placeholder="http://localhost:11434"
                  value={(llmConfig['base_url'] as string) || ''}
                  onChange={(e) => updateLlmConfig('base_url', e.target.value)}
                  disabled={isConnected}
                />
                <p className="text-xs text-gray-500">
                  Change URL to refresh available models
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">
                  Model
                  {isLoadingOllamaModels && (
                    <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
                  )}
                </Label>
                <Select
                  value={llmConfig.model as string || ''}
                  onValueChange={(value) => updateLlmConfig('model', value)}
                  disabled={isConnected || isLoadingOllamaModels}
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder={isLoadingOllamaModels ? "Loading models..." : "Select a model"} />
                  </SelectTrigger>
                  <SelectContent>
                    {ollamaModels.length === 0 && !isLoadingOllamaModels ? (
                      <div className="p-2 text-sm text-gray-500">
                        {ollamaError ? `Error: ${ollamaError}` : 'No models available'}
                      </div>
                    ) : (
                      ollamaModels.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {ollamaError && (
                  <p className="text-xs text-red-500">
                    {ollamaError}. Using fallback models.
                  </p>
                )}
                {!ollamaError && ollamaModels.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {ollamaModels.length} model{ollamaModels.length !== 1 ? 's' : ''} available
                  </p>
                )}
              </div>
            </>
          )}

          {/* Common parameters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={llmConfig.temperature as number || 0.7}
                onChange={(e) => updateLlmConfig('temperature', parseFloat(e.target.value))}
                disabled={isConnected}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                min="1"
                max="32000"
                value={llmConfig.max_tokens as number || 2000}
                onChange={(e) => updateLlmConfig('max_tokens', parseInt(e.target.value))}
                disabled={isConnected}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="streaming"
              checked={streaming}
              onChange={(e) => setStreaming(e.target.checked)}
              disabled={isConnected}
              className="rounded"
            />
            <Label htmlFor="streaming">Enable Streaming</Label>
          </div>
        </div>

        {/* Available Tools */}
        {isConnected && availableTools.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Available Tools ({availableTools.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableTools.map(tool => (
                  <Badge key={tool} variant="secondary">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={!isConfigValid() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          ) : (
            <Button
              onClick={onDisconnect}
              variant="destructive"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          )}
        </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

// Made with Bob
