import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMetrics } from '../hooks/useMetrics';
import { PageHeader } from './common';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Download, RefreshCw, BarChart3, Users, Plug, Activity, Lock } from 'lucide-react';
import { OverviewTab } from './metrics/OverviewTab';
import { UsersTeamsTab } from './metrics/UsersTeamsTab';
import { MCPResourcesTab } from './metrics/MCPResourcesTab';
import { ActivityTab } from './metrics/ActivityTab';
import { SecurityTab } from './metrics/SecurityTab';
import { AggregatedMetrics } from '../types/metrics';
import { toast } from '../lib/toastWithTray';

export function MetricsPage() {
  const { theme } = useTheme();
  const { metrics, isLoading, error, lastRefresh, refetch } = useMetrics(30000);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Metrics refreshed');
  };

  const handleExport = () => {
    if (!metrics) return;
    
    try {
      const csv = convertMetricsToCSV(metrics);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics-${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Metrics exported successfully');
    } catch (err) {
      toast.error('Failed to export metrics');
      console.error('Export error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full">
        <PageHeader
          title="System Metrics"
          description="Real-time system metrics showing counts across all entity types. Useful for capacity planning and system monitoring."
          theme={theme}
        />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Loading metrics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full w-full">
        <PageHeader
          title="System Metrics"
          description="Real-time system metrics showing counts across all entity types. Useful for capacity planning and system monitoring."
          theme={theme}
        />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center max-w-md">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Failed to Load Metrics
            </h3>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col h-full w-full">
        <PageHeader
          title="System Metrics"
          description="Real-time system metrics showing counts across all entity types. Useful for capacity planning and system monitoring."
          theme={theme}
        />
        <div className="flex items-center justify-center flex-1">
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            No metrics available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <PageHeader
        title="System Metrics"
        description="Real-time system metrics showing counts across all entity types. Useful for capacity planning and system monitoring."
        theme={theme}
      />

      <div className="px-8 pb-8 space-y-6">
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100 border-gray-200'}`}>
              <TabsTrigger value="overview" className={theme === 'dark' ? 'data-[state=inactive]:text-zinc-400' : ''}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users-teams" className={theme === 'dark' ? 'data-[state=inactive]:text-zinc-400' : ''}>
                <Users className="w-4 h-4 mr-2" />
                Users & Teams
              </TabsTrigger>
              <TabsTrigger value="mcp-resources" className={theme === 'dark' ? 'data-[state=inactive]:text-zinc-400' : ''}>
                <Plug className="w-4 h-4 mr-2" />
                MCP Resources
              </TabsTrigger>
              <TabsTrigger value="activity" className={theme === 'dark' ? 'data-[state=inactive]:text-zinc-400' : ''}>
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="security" className={theme === 'dark' ? 'data-[state=inactive]:text-zinc-400' : ''}>
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 ml-4">
            <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-800' : ''}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab}>
          <TabsContent value="overview">
            <OverviewTab metrics={metrics} theme={theme} />
            <div className="mt-6">
              <Button onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                Export Metrics
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="users-teams">
            <UsersTeamsTab metrics={metrics} theme={theme} />
          </TabsContent>

          <TabsContent value="mcp-resources">
            <MCPResourcesTab metrics={metrics} theme={theme} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTab metrics={metrics} theme={theme} />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab metrics={metrics} theme={theme} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function convertMetricsToCSV(metrics: AggregatedMetrics): string {
  const rows = [
    ['Category', 'Metric', 'Value'],
    // Users
    ['Users', 'Total', metrics.users.total.toString()],
    ['Users', 'Active', metrics.users.active.toString()],
    ['Users', 'Inactive', metrics.users.inactive.toString()],
    ['Users', 'Admins', metrics.users.admins.toString()],
    // Teams
    ['Teams', 'Total', metrics.teams.total.toString()],
    ['Teams', 'Personal', metrics.teams.personal.toString()],
    ['Teams', 'Organizational', metrics.teams.organizational.toString()],
    ['Teams', 'Total Members', metrics.teams.totalMembers.toString()],
    // MCP Resources
    ['MCP Resources', 'Virtual Servers', metrics.mcpResources.virtualServers.toString()],
    ['MCP Resources', 'Gateway Peers', metrics.mcpResources.gatewayPeers.toString()],
    ['MCP Resources', 'Tools', metrics.mcpResources.tools.toString()],
    ['MCP Resources', 'Resources', metrics.mcpResources.resources.toString()],
    ['MCP Resources', 'Prompts', metrics.mcpResources.prompts.toString()],
    ['MCP Resources', 'A2A Agents', metrics.mcpResources.a2aAgents.toString()],
    // Activity
    ['Activity', 'Total Executions', metrics.activity.totalExecutions.toString()],
    ['Activity', 'Success Rate', `${(metrics.activity.successRate * 100).toFixed(2)}%`],
    ['Activity', 'Avg Response Time', `${metrics.activity.avgResponseTime.toFixed(3)}ms`],
    ['Activity', 'Error Rate', `${(metrics.activity.errorRate * 100).toFixed(2)}%`],
    // Security
    ['Security', 'Auth Events', metrics.security.authEvents.toString()],
    ['Security', 'Audit Logs', metrics.security.auditLogs.toString()],
    ['Security', 'Pending Approvals', metrics.security.pendingApprovals.toString()],
    ['Security', 'SSO Providers', metrics.security.ssoProviders.toString()],
    ['Security', 'Team Invitations', metrics.security.teamInvitations.toString()],
    ['Security', 'Join Requests', metrics.security.joinRequests.toString()],
  ];

  return rows.map(row => row.join(',')).join('\n');
}
