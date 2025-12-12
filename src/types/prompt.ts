// Type definitions for Prompt resources
// Based on PromptRead from the generated API client

export interface PromptArgument {
  name: string;
  description?: string | null;
  required?: boolean;
}

export interface PromptMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  failureRate: number;
  minResponseTime?: number | null;
  maxResponseTime?: number | null;
  avgResponseTime?: number | null;
}

export interface Prompt {
  id: string | number; // Backend returns UUID strings, but type system expects numbers
  name: string;
  description: string | null;
  template: string;
  arguments: PromptArgument[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  tags?: string[];
  metrics: PromptMetrics;
  
  // Ownership & visibility
  teamId?: string | null;
  team?: string | null;
  ownerEmail?: string | null;
  visibility?: string | null; // API returns optional string, can be 'public' | 'team' | 'private'
  createdBy?: string | null;
  modifiedBy?: string | null;
  
  // Metadata
  createdVia?: string | null;
  createdFromIp?: string | null;
  createdUserAgent?: string | null;
  modifiedFromIp?: string | null;
  modifiedVia?: string | null;
  modifiedUserAgent?: string | null;
  importBatchId?: string | null;
  federationSource?: string | null;
  version?: number | null;
  title?: string | null;
  _meta?: { [key: string]: unknown } | null;
}

export interface PromptCreate {
  name: string;
  description?: string | null;
  template: string;
  arguments?: PromptArgument[];
  tags?: string[] | null;
  team_id?: string | null;
  owner_email?: string | null;
  visibility?: string | null;
}

export interface PromptUpdate {
  name?: string | null;
  description?: string | null;
  template?: string | null;
  arguments?: PromptArgument[] | null;
  tags?: string[] | null;
  teamId?: string | null;
  ownerEmail?: string | null;
  visibility?: string | null;
}
