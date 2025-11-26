# Metrics Dashboard Implementation Guide

## Quick Start

This guide provides step-by-step instructions for implementing the metrics dashboard, including code snippets and testing strategies.

---

## Phase 1: Foundation Setup

### Step 1.1: Create Type Definitions

**File**: `src/types/metrics.ts`

```typescript
// Aggregated metrics response from API
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

// Similar interfaces for ResourceMetricsSummary, PromptMetricsSummary, ServerMetricsSummary
```

### Step 1.2: Add API Methods

**File**: `src/lib/api/contextforge-api-ipc.ts`

Add these functions:

```typescript
// Get aggregated metrics
export async function getAggregatedMetrics(): Promise<AggregatedMetrics> {
  if (!isElectron) {
    throw new Error('This API wrapper requires Electron environment');
  }

  const response = await window.electronAPI.api.getAggregatedMetrics();
  
  if (!response.success) {
    throw new Error('Failed to get metrics: ' + response.error);
  }
  
  return response.data;
}
```

**File**: `src/lib/api/contextforge-api-main.ts`

Add IPC handler:

```typescript
import { getAggregatedMetricsAdminMetricsGet } from '../contextforge-client-ts';

// In setupAPIHandlers function, add:
ipcMain.handle('api:getAggregatedMetrics', async () => {
  try {
    const response = await getAggregatedMetricsAdminMetricsGet({
      client: apiClient
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to get aggregated metrics:', error);
    return { success: false, error: (error as Error).message };
  }
});
```

### Step 1.3: Create Custom Hook

**File**: `src/hooks/useMetrics.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api/contextforge-api-ipc';
import { AggregatedMetrics } from '../types/metrics';
import { toast } from '../lib/toastWithTray';

export function useMetrics(refreshInterval: number = 30000) {
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getAggregatedMetrics();
      setMetrics(data);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast.error('Failed to load metrics: ' + errorMessage);
      console.error('Failed to fetch metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    lastRefresh,
    refetch: fetchMetrics
  };
}
```

---

## Phase 2: Reusable Components

### Step 2.1: StatCard Component

**File**: `src/components/metrics/StatCard.tsx`

```typescript
import { Card, CardContent } from '../ui/card';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtitle?: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
  theme: string;
}

export function StatCard({ icon, label, value, subtitle, color, theme }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-900',
    purple: 'bg-purple-100 dark:bg-purple-950 border-purple-200 dark:border-purple-900',
    green: 'bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-900',
    orange: 'bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-900',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className={`${iconColorClasses[color]}`}>
            {icon}
          </div>
          <div className="flex flex-col gap-1">
            <div className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </div>
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {label}
            </div>
            {subtitle && (
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 2.2: MetricCard Component

**File**: `src/components/metrics/MetricCard.tsx`

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { MetricRow } from './MetricRow';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  metrics: Array<{
    icon?: React.ReactNode;
    label: string;
    value: number | string;
    color?: string;
  }>;
  theme: string;
}

export function MetricCard({ icon, title, metrics, theme }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {icon}
          </div>
          <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {metrics.map((metric, index) => (
            <MetricRow key={index} {...metric} theme={theme} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 2.3: MetricRow Component

**File**: `src/components/metrics/MetricRow.tsx`

```typescript
interface MetricRowProps {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
  theme: string;
}

export function MetricRow({ icon, label, value, color, theme }: MetricRowProps) {
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    blue: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && (
          <div className={color ? colorClasses[color as keyof typeof colorClasses] : ''}>
            {icon}
          </div>
        )}
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
      <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}
```

### Step 2.4: PerformanceIndicator Component

**File**: `src/components/metrics/PerformanceIndicator.tsx`

```typescript
interface PerformanceIndicatorProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  theme: string;
}

export function PerformanceIndicator({ icon, value, label, color, theme }: PerformanceIndicatorProps) {
  const borderColorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
    red: 'border-red-500',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="flex flex-col items-center gap-3 p-6 border rounded-xl bg-card">
      <div className={`p-4 rounded-full border-4 ${borderColorClasses[color as keyof typeof borderColorClasses]} ${iconColorClasses[color as keyof typeof iconColorClasses]}`}>
        {icon}
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </div>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </div>
      </div>
    </div>
  );
}
```

### Step 2.5: TopPerformersTable Component

**File**: `src/components/metrics/TopPerformersTable.tsx`

```typescript
import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';

interface PerformerData {
  rank: number;
  name: string;
  executions: number;
  avgResponseTime: number | string;
  successRate: number;
  lastUsed: string;
}

interface TopPerformersTableProps {
  toolsData: PerformerData[];
  resourcesData: PerformerData[];
  promptsData: PerformerData[];
  serversData: PerformerData[];
  theme: string;
}

export function TopPerformersTable({ 
  toolsData, 
  resourcesData, 
  promptsData, 
  serversData, 
  theme 
}: TopPerformersTableProps) {
  const [activeType, setActiveType] = useState('tools');

  const currentData = useMemo(() => {
    switch (activeType) {
      case 'tools': return toolsData;
      case 'resources': return resourcesData;
      case 'prompts': return promptsData;
      case 'servers': return serversData;
      default: return toolsData;
    }
  }, [activeType, toolsData, resourcesData, promptsData, serversData]);

  const formatResponseTime = (time: number | string) => {
    if (typeof time === 'string') return time;
    if (time === null || time === undefined) return 'N/A';
    return time < 1 ? `${(time * 1000).toFixed(0)}ms` : `${time.toFixed(2)}s`;
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Top Performers
      </h3>

      <Tabs value={activeType} onValueChange={setActiveType}>
        <TabsList>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
        </TabsList>

        <TabsContent value={activeType} className="mt-4">
          <div className="border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">RANK</TableHead>
                  <TableHead>NAME</TableHead>
                  <TableHead className="text-right">EXECUTIONS</TableHead>
                  <TableHead className="text-right">AVG RESPONSE TIME</TableHead>
                  <TableHead className="text-right">SUCCESS RATE</TableHead>
                  <TableHead className="text-right">LAST USED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((item) => (
                    <TableRow key={item.rank}>
                      <TableCell>
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {item.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.executions}</TableCell>
                      <TableCell className="text-right">{formatResponseTime(item.avgResponseTime)}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.successRate === 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                          {item.successRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {item.lastUsed}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Phase 3: Tab Components

### Step 3.1: Overview Tab

**File**: `src/components/metrics/OverviewTab.tsx`

```typescript
import { Users, Target, CheckCircle, Zap, XCircle } from 'lucide-react';
import { StatCard } from './StatCard';
import { PerformanceIndicator } from './PerformanceIndicator';
import { TopPerformersTable } from './TopPerformersTable';
import { AggregatedMetrics } from '../../types/metrics';

interface OverviewTabProps {
  metrics: AggregatedMetrics;
  theme: string;
}

export function OverviewTab({ metrics, theme }: OverviewTabProps) {
  // Prepare top performers data
  const prepareTopPerformers = (data: any[]) => {
    return data
      .sort((a, b) => b.totalExecutions - a.totalExecutions)
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        name: item.name,
        executions: item.totalExecutions,
        avgResponseTime: item.avgResponseTime || 'N/A',
        successRate: Math.round((item.successfulExecutions / item.totalExecutions) * 100) || 0,
        lastUsed: item.lastExecutionTime 
          ? new Date(item.lastExecutionTime).toLocaleString()
          : 'Never'
      }));
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          label="Total Users"
          value={metrics.users.total}
          subtitle={`${metrics.users.active} active`}
          color="blue"
          theme={theme}
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          label="Total Teams"
          value={metrics.teams.total}
          subtitle={`${metrics.teams.totalMembers} members`}
          color="purple"
          theme={theme}
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          label="MCP Resources"
          value={
            metrics.mcpResources.tools +
            metrics.mcpResources.resources +
            metrics.mcpResources.prompts +
            metrics.mcpResources.virtualServers
          }
          subtitle={`${metrics.mcpResources.tools} tools`}
          color="green"
          theme={theme}
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          label="Total Metrics"
          value={metrics.activity.totalExecutions}
          subtitle="0 token logs"
          color="orange"
          theme={theme}
        />
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PerformanceIndicator
          icon={<Target className="w-6 h-6" />}
          value={metrics.activity.totalExecutions}
          label="Total Executions"
          color="blue"
          theme={theme}
        />
        <PerformanceIndicator
          icon={<CheckCircle className="w-6 h-6" />}
          value={`${Math.round(metrics.activity.successRate * 100)}%`}
          label="Success Rate"
          color="green"
          theme={theme}
        />
        <PerformanceIndicator
          icon={<Zap className="w-6 h-6" />}
          value={`${metrics.activity.avgResponseTime.toFixed(3)} ms`}
          label="Avg Response Time"
          color="yellow"
          theme={theme}
        />
        <PerformanceIndicator
          icon={<XCircle className="w-6 h-6" />}
          value={`${Math.round(metrics.activity.errorRate * 100)}%`}
          label="Error Rate"
          color="red"
          theme={theme}
        />
      </div>

      {/* Top Performers */}
      <TopPerformersTable
        toolsData={prepareTopPerformers(metrics.resourceMetrics.tools)}
        resourcesData={prepareTopPerformers(metrics.resourceMetrics.resources)}
        promptsData={prepareTopPerformers(metrics.resourceMetrics.prompts)}
        serversData={prepareTopPerformers(metrics.resourceMetrics.servers)}
        theme={theme}
      />
    </div>
  );
}
```

### Step 3.2: Users & Teams Tab

**File**: `src/components/metrics/UsersTeamsTab.tsx`

```typescript
import { Users, CheckCircle, XCircle, Crown, User, Building } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AggregatedMetrics } from '../../types/metrics';

interface UsersTeamsTabProps {
  metrics: AggregatedMetrics;
  theme: string;
}

export function UsersTeamsTab({ metrics, theme }: UsersTeamsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MetricCard
        icon={<Users className="w-5 h-5" />}
        title="Users"
        metrics={[
          { label: 'Total Users', value: metrics.users.total },
          { 
            icon: <CheckCircle className="w-4 h-4" />, 
            label: 'Active', 
            value: metrics.users.active,
            color: 'green'
          },
          { 
            icon: <XCircle className="w-4 h-4" />, 
            label: 'Inactive', 
            value: metrics.users.inactive,
            color: 'red'
          },
          { 
            icon: <Crown className="w-4 h-4" />, 
            label: 'Admins', 
            value: metrics.users.admins,
            color: 'yellow'
          },
        ]}
        theme={theme}
      />

      <MetricCard
        icon={<Users className="w-5 h-5" />}
        title="Teams"
        metrics={[
          { label: 'Total Teams', value: metrics.teams.total },
          { 
            icon: <User className="w-4 h-4" />, 
            label: 'Personal', 
            value: metrics.teams.personal 
          },
          { 
            icon: <Building className="w-4 h-4" />, 
            label: 'Organizational', 
            value: metrics.teams.organizational 
          },
          { 
            icon: <Users className="w-4 h-4" />, 
            label: 'Team Members', 
            value: metrics.teams.totalMembers 
          },
        ]}
        theme={theme}
      />
    </div>
  );
}
```

---

## Phase 4: Main MetricsPage Component

**File**: `src/components/MetricsPage.tsx`

```typescript
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMetrics } from '../hooks/useMetrics';
import { PageHeader } from './common';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { OverviewTab } from './metrics/OverviewTab';
import { UsersTeamsTab } from './metrics/UsersTeamsTab';
// Import other tabs...

export function MetricsPage() {
  const { theme } = useTheme();
  const { metrics, isLoading, error, lastRefresh, refetch } = useMetrics(30000);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    if (!metrics) return;
    
    // Convert to CSV
    const csv = convertMetricsToCSV(metrics);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!metrics) {
    return <div>No metrics available</div>;
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
            <TabsList>
              <TabsTrigger value="overview">📊 Overview</TabsTrigger>
              <TabsTrigger value="users-teams">👥 Users & Teams</TabsTrigger>
              <TabsTrigger value="mcp-resources">🔌 MCP Resources</TabsTrigger>
              <TabsTrigger value="activity">📈 Activity</TabsTrigger>
              <TabsTrigger value="security">🔒 Security</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
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

          {/* Add other tab contents */}
        </Tabs>
      </div>
    </div>
  );
}

function convertMetricsToCSV(metrics: AggregatedMetrics): string {
  const rows = [
    ['Category', 'Metric', 'Value'],
    ['Users', 'Total', metrics.users.total.toString()],
    ['Users', 'Active', metrics.users.active.toString()],
    ['Users', 'Inactive', metrics.users.inactive.toString()],
    ['Users', 'Admins', metrics.users.admins.toString()],
    // Add more rows...
  ];

  return rows.map(row => row.join(',')).join('\n');
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Test `useMetrics` hook with mock data
- [ ] Test CSV export formatting
- [ ] Test metric calculations
- [ ] Test component rendering with different themes

### Integration Tests
- [ ] Test API integration
- [ ] Test auto-refresh behavior
- [ ] Test tab navigation
- [ ] Test error handling

### Manual Testing
- [ ] Verify all tabs display correctly
- [ ] Test theme switching
- [ ] Test responsive layout on different screen sizes
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Verify auto-refresh works
- [ ] Test CSV export downloads correctly

---

## Deployment Checklist

- [ ] All components created
- [ ] API methods added
- [ ] Types defined
- [ ] Custom hook implemented
- [ ] All tabs implemented
- [ ] Export functionality working
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Theme support verified
- [ ] Responsive design tested
- [ ] Accessibility features added
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Tests passing

---

## Troubleshooting

### Metrics not loading
1. Check API endpoint is accessible
2. Verify authentication token is valid
3. Check browser console for errors
4. Verify IPC handlers are registered

### Auto-refresh not working
1. Check interval is set correctly
2. Verify useEffect cleanup is working
3. Check for memory leaks

### Export not working
1. Verify CSV formatting is correct
2. Check browser download permissions
3. Test with different browsers

---

This implementation guide provides all the code needed to build the metrics dashboard. Follow the phases in order for a systematic implementation.