# LLM Chat Playground Design

## Overview
The LLM Chat Playground provides an interactive testing environment for conversing with various LLM providers (Azure OpenAI, OpenAI, Anthropic, AWS Bedrock, Ollama, IBM Watsonx) with integrated MCP tool support. Users can configure LLM settings, connect to MCP servers, and have conversations with tool-calling capabilities.

## Available APIs

### 1. Connect API
- **Endpoint**: `POST /llmchat/connect`
- **Purpose**: Initialize or refresh a chat session
- **Request Body**:
  ```typescript
  {
    user_id: string;
    server?: {
      url?: string;
      transport?: string;
      auth_token?: string;
    };
    llm?: {
      provider: string; // 'azure_openai', 'openai', 'anthropic', 'aws_bedrock', 'ollama', 'watsonx'
      config?: Record<string, unknown>;
    };
    streaming?: boolean;
  }
  ```
- **Response**:
  ```typescript
  {
    status: 'connected';
    user_id: string;
    provider: string;
    tool_count: number;
    tools: string[];
  }
  ```

### 2. Chat API
- **Endpoint**: `POST /llmchat/chat`
- **Purpose**: Send messages and receive LLM responses
- **Request Body**:
  ```typescript
  {
    user_id: string;
    message: string;
    streaming?: boolean;
  }
  ```
- **Response (Non-streaming)**:
  ```typescript
  {
    user_id: string;
    response: string;
    tool_used: boolean;
    tools: string[];
    tool_invocations: number;
    elapsed_ms: number;
  }
  ```
- **Response (Streaming)**: Server-Sent Events (SSE) stream

### 3. Disconnect API
- **Endpoint**: `POST /llmchat/disconnect`
- **Purpose**: End chat session and cleanup
- **Request Body**:
  ```typescript
  {
    user_id: string;
  }
  ```

### 4. Status API
- **Endpoint**: `GET /llmchat/status/{user_id}`
- **Purpose**: Check if session is active
- **Response**:
  ```typescript
  {
    user_id: string;
    connected: boolean;
  }
  ```

### 5. Config API
- **Endpoint**: `GET /llmchat/config/{user_id}`
- **Purpose**: Retrieve sanitized session configuration
- **Response**:
  ```typescript
  {
    mcp_server: { url: string; transport: string };
    llm: { provider: string; config: Record<string, unknown> };
    enable_streaming: boolean;
  }
  ```

## UI Design

### Main Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ LLM Playground                                   [Disconnect]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Configuration Panel                          [Connected ●]  │ │
│ │                                                             │ │
│ │ ┌─── MCP Server ──────────────────────────────────────────┐ │ │
│ │ │ ○ Use Virtual Server: [My MCP Server ▼]                │ │ │
│ │ │ ○ Custom URL: [http://localhost:8000/mcp]              │ │ │
│ │ │   Transport: [streamable_http ▼]                       │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ ┌─── LLM Provider ────────────────────────────────────────┐ │ │
│ │ │ Provider: [Azure OpenAI ▼]                              │ │ │
│ │ │ Model: [gpt-4 ▼]          Temperature: [0.7    ]       │ │ │
│ │ │ API Key: [••••••••••••••••]                            │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ Available Tools (5): search, calculator, weather...        │ │
│ │                                                             │ │
│ │ [Configure] [Connect]                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Chat History                                                │ │
│ │                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ User: What's the weather in San Francisco?             │ │ │
│ │ │                                                         │ │ │
│ │ │ Assistant: [🔧 Used: weather]                          │ │ │
│ │ │ The weather in San Francisco is currently 65°F...      │ │ │
│ │ │                                              [Copy] [⋮] │ │ │
│ │ │                                                         │ │ │
│ │ │ User: Calculate 15% tip on $85                         │ │ │
│ │ │                                                         │ │ │
│ │ │ Assistant: [🔧 Used: calculator]                       │ │ │
│ │ │ A 15% tip on $85 would be $12.75...                    │ │ │
│ │ │                                              [Copy] [⋮] │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ [Clear History]                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Message Input                                               │ │
│ │                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Type your message here...                               │ │ │
│ │ │                                                         │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ [📎] [Streaming: ☑]                              [Send ➤] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Session Info                                                │ │
│ │ Provider: Azure OpenAI (gpt-4) | Tools: 5 | Latency: 234ms │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. LLMPlaygroundPage (Main Container)
**Responsibilities:**
- Manage overall playground state
- Coordinate between configuration and chat components
- Handle session lifecycle (connect/disconnect)
- Persist user preferences

**State:**
```typescript
const [userId, setUserId] = useState<string>('');
const [isConnected, setIsConnected] = useState(false);
const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

### 2. LLMConfigPanel
**Responsibilities:**
- LLM provider selection and configuration
- MCP server connection settings (Virtual Server or Custom URL)
- Display available tools
- Handle connection/disconnection

**Props:**
```typescript
interface LLMConfigPanelProps {
  isConnected: boolean;
  onConnect: (config: ConnectInput) => Promise<void>;
  onDisconnect: () => Promise<void>;
  availableTools?: string[];
  virtualServers: MCPServer[];
}
```

**Features:**
- Provider-specific configuration forms
- Virtual Server selector with dropdown
- Custom URL option for manual configuration
- Validation for required fields
- Connection status indicator
- Tool list display
- Auto-populate server details from Virtual Server selection

### 3. ChatInterface
**Responsibilities:**
- Display chat history
- Handle message input
- Show streaming responses
- Display tool usage indicators

**Props:**
```typescript
interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isStreaming: boolean;
  isLoading: boolean;
  isConnected: boolean;
}
```

**Features:**
- Message bubbles with user/assistant distinction
- Tool usage badges
- Copy message functionality
- Streaming text animation
- Auto-scroll to latest message

### 4. MessageBubble
**Responsibilities:**
- Render individual messages
- Show tool usage
- Provide message actions

**Props:**
```typescript
interface MessageBubbleProps {
  message: ChatMessage;
  onCopy: () => void;
  onRegenerate?: () => void;
}
```

### 5. LLMProviderSelector
**Responsibilities:**
- Provider dropdown
- Provider-specific configuration fields

**Supported Providers:**
- Azure OpenAI
- OpenAI
- Anthropic (Claude)
- AWS Bedrock
- Ollama
- IBM Watsonx

## Data Types

```typescript
// Playground-specific types
export type LLMProvider = 
  | 'azure_openai'
  | 'openai'
  | 'anthropic'
  | 'aws_bedrock'
  | 'ollama'
  | 'watsonx';

export type ServerSelectionMode = 'virtual' | 'custom';

export type SessionConfig = {
  userId: string;
  provider: LLMProvider;
  llmConfig: Record<string, unknown>;
  serverMode: ServerSelectionMode;
  virtualServerId?: string; // ID of selected virtual server
  mcpServer?: {
    url: string;
    transport: string;
    authToken?: string;
  };
  streaming: boolean;
  availableTools: string[];
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolsUsed?: string[];
  toolInvocations?: number;
  elapsedMs?: number;
  isStreaming?: boolean;
};

export type LLMConfig = {
  // Azure OpenAI
  azure_endpoint?: string;
  azure_deployment?: string;
  api_version?: string;
  
  // OpenAI / Anthropic
  api_key?: string;
  model?: string;
  
  // Common
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  
  // Provider-specific
  [key: string]: unknown;
};

export type ConnectionStatus = {
  connected: boolean;
  provider?: string;
  toolCount?: number;
  tools?: string[];
  error?: string;
};
```

## State Management

### Session State
```typescript
// Global session state
const [session, setSession] = useState<{
  userId: string;
  isConnected: boolean;
  config: SessionConfig | null;
  status: ConnectionStatus;
}>({
  userId: generateUserId(),
  isConnected: false,
  config: null,
  status: { connected: false }
});
```

### Chat State
```typescript
// Chat history and current message
const [chatState, setChatState] = useState<{
  messages: ChatMessage[];
  currentMessage: string;
  isLoading: boolean;
  streamingMessage: string;
}>({
  messages: [],
  currentMessage: '',
  isLoading: false,
  streamingMessage: ''
});
```

## API Integration

### Connect to LLM
```typescript
const connectToLLM = async (config: ConnectInput) => {
  try {
    setIsLoading(true);
    
    const response = await api.connectLlmchatConnectPost({
      body: {
        user_id: userId,
        server: config.server,
        llm: config.llm,
        streaming: config.streaming
      }
    });
    
    setIsConnected(true);
    setSessionConfig({
      userId,
      provider: response.data.provider,
      availableTools: response.data.tools,
      ...config
    });
    
    toast.success(`Connected to ${response.data.provider}`);
  } catch (error) {
    toast.error('Failed to connect to LLM');
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

### Send Message
```typescript
const sendMessage = async (message: string) => {
  if (!isConnected) {
    toast.error('Please connect to an LLM first');
    return;
  }
  
  try {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    
    const response = await api.chatLlmchatChatPost({
      body: {
        user_id: userId,
        message,
        streaming: sessionConfig?.streaming
      }
    });
    
    // Add assistant response to history
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: response.data.response,
      timestamp: new Date().toISOString(),
      toolsUsed: response.data.tools,
      toolInvocations: response.data.tool_invocations,
      elapsedMs: response.data.elapsed_ms
    };
    setChatHistory(prev => [...prev, assistantMessage]);
    
  } catch (error) {
    toast.error('Failed to send message');
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

### Handle Streaming (Future Enhancement)
```typescript
const sendStreamingMessage = async (message: string) => {
  // Implementation for SSE streaming
  const eventSource = new EventSource(
    `/llmchat/chat?user_id=${userId}&message=${encodeURIComponent(message)}`
  );
  
  let streamingMessage = '';
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    streamingMessage += data.token;
    setStreamingMessage(streamingMessage);
  };
  
  eventSource.onerror = () => {
    eventSource.close();
    setIsLoading(false);
  };
};
```

### Disconnect
```typescript
const disconnect = async () => {
  try {
    await api.disconnectLlmchatDisconnectPost({
      body: { user_id: userId }
    });
    
    setIsConnected(false);
    setSessionConfig(null);
    toast.success('Disconnected from LLM');
  } catch (error) {
    toast.error('Failed to disconnect');
  }
};
```

## Provider Configuration Templates

### Azure OpenAI
```typescript
const azureOpenAIConfig = {
  provider: 'azure_openai',
  config: {
    api_key: '',
    azure_endpoint: 'https://your-resource.openai.azure.com',
    azure_deployment: 'gpt-4',
    api_version: '2024-02-15-preview',
    temperature: 0.7,
    max_tokens: 2000
  }
};
```

### OpenAI
```typescript
const openAIConfig = {
  provider: 'openai',
  config: {
    api_key: '',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000
  }
};
```

### Anthropic (Claude)
```typescript
const anthropicConfig = {
  provider: 'anthropic',
  config: {
    api_key: '',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    max_tokens: 4000
  }
};
```

### Ollama (Local)
```typescript
const ollamaConfig = {
  provider: 'ollama',
  config: {
    model: 'llama3',
    temperature: 0.7,
    base_url: 'http://localhost:11434'
  }
};
```

## Features

### Core Features
1. **Multi-Provider Support**
   - Switch between LLM providers
   - Provider-specific configuration
   - Validation for required fields

2. **MCP Tool Integration**
   - Display available tools
   - Show tool usage in responses
   - Tool invocation tracking

3. **Chat Interface**
   - Message history
   - User/Assistant distinction
   - Copy messages
   - Clear history

4. **Session Management**
   - Connect/Disconnect
   - Session status indicator
   - Configuration persistence

5. **Streaming Support**
   - Toggle streaming mode
   - Real-time token display
   - Streaming indicators

### Advanced Features
1. **Configuration Presets**
   - Save provider configurations
   - Quick-switch between presets
   - Share configurations

2. **Message Actions**
   - Copy message
   - Regenerate response
   - Edit and resend

3. **Tool Inspection**
   - View tool call details
   - Tool execution logs
   - Tool performance metrics

4. **Export/Import**
   - Export chat history
   - Import previous sessions
   - Share conversations

5. **Performance Metrics**
   - Response time tracking
   - Token usage (if available)
   - Tool invocation stats

## User Experience

### Workflow
1. User opens LLM Playground
2. User selects LLM provider
3. User configures provider settings (API key, model, etc.)
4. User optionally configures MCP server
5. User clicks "Connect"
6. System establishes session and displays available tools
7. User types message and sends
8. System shows loading state
9. Response appears with tool usage indicators
10. User continues conversation
11. User can disconnect when done

### Error Handling
- **Connection Failed**: Show error with retry option
- **Invalid Configuration**: Highlight invalid fields
- **Message Send Failed**: Show error, allow retry
- **Session Expired**: Prompt to reconnect
- **Tool Execution Failed**: Show in message with details

### Performance
- Debounce configuration changes
- Lazy load chat history
- Optimize message rendering
- Cache provider configurations
- Auto-reconnect on network issues

## Implementation Priority

### Phase 1: MVP
- [x] API analysis complete
- [ ] Basic configuration panel
- [ ] Simple chat interface
- [ ] Connect/disconnect functionality
- [ ] Non-streaming message send/receive
- [ ] Basic error handling

### Phase 2: Enhanced UX
- [ ] Provider-specific configuration forms
- [ ] Tool usage indicators
- [ ] Message actions (copy, regenerate)
- [ ] Session persistence
- [ ] Configuration presets

### Phase 3: Advanced Features
- [ ] Streaming support
- [ ] Tool inspection
- [ ] Export/import
- [ ] Performance metrics
- [ ] Advanced error recovery

## Integration Points


## Virtual Server Integration

### Overview
The playground integrates with the Virtual Servers page, allowing users to select pre-configured MCP servers instead of manually entering connection details. This provides a seamless testing experience for configured servers.

### Features

1. **Server Selection Modes**
   - **Virtual Server Mode**: Select from list of configured virtual servers
   - **Custom URL Mode**: Manually enter server connection details

2. **Virtual Server Selector**
   - Dropdown showing all available virtual servers
   - Display server name, URL, and status
   - Filter by team (respects team context)
   - Show only active/reachable servers

3. **Auto-Population**
   - When virtual server selected, auto-populate:
     - Server URL
     - Transport type
     - Authentication token (if configured)
   - Display available tools from server

4. **Quick Test from Virtual Servers Page**
   - Add "Test in Playground" button to Virtual Server details panel
   - Opens playground with server pre-selected
   - Automatically connects if LLM config available

### Implementation

#### Fetch Virtual Servers
```typescript
const [virtualServers, setVirtualServers] = useState<MCPServer[]>([]);

useEffect(() => {
  async function fetchVirtualServers() {
    try {
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
    }
  }
  
  fetchVirtualServers();
}, [selectedTeamId]);
```

#### Handle Virtual Server Selection
```typescript
const handleVirtualServerSelect = (serverId: string) => {
  const server = virtualServers.find(s => s.id === serverId);
  if (!server) return;
  
  setServerMode('virtual');
  setSelectedVirtualServerId(serverId);
  
  // Auto-populate server configuration
  setServerConfig({
    url: server.url,
    transport: server.transportType || 'streamable_http',
    auth_token: server.authToken
  });
  
  toast.success(`Selected server: ${server.name}`);
};
```

#### Connect with Virtual Server
```typescript
const connectWithVirtualServer = async () => {
  const server = virtualServers.find(s => s.id === selectedVirtualServerId);
  if (!server) {
    toast.error('Virtual server not found');
    return;
  }
  
  try {
    const response = await api.connectLlmchatConnectPost({
      body: {
        user_id: userId,
        server: {
          url: server.url,
          transport: server.transportType || 'streamable_http',
          auth_token: server.authToken
        },
        llm: {
          provider: llmProvider,
          config: llmConfig
        },
        streaming: enableStreaming
      }
    });
    
    setIsConnected(true);
    setAvailableTools(response.data.tools);
    toast.success(`Connected to ${server.name}`);
  } catch (error) {
    toast.error('Failed to connect to virtual server');
    throw error;
  }
};
```

### UI Components

#### VirtualServerSelector Component
```typescript
interface VirtualServerSelectorProps {
  servers: MCPServer[];
  selectedServerId?: string;
  onSelect: (serverId: string) => void;
  disabled?: boolean;
}

export function VirtualServerSelector({
  servers,
  selectedServerId,
  onSelect,
  disabled
}: VirtualServerSelectorProps) {
  return (
    <Select
      value={selectedServerId}
      onValueChange={onSelect}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a virtual server" />
      </SelectTrigger>
      <SelectContent>
        {servers.map(server => (
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
        ))}
      </SelectContent>
    </Select>
  );
}
```

#### Server Mode Toggle
```typescript
<RadioGroup value={serverMode} onValueChange={setServerMode}>
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
  <VirtualServerSelector
    servers={virtualServers}
    selectedServerId={selectedVirtualServerId}
    onSelect={handleVirtualServerSelect}
  />
) : (
  <div className="space-y-2">
    <Input
      placeholder="http://localhost:8000/mcp"
      value={serverConfig.url}
      onChange={(e) => setServerConfig({...serverConfig, url: e.target.value})}
    />
    <Select
      value={serverConfig.transport}
      onValueChange={(v) => setServerConfig({...serverConfig, transport: v})}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="streamable_http">Streamable HTTP</SelectItem>
        <SelectItem value="sse">Server-Sent Events</SelectItem>
      </SelectContent>
    </Select>
  </div>
)}
```

### Navigation from Virtual Servers Page

Add a "Test in Playground" action to the Virtual Server details panel:

```typescript
// In VirtualServerDetailsPanel.tsx
const handleTestInPlayground = () => {
  // Navigate to playground with server pre-selected
  navigate(`/playground?server=${server.id}`);
};

// In action buttons
<Button
  variant="outline"
  size="sm"
  onClick={handleTestInPlayground}
>
  <TestTube className="h-4 w-4 mr-2" />
  Test in Playground
</Button>
```

### URL Parameters

Support pre-selecting server via URL parameter:

```typescript
// In LLMPlaygroundPage.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const serverId = params.get('server');
  
  if (serverId && virtualServers.length > 0) {
    handleVirtualServerSelect(serverId);
  }
}, [virtualServers]);
```

### Benefits

1. **Convenience**: No need to manually enter server details
2. **Consistency**: Use same server configuration as Virtual Servers page
3. **Security**: Leverage existing authentication configuration
4. **Testing**: Easy way to test virtual servers with LLM integration
5. **Team Collaboration**: Share server configurations via team context

### Navigation
- Add "Playground" to side navigation
- Icon: MessageSquare or Sparkles
- Route: `/playground`

### Settings Integration
- Save default provider configurations
- Playground preferences
- API key management

### MCP Servers Integration
- Quick-select from configured servers
- Auto-populate server URL
- Use server authentication

## Security Considerations

1. **API Key Storage**: Store securely, never log
2. **Session Isolation**: Each user gets unique session
3. **Input Sanitization**: Validate all user inputs
4. **Rate Limiting**: Prevent abuse
5. **Sensitive Data**: Don't log messages or API keys

## Accessibility

- Keyboard navigation for all controls
- Screen reader support for messages
- High contrast mode
- Focus indicators
- ARIA labels for interactive elements
- Alt text for tool indicators

## Testing Strategy

1. **Unit Tests**
   - Configuration validation
   - Message formatting
   - State management

2. **Integration Tests**
   - Connect/disconnect flow
   - Message send/receive
   - Error handling

3. **E2E Tests**
   - Complete conversation flow
   - Multiple providers
   - Tool usage scenarios

## Future Enhancements

1. **Multi-Turn Conversations**: Context management
2. **Conversation Branching**: Explore different paths
3. **Prompt Templates**: Pre-built prompts
4. **Voice Input**: Speech-to-text
5. **Image Support**: Multi-modal conversations
6. **Collaborative Sessions**: Share with team
7. **A/B Testing**: Compare provider responses
8. **Cost Tracking**: Monitor API usage costs