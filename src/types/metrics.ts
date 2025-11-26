// Type definitions for metrics dashboard

export interface AggregatedMetrics {
  users: UserMetrics;
  teams: TeamMetrics;
  mcpResources: MCPResourceMetrics;
  activity: ActivityMetrics;
  security: SecurityMetrics;
  resourceMetrics: ResourceMetricsCollection;
}

export interface UserMetrics {
  total: number;
  active: number;
  inactive: number;
  admins: number;
}

export interface TeamMetrics {
  total: number;
  personal: number;
  organizational: number;
  totalMembers: number;
}

export interface MCPResourceMetrics {
  virtualServers: number;
  gatewayPeers: number;
  tools: number;
  resources: number;
  prompts: number;
  a2aAgents: number;
}

export interface ActivityMetrics {
  totalExecutions: number;
  successRate: number;
  avgResponseTime: number;
  errorRate: number;
}

export interface SecurityMetrics {
  authEvents: number;
  auditLogs: number;
  pendingApprovals: number;
  ssoProviders: number;
  teamInvitations: number;
  joinRequests: number;
}

export interface ResourceMetricsCollection {
  tools: ToolMetricsSummary[];
  resources: ResourceMetricsSummary[];
  prompts: PromptMetricsSummary[];
  servers: ServerMetricsSummary[];
}

export interface ToolMetricsSummary {
  name: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  failureRate: number;
  avgResponseTime: number | null;
  lastExecutionTime: string | null;
}

export interface ResourceMetricsSummary {
  name: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  failureRate: number;
  avgResponseTime: number | null;
  lastExecutionTime: string | null;
}

export interface PromptMetricsSummary {
  name: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  failureRate: number;
  avgResponseTime: number | null;
  lastExecutionTime: string | null;
}

export interface ServerMetricsSummary {
  name: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  failureRate: number;
  avgResponseTime: number | null;
  lastExecutionTime: string | null;
}

export interface PerformerData {
  rank: number;
  name: string;
  executions: number;
  avgResponseTime: number | string;
  successRate: number;
  lastUsed: string;
}
