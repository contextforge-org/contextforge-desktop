import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { MCPServer } from '../types/server';
import {
  ChatMessage,
  LLMProvider,
  ServerSelectionMode,
  LLMConfig,
  ConnectResponse,
  ChatResponse
} from '../types/playground';
import { LLMConfigPanel } from './LLMConfigPanel';
import { ChatInterface } from './ChatInterface';
import { PageHeader } from './common';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, Activity } from 'lucide-react';
import * as api from '../lib/api/contextforge-api-ipc';
import { withAuth } from '../lib/api/auth-helper';
import { mapServerReadToMCPServer } from '../lib/api/server-mapper';
import { toast } from '../lib/toastWithTray';

// LocalStorage key for persisting playground configuration
const PLAYGROUND_CONFIG_KEY = 'llm-playground-config';

interface SavedPlaygroundConfig {
  serverMode: ServerSelectionMode;
  virtualServerId?: string;
  serverUrl?: string;
  serverTransport?: string;
  provider: LLMProvider;
  llmConfig: LLMConfig;
  streaming: boolean;
}

interface LLMPlaygroundPageProps {
  preSelectedServerId?: string;
}

export function LLMPlaygroundPage({ preSelectedServerId }: LLMPlaygroundPageProps = {}) {
  const { theme } = useTheme();
  const { selectedTeamId } = useTeam();
  const { user } = useCurrentUser();

  // Session state
  const [userId, setUserId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [availableTools, setAvailableTools] = useState<string[]>([]);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Virtual servers
  const [virtualServers, setVirtualServers] = useState<MCPServer[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(true);

  // Session metrics
  const [sessionMetrics, setSessionMetrics] = useState({
    totalMessages: 0,
    totalToolCalls: 0,
    avgResponseTime: 0
  });

  // Saved configuration state
  const [savedConfig, setSavedConfig] = useState<SavedPlaygroundConfig | null>(null);

  // Generate user ID on mount
  useEffect(() => {
    const id = user?.email || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setUserId(id);
  }, [user]);

  // Load saved configuration from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PLAYGROUND_CONFIG_KEY);
      if (saved) {
        const config = JSON.parse(saved) as SavedPlaygroundConfig;
        setSavedConfig(config);
        console.log('Loaded saved playground configuration:', config);
      }
    } catch (error) {
      console.error('Failed to load saved configuration:', error);
    }
  }, []);

  // Save configuration to localStorage
  const saveConfiguration = useCallback((config: SavedPlaygroundConfig) => {
    try {
      localStorage.setItem(PLAYGROUND_CONFIG_KEY, JSON.stringify(config));
      setSavedConfig(config);
      console.log('Saved playground configuration:', config);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error('Failed to save configuration');
    }
  }, []);

  // Fetch virtual servers
  useEffect(() => {
    async function fetchVirtualServers() {
      try {
        setIsLoadingServers(true);
        const servers = await withAuth(
          () => api.listServers(),
          'Failed to load virtual servers'
        );
        const mappedServers = servers.map(mapServerReadToMCPServer);
        
        // Filter by team if team context is active
        const filtered = selectedTeamId
          ? mappedServers.filter(s => s.teamId === selectedTeamId)
          : mappedServers;
        
        setVirtualServers(filtered);
      } catch (error) {
        console.error('Failed to fetch virtual servers:', error);
        toast.error('Failed to load virtual servers');
      } finally {
        setIsLoadingServers(false);
      }
    }

    fetchVirtualServers();
  }, [selectedTeamId]);

  // Handle pre-selected server from props
  useEffect(() => {
    if (preSelectedServerId && virtualServers.length > 0) {
      // This will be handled by LLMConfigPanel
      console.log('Pre-selected server:', preSelectedServerId);
    }
  }, [preSelectedServerId, virtualServers]);

  // Connect to LLM
  const handleConnect = async (config: {
    serverMode: ServerSelectionMode;
    virtualServerId?: string;
    serverUrl?: string;
    serverTransport?: string;
    serverAuthToken?: string;
    provider: LLMProvider;
    llmConfig: LLMConfig;
    streaming: boolean;
  }) => {
    try {
      setIsLoading(true);

      // Prepare server configuration
      let serverConfig: { url: string; transport: string; auth_token?: string } | undefined;
      
      if (config.serverMode === 'virtual' && config.virtualServerId) {
        const server = virtualServers.find(s => s.id === config.virtualServerId);
        if (server) {
          // Construct URL from server ID - backend proxies to actual MCP server
          const baseUrl = import.meta.env['VITE_API_URL'] || 'http://localhost:4444';
          serverConfig = {
            url: `${baseUrl}/servers/${server.id}/mcp`,
            transport: 'streamable_http',
            auth_token: server.authToken
          };
        }
      } else if (config.serverUrl) {
        serverConfig = {
          url: config.serverUrl,
          transport: config.serverTransport || 'streamable_http',
          auth_token: config.serverAuthToken
        };
      }

      // Connect to LLM chat service
      const response = await withAuth(
        async () => {
          const result = await api.connectLlmchat({
            user_id: userId,
            server: serverConfig,
            llm: {
              provider: config.provider,
              config: config.llmConfig
            },
            streaming: config.streaming
          });
          return result as ConnectResponse;
        },
        'Failed to connect to LLM'
      );

      setIsConnected(true);
      setCurrentProvider(response.provider);
      setAvailableTools(response.tools || []);
      setIsStreaming(config.streaming);

      // Save configuration to localStorage
      saveConfiguration({
        serverMode: config.serverMode,
        virtualServerId: config.virtualServerId,
        serverUrl: config.serverUrl,
        serverTransport: config.serverTransport,
        provider: config.provider,
        llmConfig: config.llmConfig,
        streaming: config.streaming
      });

      toast.success(`Connected to ${response.provider}`, {
        description: `${response.tool_count} tools available`
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to connect to LLM', {
        description: errorMessage
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from LLM
  const handleDisconnect = async () => {
    try {
      setIsLoading(true);

      await withAuth(
        () => api.disconnectLlmchat({ user_id: userId }),
        'Failed to disconnect'
      );

      setIsConnected(false);
      setCurrentProvider('');
      setAvailableTools([]);
      setMessages([]);
      setSessionMetrics({
        totalMessages: 0,
        totalToolCalls: 0,
        avgResponseTime: 0
      });

      toast.success('Disconnected from LLM');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (message: string) => {
    if (!isConnected || !userId) {
      toast.error('Not connected to LLM');
      return;
    }

    // Add user message to history
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      setIsLoading(true);

      if (isStreaming) {
        // Use streaming API
        const assistantMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Add placeholder assistant message
        const placeholderMessage: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, placeholderMessage]);

        await withAuth(
          () => api.chatLlmchatStreaming(
            {
              user_id: userId,
              message
            },
            {
              onChunk: (data) => {
                // Update the assistant message with new content
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: data.fullResponse }
                    : msg
                ));
              },
              onComplete: (data) => {
                // Update with final content and metadata
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: data.fullResponse,
                        toolsUsed: data.tools,
                        toolInvocations: data.toolInvocations,
                        elapsedMs: data.elapsedMs
                      }
                    : msg
                ));

                // Update metrics
                setSessionMetrics(prev => {
                  const newTotal = prev.totalMessages + 1;
                  const newAvg = data.elapsedMs
                    ? (prev.avgResponseTime * prev.totalMessages + data.elapsedMs) / newTotal
                    : prev.avgResponseTime;
                  return {
                    totalMessages: newTotal,
                    totalToolCalls: prev.totalToolCalls + (data.toolInvocations || 0),
                    avgResponseTime: newAvg
                  };
                });

                setIsLoading(false);
              },
              onError: (data) => {
                toast.error('Streaming error', {
                  description: data.error
                });
                
                // Add error message
                const errorMsg: ChatMessage = {
                  id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  role: 'assistant',
                  content: `Error: ${data.error}`,
                  timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev.filter(m => m.id !== assistantMessageId), errorMsg]);
                setIsLoading(false);
              }
            }
          ),
          'Failed to send message'
        );
      } else {
        // Use non-streaming API
        const response = await withAuth(
          async () => {
            const result = await api.chatLlmchat({
              user_id: userId,
              message,
              streaming: false
            });
            return result as ChatResponse;
          },
          'Failed to send message'
        );

        // Add assistant response to history
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
          toolsUsed: response.tools,
          toolInvocations: response.tool_invocations,
          elapsedMs: response.elapsed_ms
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Update metrics
        setSessionMetrics(prev => {
          const newTotal = prev.totalMessages + 1;
          const newAvg = (prev.avgResponseTime * prev.totalMessages + response.elapsed_ms) / newTotal;
          return {
            totalMessages: newTotal,
            totalToolCalls: prev.totalToolCalls + (response.tool_invocations || 0),
            avgResponseTime: newAvg
          };
        });
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to send message', {
        description: errorMessage
      });
      
      // Add error message to chat
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
  };

  // Clear chat history
  const handleClearHistory = () => {
    setMessages([]);
    setSessionMetrics({
      totalMessages: 0,
      totalToolCalls: 0,
      avgResponseTime: 0
    });
    toast.success('Chat history cleared');
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="LLM Playground"
        description="Test and interact with LLM providers using MCP tools"
        theme={theme}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Session Info */}
          {isConnected && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Session Info</span>
                    </div>
                    <Badge variant="outline">
                      Provider: {currentProvider}
                    </Badge>
                    <Badge variant="outline">
                      Tools: {availableTools.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Messages: {sessionMetrics.totalMessages}</span>
                    <span>Tool Calls: {sessionMetrics.totalToolCalls}</span>
                    {sessionMetrics.avgResponseTime > 0 && (
                      <span>
                        Avg Response: {(sessionMetrics.avgResponseTime / 1000).toFixed(2)}s
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-1">
              <LLMConfigPanel
                isConnected={isConnected}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                availableTools={availableTools}
                virtualServers={virtualServers}
                isLoading={isLoading || isLoadingServers}
                savedConfig={savedConfig}
              />
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                onClearHistory={handleClearHistory}
                isStreaming={isStreaming}
                isLoading={isLoading}
                isConnected={isConnected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
