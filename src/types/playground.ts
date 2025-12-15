// LLM Chat Playground Types

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
  virtualServerId?: string;
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

export type ConnectResponse = {
  status: string;
  user_id: string;
  provider: string;
  tool_count: number;
  tools: string[];
};

export type ChatResponse = {
  user_id: string;
  response: string;
  tool_used: boolean;
  tools: string[];
  tool_invocations: number;
  elapsed_ms: number;
};

export type DisconnectResponse = {
  status: 'disconnected' | 'no_active_session' | 'disconnected_with_errors';
  user_id: string;
  message: string;
  warning?: string;
};

export type StatusResponse = {
  user_id: string;
  connected: boolean;
};

export type ConfigResponse = {
  mcp_server: {
    url: string;
    transport: string;
  };
  llm: {
    provider: string;
    config: Record<string, unknown>;
  };
  enable_streaming: boolean;
};

// Provider configuration templates
export const PROVIDER_CONFIGS: Record<LLMProvider, Partial<LLMConfig>> = {
  azure_openai: {
    azure_endpoint: '',
    azure_deployment: 'gpt-4',
    api_version: '2024-02-15-preview',
    temperature: 0.7,
    max_tokens: 2000
  },
  openai: {
    api_key: '',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000
  },
  anthropic: {
    api_key: '',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    max_tokens: 4000
  },
  aws_bedrock: {
    model: 'anthropic.claude-3-sonnet-20240229-v1:0',
    temperature: 0.7,
    max_tokens: 2000
  },
  ollama: {
    model: 'llama3',
    temperature: 0.7,
    base_url: 'http://localhost:11434'
  },
  watsonx: {
    model: 'ibm/granite-13b-chat-v2',
    temperature: 0.7,
    max_tokens: 2000
  }
};

// Provider display names
export const PROVIDER_NAMES: Record<LLMProvider, string> = {
  azure_openai: 'Azure OpenAI',
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  aws_bedrock: 'AWS Bedrock',
  ollama: 'Ollama (Local)',
  watsonx: 'IBM Watsonx'
};

// Common models for each provider
export const PROVIDER_MODELS: Record<LLMProvider, string[]> = {
  azure_openai: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-35-turbo'],
  openai: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  aws_bedrock: [
    'anthropic.claude-3-sonnet-20240229-v1:0',
    'anthropic.claude-3-haiku-20240307-v1:0',
    'anthropic.claude-v2:1'
  ],
  ollama: ['llama3', 'llama2', 'mistral', 'mixtral', 'codellama', 'phi'],
  watsonx: ['ibm/granite-13b-chat-v2', 'ibm/granite-20b-multilingual']
};

// Made with Bob
