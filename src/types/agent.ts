export type AuthHeader = {
  key: string;
  value: string;
};

export type A2AAgent = {
  id: string;
  name: string;
  slug?: string | null;
  endpointUrl: string;
  description: string;
  agentType: string;
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  config: Record<string, unknown>;
  tags: string[];
  enabled: boolean;
  reachable: boolean;
  lastInteraction: string | null;
  team: string;
  teamId?: string | null;
  visibility: 'public' | 'team' | 'private';
  authType: string | null;
  authValue?: string | null;
  authUsername?: string | null;
  authPassword?: string | null;
  authToken?: string | null;
  authHeaderKey?: string | null;
  authHeaderValue?: string | null;
  authHeaders?: Array<{ [key: string]: string }> | null;
  oauthConfig?: OAuthConfig | null;
  passthroughHeaders: string[];
  metrics: A2AAgentMetrics;
  createdAt: string;
  updatedAt: string;
  ownerEmail?: string | null;
  logoUrl?: string | null;
};

export type A2AAgentMetrics = {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  failureRate: number;
  minResponseTime?: number | null;
  maxResponseTime?: number | null;
  avgResponseTime?: number | null;
  lastExecutionTime?: string | null;
};

export type OAuthConfig = {
  grant_type: string;
  client_id: string;
  client_secret: string;
  token_url: string;
  auth_url?: string;
  scopes?: string[];
  [key: string]: unknown;
};

export type OAuthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

export type OAuthTestResult = {
  success: boolean;
  step: 'authorization' | 'token_exchange' | 'agent_connection';
  message: string;
  token?: string;
  expiresIn?: number;
  scopes?: string[];
  error?: string;
  errorDetails?: string;
};

export type AgentConnectionTestResult = {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
};

export type StoredOAuthToken = {
  agentId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scopes: string[];
};
