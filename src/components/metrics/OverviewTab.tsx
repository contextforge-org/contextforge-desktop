import { Users, Target, CheckCircle, Zap, XCircle, BarChart3 } from 'lucide-react';
import { StatCard } from './StatCard';
import { PerformanceIndicator } from './PerformanceIndicator';
import { TopPerformersTable } from './TopPerformersTable';
import { AggregatedMetrics, PerformerData } from '../../types/metrics';

interface OverviewTabProps {
  metrics: AggregatedMetrics;
  theme: string;
}

export function OverviewTab({ metrics, theme }: OverviewTabProps) {
  // Prepare top performers data
  const prepareTopPerformers = (data: any[]): PerformerData[] => {
    if (!Array.isArray(data)) return [];
    return data
      .sort((a, b) => (b.totalExecutions || 0) - (a.totalExecutions || 0))
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        name: item.name || 'Unknown',
        executions: item.totalExecutions || 0,
        avgResponseTime: item.avgResponseTime || 'N/A',
        successRate: item.totalExecutions > 0
          ? Math.round(((item.successfulExecutions || 0) / item.totalExecutions) * 100)
          : 0,
        lastUsed: item.lastExecutionTime
          ? new Date(item.lastExecutionTime).toLocaleString()
          : 'Never'
      }));
  };

  // Safe access with defaults
  const users = metrics.users || {};
  const teams = metrics.teams || {};
  const mcpResources = metrics.mcpResources || {};
  const activity = metrics.activity || {};
  const resourceMetrics = metrics.resourceMetrics || {};
  
  const totalResources =
    (mcpResources.tools || 0) +
    (mcpResources.resources || 0) +
    (mcpResources.prompts || 0) +
    (mcpResources.virtualServers || 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          label="Total Users"
          value={users.total || 0}
          subtitle={`${users.active || 0} active`}
          color="blue"
          theme={theme}
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          label="Total Teams"
          value={teams.total || 0}
          subtitle={`${teams.totalMembers || 0} members`}
          color="purple"
          theme={theme}
        />
        <StatCard
          icon={<BarChart3 className="w-8 h-8" />}
          label="MCP Resources"
          value={totalResources}
          subtitle={`${mcpResources.tools || 0} tools`}
          color="green"
          theme={theme}
        />
        <StatCard
          icon={<Target className="w-8 h-8" />}
          label="Total Metrics"
          value={activity.totalExecutions || 0}
          subtitle="0 token logs"
          color="orange"
          theme={theme}
        />
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PerformanceIndicator
          icon={<Target className="w-6 h-6" />}
          value={activity.totalExecutions || 0}
          label="Total Executions"
          color="blue"
          theme={theme}
        />
        <PerformanceIndicator
          icon={<CheckCircle className="w-6 h-6" />}
          value={`${Math.round((activity.successRate || 0) * 100)}%`}
          label="Success Rate"
          color="green"
          theme={theme}
        />
        <PerformanceIndicator
          icon={<Zap className="w-6 h-6" />}
          value={`${(activity.avgResponseTime || 0).toFixed(3)} ms`}
          label="Avg Response Time"
          color="yellow"
          theme={theme}
        />
        <PerformanceIndicator
          icon={<XCircle className="w-6 h-6" />}
          value={`${Math.round((activity.errorRate || 0) * 100)}%`}
          label="Error Rate"
          color="red"
          theme={theme}
        />
      </div>

      {/* Top Performers */}
      <TopPerformersTable
        toolsData={prepareTopPerformers(resourceMetrics.tools || [])}
        resourcesData={prepareTopPerformers(resourceMetrics.resources || [])}
        promptsData={prepareTopPerformers(resourceMetrics.prompts || [])}
        serversData={prepareTopPerformers(resourceMetrics.servers || [])}
        theme={theme}
      />
    </div>
  );
}
