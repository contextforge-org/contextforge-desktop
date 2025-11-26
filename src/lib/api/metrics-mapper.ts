/**
 * Metrics Data Mapper
 * 
 * Transforms the backend API response into the frontend AggregatedMetrics interface.
 * The backend returns a flat structure with keys like 'tools', 'resources', 'prompts', etc.
 * Each containing metrics like "Total Executions", "Successful Executions", etc.
 */

import { AggregatedMetrics } from '../../types/metrics';

/**
 * Helper to safely extract numeric value from various possible key formats
 */
function extractValue(obj: any, ...keys: string[]): number {
  if (!obj) return 0;
  
  for (const key of keys) {
    const normalized = key.toLowerCase().replace(/[_\s-]/g, '');
    for (const [k, v] of Object.entries(obj)) {
      const normalizedKey = k.toLowerCase().replace(/[_\s-]/g, '');
      if (normalizedKey === normalized) {
        const num = Number(v);
        return isNaN(num) ? 0 : num;
      }
    }
  }
  return 0;
}

/**
 * Helper to extract string value
 */
function extractString(obj: any, ...keys: string[]): string | null {
  if (!obj) return null;
  
  for (const key of keys) {
    const normalized = key.toLowerCase().replace(/[_\s-]/g, '');
    for (const [k, v] of Object.entries(obj)) {
      const normalizedKey = k.toLowerCase().replace(/[_\s-]/g, '');
      if (normalizedKey === normalized) {
        return v === null || v === undefined || v === 'N/A' ? null : String(v);
      }
    }
  }
  return null;
}

/**
 * Transform backend metrics response to frontend AggregatedMetrics interface
 */
export function mapMetricsResponse(data: any): AggregatedMetrics {
  // System stats response has nested breakdown objects
  // users: { total, breakdown: { active, inactive, admins } }
  // teams: { total, breakdown: { personal, organizational, members } }
  // mcp_resources: { total, breakdown: { servers, gateways, tools, resources, prompts, a2a_agents } }
  // security: { total, breakdown: { auth_events, audit_logs, pending_approvals, sso_providers } }
  // workflow: { total, breakdown: { team_invitations, join_requests } }
  
  // Extract user/team data from system stats
  const users = data.users || {};
  const usersBreakdown = users.breakdown || {};
  const teams = data.teams || {};
  const teamsBreakdown = teams.breakdown || {};
  
  // Extract MCP resource counts from mcp_resources.breakdown
  const mcpResourcesData = data.mcp_resources || {};
  const mcpBreakdown = mcpResourcesData.breakdown || {};
  
  // Extract security and workflow data
  const securityData = data.security || {};
  const securityBreakdown = securityData.breakdown || {};
  const workflowData = data.workflow || {};
  const workflowBreakdown = workflowData.breakdown || {};
  
  // Extract metrics data (execution stats and top performers)
  // The metrics object now comes from the /admin/metrics endpoint
  const metricsData = data.metrics || {};
  const tools = metricsData.tools || {};
  const resources = metricsData.resources || {};
  const prompts = metricsData.prompts || {};
  const servers = metricsData.servers || {};
  const topPerformers = metricsData.topPerformers || {};
  
  // Calculate totals
  const totalExecutions = 
    extractValue(tools, 'totalexecutions', 'total executions', 'executions') +
    extractValue(resources, 'totalexecutions', 'total executions', 'executions') +
    extractValue(prompts, 'totalexecutions', 'total executions', 'executions') +
    extractValue(servers, 'totalexecutions', 'total executions', 'executions');
  
  const totalSuccessful = 
    extractValue(tools, 'successfulexecutions', 'successful executions', 'successful') +
    extractValue(resources, 'successfulexecutions', 'successful executions', 'successful') +
    extractValue(prompts, 'successfulexecutions', 'successful executions', 'successful') +
    extractValue(servers, 'successfulexecutions', 'successful executions', 'successful');
  
  const totalFailed = 
    extractValue(tools, 'failedexecutions', 'failed executions', 'failed') +
    extractValue(resources, 'failedexecutions', 'failed executions', 'failed') +
    extractValue(prompts, 'failedexecutions', 'failed executions', 'failed') +
    extractValue(servers, 'failedexecutions', 'failed executions', 'failed');
  
  // Calculate weighted average response time
  const toolsExec = extractValue(tools, 'totalexecutions', 'total executions');
  const toolsAvg = extractValue(tools, 'averageresponsetime', 'average response time', 'avgresponsetime');
  const resourcesExec = extractValue(resources, 'totalexecutions', 'total executions');
  const resourcesAvg = extractValue(resources, 'averageresponsetime', 'average response time', 'avgresponsetime');
  const promptsExec = extractValue(prompts, 'totalexecutions', 'total executions');
  const promptsAvg = extractValue(prompts, 'averageresponsetime', 'average response time', 'avgresponsetime');
  const serversExec = extractValue(servers, 'totalexecutions', 'total executions');
  const serversAvg = extractValue(servers, 'averageresponsetime', 'average response time', 'avgresponsetime');
  
  const weightedSum = 
    (toolsExec * toolsAvg) +
    (resourcesExec * resourcesAvg) +
    (promptsExec * promptsAvg) +
    (serversExec * serversAvg);
  
  const avgResponseTime = totalExecutions > 0 ? weightedSum / totalExecutions : 0;
  const successRate = totalExecutions > 0 ? totalSuccessful / totalExecutions : 0;
  const errorRate = totalExecutions > 0 ? totalFailed / totalExecutions : 0;
  
  // Build resource metrics arrays (for top performers)
  const buildResourceMetrics = (resourceData: any) => {
    if (!resourceData || typeof resourceData !== 'object') return [];
    
    // If it's already an array, map it properly
    if (Array.isArray(resourceData)) {
      return resourceData.map((item) => {
        // TopPerformers structure has different field names than the full Read objects
        // Check if item has executionCount (topPerformers format) or metrics property (full Read format)
        const isTopPerformerFormat = 'executionCount' in item;
        
        let totalExec, successfulExec, failedExec, avgResp, lastExec;
        
        if (isTopPerformerFormat) {
          // TopPerformers format: executionCount, successRate (%), avgResponseTime, lastExecution
          totalExec = item.executionCount || 0;
          const successRatePercent = item.successRate !== null && item.successRate !== undefined ? item.successRate : 0;
          successfulExec = Math.round((totalExec * successRatePercent) / 100);
          failedExec = totalExec - successfulExec;
          avgResp = item.avgResponseTime || 0;
          lastExec = item.lastExecution || null;
        } else {
          // Full Read object format with metrics property
          const metricsObj = item.metrics || item;
          totalExec = metricsObj.totalExecutions || metricsObj.total_executions || metricsObj.executions || 0;
          failedExec = metricsObj.failedExecutions || metricsObj.failed_executions || metricsObj.failed || 0;
          successfulExec = metricsObj.successfulExecutions || metricsObj.successful_executions || metricsObj.successful || 0;
          avgResp = metricsObj.avgResponseTime || metricsObj.avg_response_time || metricsObj.averageResponseTime || 0;
          lastExec = metricsObj.lastExecutionTime || metricsObj.last_execution_time || metricsObj.lastUsed || null;
        }
        
        return {
          name: item.name || item.originalName || item.displayName || item.id || 'Unknown',
          totalExecutions: totalExec,
          successfulExecutions: successfulExec,
          failedExecutions: failedExec,
          failureRate: totalExec > 0 ? failedExec / totalExec : 0,
          avgResponseTime: avgResp,
          lastExecutionTime: lastExec,
        };
      });
    }
    
    // Check if there's a topPerformers or items array inside
    if (resourceData.topPerformers && Array.isArray(resourceData.topPerformers)) {
      return buildResourceMetrics(resourceData.topPerformers);
    }
    if (resourceData.items && Array.isArray(resourceData.items)) {
      return buildResourceMetrics(resourceData.items);
    }
    
    // Otherwise, create a single entry
    const totalExec = extractValue(resourceData, 'totalexecutions', 'total executions', 'executions');
    const failedExec = extractValue(resourceData, 'failedexecutions', 'failed executions', 'failed');
    return [{
      name: resourceData.name || resourceData.originalName || resourceData.displayName || resourceData.id || 'Unknown',
      totalExecutions: totalExec,
      successfulExecutions: extractValue(resourceData, 'successfulexecutions', 'successful executions', 'successful'),
      failedExecutions: failedExec,
      failureRate: totalExec > 0 ? failedExec / totalExec : 0,
      avgResponseTime: extractValue(resourceData, 'averageresponsetime', 'average response time', 'avgresponsetime'),
      lastExecutionTime: extractString(resourceData, 'lastexecutiontime', 'last execution time', 'lastused'),
    }];
  };
  
  return {
    users: {
      total: users.total || 0,
      active: usersBreakdown.active || 0,
      inactive: usersBreakdown.inactive || 0,
      admins: usersBreakdown.admins || 0,
    },
    teams: {
      total: teams.total || 0,
      personal: teamsBreakdown.personal || 0,
      organizational: teamsBreakdown.organizational || 0,
      totalMembers: teamsBreakdown.members || 0,
    },
    mcpResources: {
      virtualServers: mcpBreakdown.servers || 0,
      gatewayPeers: mcpBreakdown.gateways || 0,
      tools: mcpBreakdown.tools || 0,
      resources: mcpBreakdown.resources || 0,
      prompts: mcpBreakdown.prompts || 0,
      a2aAgents: mcpBreakdown.a2a_agents || 0,
    },
    activity: {
      totalExecutions,
      successRate,
      avgResponseTime,
      errorRate,
    },
    resourceMetrics: {
      tools: buildResourceMetrics(topPerformers.tools || []),
      resources: buildResourceMetrics(topPerformers.resources || []),
      prompts: buildResourceMetrics(topPerformers.prompts || []),
      servers: buildResourceMetrics(topPerformers.servers || []),
    },
    security: {
      authEvents: securityBreakdown.auth_events || 0,
      auditLogs: securityBreakdown.audit_logs || 0,
      pendingApprovals: securityBreakdown.pending_approvals || 0,
      ssoProviders: securityBreakdown.sso_providers || 0,
      teamInvitations: workflowBreakdown.team_invitations || 0,
      joinRequests: workflowBreakdown.join_requests || 0,
    },
  };
}
