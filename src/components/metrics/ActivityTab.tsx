import { MetricCard } from './MetricCard';
import { AggregatedMetrics } from '../../types/metrics';

interface ActivityTabProps {
  metrics: AggregatedMetrics;
  theme: string;
}

export function ActivityTab({ metrics, theme }: ActivityTabProps) {
  const formatTime = (time: number | null) => {
    if (time === null || time === undefined) return 'N/A';
    return time < 1 ? `${(time * 1000).toFixed(0)}ms` : `${time.toFixed(2)}s`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  const resourceMetrics = metrics.resourceMetrics || {};
  const tools = resourceMetrics.tools || [];
  const resources = resourceMetrics.resources || [];
  const prompts = resourceMetrics.prompts || [];
  const servers = resourceMetrics.servers || [];

  // Calculate aggregate metrics for each resource type
  const toolsMetrics = tools.reduce((acc, tool) => ({
    totalExecutions: acc.totalExecutions + (tool.totalExecutions || 0),
    successfulExecutions: acc.successfulExecutions + (tool.successfulExecutions || 0),
    failedExecutions: acc.failedExecutions + (tool.failedExecutions || 0),
  }), { totalExecutions: 0, successfulExecutions: 0, failedExecutions: 0 });

  const resourcesMetrics = resources.reduce((acc, resource) => ({
    totalExecutions: acc.totalExecutions + (resource.totalExecutions || 0),
    successfulExecutions: acc.successfulExecutions + (resource.successfulExecutions || 0),
    failedExecutions: acc.failedExecutions + (resource.failedExecutions || 0),
  }), { totalExecutions: 0, successfulExecutions: 0, failedExecutions: 0 });

  const promptsMetrics = prompts.reduce((acc, prompt) => ({
    totalExecutions: acc.totalExecutions + (prompt.totalExecutions || 0),
    successfulExecutions: acc.successfulExecutions + (prompt.successfulExecutions || 0),
    failedExecutions: acc.failedExecutions + (prompt.failedExecutions || 0),
  }), { totalExecutions: 0, successfulExecutions: 0, failedExecutions: 0 });

  const serversMetrics = servers.reduce((acc, server) => ({
    totalExecutions: acc.totalExecutions + (server.totalExecutions || 0),
    successfulExecutions: acc.successfulExecutions + (server.successfulExecutions || 0),
    failedExecutions: acc.failedExecutions + (server.failedExecutions || 0),
  }), { totalExecutions: 0, successfulExecutions: 0, failedExecutions: 0 });

  // Get latest execution time for each type
  const getLatestExecution = (items: any[]) => {
    if (!Array.isArray(items)) return 'Never';
    const times = items
      .map(item => item.lastExecutionTime)
      .filter(time => time !== null)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return times.length > 0 ? formatDate(times[0]) : 'Never';
  };

  // Calculate average response time for each type
  const getAvgResponseTime = (items: any[]) => {
    if (!Array.isArray(items)) return 'N/A';
    const times = items
      .map(item => item.avgResponseTime)
      .filter(time => time !== null && time !== undefined);
    if (times.length === 0) return 'N/A';
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    return formatTime(avg);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        icon={<span className="text-lg">🔧</span>}
        title="Tools Metrics"
        metrics={[
          { label: 'Total Executions', value: toolsMetrics.totalExecutions },
          { label: 'Successful Executions', value: toolsMetrics.successfulExecutions, color: 'green' },
          { label: 'Failed Executions', value: toolsMetrics.failedExecutions, color: 'red' },
          { label: 'Failure Rate', value: toolsMetrics.totalExecutions > 0 
            ? `${Math.round((toolsMetrics.failedExecutions / toolsMetrics.totalExecutions) * 100)}%` 
            : '0%' 
          },
          { label: 'Average Response Time', value: getAvgResponseTime(tools) },
          { label: 'Last Execution Time', value: getLatestExecution(tools) },
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<span className="text-lg">📚</span>}
        title="Resources Metrics"
        metrics={[
          { label: 'Total Executions', value: resourcesMetrics.totalExecutions },
          { label: 'Successful Executions', value: resourcesMetrics.successfulExecutions, color: 'green' },
          { label: 'Failed Executions', value: resourcesMetrics.failedExecutions, color: 'red' },
          { label: 'Failure Rate', value: resourcesMetrics.totalExecutions > 0 
            ? `${Math.round((resourcesMetrics.failedExecutions / resourcesMetrics.totalExecutions) * 100)}%` 
            : '0%' 
          },
          { label: 'Average Response Time', value: getAvgResponseTime(resources) },
          { label: 'Last Execution Time', value: getLatestExecution(resources) },
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<span className="text-lg">💬</span>}
        title="Prompts Metrics"
        metrics={[
          { label: 'Total Executions', value: promptsMetrics.totalExecutions },
          { label: 'Successful Executions', value: promptsMetrics.successfulExecutions, color: 'green' },
          { label: 'Failed Executions', value: promptsMetrics.failedExecutions, color: 'red' },
          { label: 'Failure Rate', value: promptsMetrics.totalExecutions > 0 
            ? `${Math.round((promptsMetrics.failedExecutions / promptsMetrics.totalExecutions) * 100)}%` 
            : '0%' 
          },
          { label: 'Average Response Time', value: getAvgResponseTime(prompts) },
          { label: 'Last Execution Time', value: getLatestExecution(prompts) },
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<span className="text-lg">🖥️</span>}
        title="Servers Metrics"
        metrics={[
          { label: 'Total Executions', value: serversMetrics.totalExecutions },
          { label: 'Successful Executions', value: serversMetrics.successfulExecutions, color: 'green' },
          { label: 'Failed Executions', value: serversMetrics.failedExecutions, color: 'red' },
          { label: 'Failure Rate', value: serversMetrics.totalExecutions > 0 
            ? `${Math.round((serversMetrics.failedExecutions / serversMetrics.totalExecutions) * 100)}%` 
            : '0%' 
          },
          { label: 'Average Response Time', value: getAvgResponseTime(servers) },
          { label: 'Last Execution Time', value: getLatestExecution(servers) },
        ]}
        theme={theme}
      />
    </div>
  );
}
