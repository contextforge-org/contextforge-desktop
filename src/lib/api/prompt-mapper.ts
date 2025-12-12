import { PromptRead } from '../contextforge-client-ts';
import { Prompt } from '../../types/prompt';

/**
 * Maps a PromptRead from the API to the Prompt type used in the UI
 * Handles snake_case to camelCase conversion and ensures all fields are properly mapped
 */
export function mapPromptReadToPrompt(apiPrompt: any): Prompt {
  return {
    id: apiPrompt.id, // Can be UUID string or number depending on backend
    name: apiPrompt.name,
    description: apiPrompt.description,
    template: apiPrompt.template,
    arguments: apiPrompt.arguments || [],
    createdAt: apiPrompt.created_at || apiPrompt.createdAt,
    updatedAt: apiPrompt.updated_at || apiPrompt.updatedAt,
    // Backend inconsistency: list endpoint uses 'is_active', toggle endpoint uses 'enabled'
    isActive: apiPrompt.is_active ?? apiPrompt.enabled ?? apiPrompt.isActive ?? true,
    tags: apiPrompt.tags || [],
    metrics: {
      totalExecutions: apiPrompt.metrics?.total_executions || apiPrompt.metrics?.totalExecutions || 0,
      successfulExecutions: apiPrompt.metrics?.successful_executions || apiPrompt.metrics?.successfulExecutions || 0,
      failedExecutions: apiPrompt.metrics?.failed_executions || apiPrompt.metrics?.failedExecutions || 0,
      failureRate: apiPrompt.metrics?.failure_rate || apiPrompt.metrics?.failureRate || 0,
      minResponseTime: apiPrompt.metrics?.min_response_time || apiPrompt.metrics?.minResponseTime || null,
      maxResponseTime: apiPrompt.metrics?.max_response_time || apiPrompt.metrics?.maxResponseTime || null,
      avgResponseTime: apiPrompt.metrics?.avg_response_time || apiPrompt.metrics?.avgResponseTime || null,
    },
    teamId: apiPrompt.team_id || apiPrompt.teamId || null,
    team: apiPrompt.team || null,
    ownerEmail: apiPrompt.owner_email || apiPrompt.ownerEmail || null,
    visibility: apiPrompt.visibility || null,
    createdBy: apiPrompt.created_by || apiPrompt.createdBy || null,
    modifiedBy: apiPrompt.modified_by || apiPrompt.modifiedBy || null,
    createdVia: apiPrompt.created_via || apiPrompt.createdVia || null,
    createdFromIp: apiPrompt.created_from_ip || apiPrompt.createdFromIp || null,
    createdUserAgent: apiPrompt.created_user_agent || apiPrompt.createdUserAgent || null,
    modifiedFromIp: apiPrompt.modified_from_ip || apiPrompt.modifiedFromIp || null,
    modifiedVia: apiPrompt.modified_via || apiPrompt.modifiedVia || null,
    modifiedUserAgent: apiPrompt.modified_user_agent || apiPrompt.modifiedUserAgent || null,
    importBatchId: apiPrompt.import_batch_id || apiPrompt.importBatchId || null,
    federationSource: apiPrompt.federation_source || apiPrompt.federationSource || null,
    version: apiPrompt.version || null,
    title: apiPrompt.title || null,
    _meta: apiPrompt._meta || null,
  };
}