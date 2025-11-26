import { A2aAgentRead, A2aAgentCreate, A2aAgentUpdate } from '../contextforge-client-ts';
import { A2AAgent } from '../../types/agent';

/**
 * Maps an A2A Agent from the API format to the UI format
 */
export function mapA2aAgentReadToA2AAgent(apiAgent: A2aAgentRead): A2AAgent {
  return {
    id: apiAgent.id || '',
    name: apiAgent.name,
    slug: apiAgent.slug,
    endpointUrl: apiAgent.endpointUrl,
    description: apiAgent.description || '',
    agentType: apiAgent.agentType,
    protocolVersion: apiAgent.protocolVersion,
    capabilities: apiAgent.capabilities,
    config: apiAgent.config,
    tags: apiAgent.tags || [],
    enabled: apiAgent.enabled,
    reachable: apiAgent.reachable,
    lastInteraction: apiAgent.lastInteraction,
    team: apiAgent.team || 'Unknown',
    teamId: apiAgent.teamId,
    visibility: (apiAgent.visibility as 'public' | 'team' | 'private') || 'public',
    authType: apiAgent.authType || null,
    authValue: apiAgent.authValue,
    authUsername: apiAgent.authUsername,
    authPassword: apiAgent.authPassword,
    authToken: apiAgent.authToken,
    authHeaderKey: apiAgent.authHeaderKey,
    authHeaderValue: apiAgent.authHeaderValue,
    authHeaders: null, // Not provided in A2aAgentRead, only key/value pair
    oauthConfig: apiAgent.oauthConfig ? {
      grant_type: (apiAgent.oauthConfig as any).grant_type || '',
      client_id: (apiAgent.oauthConfig as any).client_id || '',
      client_secret: (apiAgent.oauthConfig as any).client_secret || '',
      token_url: (apiAgent.oauthConfig as any).token_url || '',
      auth_url: (apiAgent.oauthConfig as any).auth_url,
      scopes: (apiAgent.oauthConfig as any).scopes,
      ...(apiAgent.oauthConfig as any),
    } : null,
    passthroughHeaders: apiAgent.passthroughHeaders || [],
    metrics: {
      totalExecutions: apiAgent.metrics.totalExecutions,
      successfulExecutions: apiAgent.metrics.successfulExecutions,
      failedExecutions: apiAgent.metrics.failedExecutions,
      failureRate: apiAgent.metrics.failureRate,
      minResponseTime: apiAgent.metrics.minResponseTime,
      maxResponseTime: apiAgent.metrics.maxResponseTime,
      avgResponseTime: apiAgent.metrics.avgResponseTime,
      lastExecutionTime: apiAgent.metrics.lastExecutionTime,
    },
    createdAt: apiAgent.createdAt,
    updatedAt: apiAgent.updatedAt,
    ownerEmail: apiAgent.ownerEmail,
  };
}

/**
 * Maps an A2A Agent from the UI format to the API create format
 */
export function mapA2AAgentToA2aAgentCreate(agent: Partial<A2AAgent>): A2aAgentCreate {
  const createData: A2aAgentCreate = {
    name: agent.name!,
    endpoint_url: agent.endpointUrl!,
    slug: agent.slug,
    description: agent.description,
    agent_type: agent.agentType,
    protocol_version: agent.protocolVersion,
    capabilities: agent.capabilities,
    config: agent.config,
    passthrough_headers: agent.passthroughHeaders,
    tags: agent.tags,
    team_id: agent.teamId,
    visibility: agent.visibility,
  };

  // Add authentication fields based on auth type
  if (agent.authType) {
    createData.auth_type = agent.authType;

    switch (agent.authType) {
      case 'basic':
        createData.auth_username = agent.authUsername;
        createData.auth_password = agent.authPassword;
        break;
      case 'bearer':
        createData.auth_token = agent.authToken;
        break;
      case 'headers':
        if (agent.authHeaderKey && agent.authHeaderValue) {
          createData.auth_header_key = agent.authHeaderKey;
          createData.auth_header_value = agent.authHeaderValue;
        }
        if (agent.authHeaders) {
          createData.auth_headers = agent.authHeaders;
        }
        break;
      case 'oauth':
        createData.oauth_config = agent.oauthConfig;
        break;
    }
  }

  return createData;
}

/**
 * Maps an A2A Agent from the UI format to the API update format
 */
export function mapA2AAgentToA2aAgentUpdate(agent: Partial<A2AAgent>): A2aAgentUpdate {
  const updateData: A2aAgentUpdate = {
    name: agent.name,
    endpointUrl: agent.endpointUrl,
    description: agent.description,
    agentType: agent.agentType,
    protocolVersion: agent.protocolVersion,
    capabilities: agent.capabilities,
    config: agent.config,
    passthroughHeaders: agent.passthroughHeaders,
    tags: agent.tags,
    teamId: agent.teamId,
    visibility: agent.visibility,
  };

  // Add authentication fields based on auth type
  if (agent.authType !== undefined) {
    updateData.authType = agent.authType;

    switch (agent.authType) {
      case 'basic':
        updateData.authUsername = agent.authUsername;
        updateData.authPassword = agent.authPassword;
        break;
      case 'bearer':
        updateData.authToken = agent.authToken;
        break;
      case 'headers':
        if (agent.authHeaderKey && agent.authHeaderValue) {
          updateData.authHeaderKey = agent.authHeaderKey;
          updateData.authHeaderValue = agent.authHeaderValue;
        }
        if (agent.authHeaders) {
          updateData.authHeaders = agent.authHeaders;
        }
        break;
      case 'oauth':
        updateData.oauthConfig = agent.oauthConfig;
        break;
    }
  }

  return updateData;
}
