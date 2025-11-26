# Metrics Dashboard Component Specifications

## Component Hierarchy & Visual Layout

This document provides detailed specifications for each component in the metrics dashboard, including exact styling, props, and visual examples.

---

## 1. MetricsPage (Main Container)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ PageHeader                                                   │
│ "System Metrics"                                            │
│ "Real-time system metrics showing counts across..."         │
├─────────────────────────────────────────────────────────────┤
│ Tabs Navigation                                             │
│ [📊 Overview] [👥 Users & Teams] [🔌 MCP Resources]        │
│ [📈 Activity] [🔒 Security]                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Tab Content Area (Dynamic based on active tab)              │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Props Interface
```typescript
interface MetricsPageProps {
  // No props - uses context for theme and team
}
```

### State Management
```typescript
const [metricsData, setMetricsData] = useState<AggregatedMetrics | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [activeTab, setActiveTab] = useState('overview');
const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
```

### Styling
```tsx
<div className="flex flex-col h-full w-full">
  <PageHeader 
    title="System Metrics"
    description="Real-time system metrics showing counts across all entity types. Useful for capacity planning and system monitoring."
    theme={theme}
  />
  
  <div className="px-8 pb-8">
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      {/* Tab content */}
    </Tabs>
  </div>
</div>
```

---

## 2. StatCard Component

### Visual Design
```
┌──────────────────────────────────┐
│ 🔵                               │
│                                  │
│         1                        │
│    Total Users                   │
│    1 active                      │
│                                  │
└──────────────────────────────────┘
```

### Props Interface
```typescript
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtitle?: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
  theme: string;
}
```

### Implementation
```tsx
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

### Usage Examples
```tsx
<StatCard
  icon={<Users className="w-8 h-8" />}
  label="Total Users"
  value={1}
  subtitle="1 active"
  color="blue"
  theme={theme}
/>

<StatCard
  icon={<Users className="w-8 h-8" />}
  label="Total Teams"
  value={2}
  subtitle="2 members"
  color="purple"
  theme={theme}
/>
```

---

## 3. MetricCard Component

### Visual Design
```
┌──────────────────────────────────────────┐
│ 👤 Users                                 │
├──────────────────────────────────────────┤
│                                          │
│ Total Users                           1  │
│ ✅ Active                             1  │
│ ❌ Inactive                           0  │
│ 👑 Admins                             1  │
│                                          │
└──────────────────────────────────────────┘
```

### Props Interface
```typescript
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
```

### Implementation
```tsx
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

### Usage Example
```tsx
<MetricCard
  icon={<Users className="w-5 h-5" />}
  title="Users"
  metrics={[
    { label: 'Total Users', value: 1 },
    { icon: <CheckCircle className="w-4 h-4" />, label: 'Active', value: 1, color: 'green' },
    { icon: <XCircle className="w-4 h-4" />, label: 'Inactive', value: 0, color: 'red' },
    { icon: <Crown className="w-4 h-4" />, label: 'Admins', value: 1, color: 'yellow' },
  ]}
  theme={theme}
/>
```

---

## 4. MetricRow Component

### Visual Design
```
✅ Active                                    1
```

### Props Interface
```typescript
interface MetricRowProps {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
  theme: string;
}
```

### Implementation
```tsx
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

---

## 5. PerformanceIndicator Component

### Visual Design
```
┌──────────────────────────────────┐
│        ┌─────┐                   │
│        │  🎯 │                   │
│        └─────┘                   │
│                                  │
│          9                       │
│   Total Executions               │
│                                  │
└──────────────────────────────────┘
```

### Props Interface
```typescript
interface PerformanceIndicatorProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  theme: string;
}
```

### Implementation
```tsx
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
    <div className="flex flex-col items-center gap-3 p-6 border rounded-xl">
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

### Usage Example
```tsx
<PerformanceIndicator
  icon={<Target className="w-6 h-6" />}
  value={9}
  label="Total Executions"
  color="blue"
  theme={theme}
/>

<PerformanceIndicator
  icon={<CheckCircle className="w-6 h-6" />}
  value="89%"
  label="Success Rate"
  color="green"
  theme={theme}
/>
```

---

## 6. TopPerformersTable Component

### Visual Design
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Top Performers                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ [Tools] [Resources] [Prompts] [Servers]                                │
├──────┬──────────────────┬────────────┬──────────────┬─────────────────┤
│ RANK │ NAME             │ EXECUTIONS │ AVG RESPONSE │ SUCCESS RATE    │
│      │                  │            │ TIME         │                 │
├──────┼──────────────────┼────────────┼──────────────┼─────────────────┤
│  1   │ test-tool        │     1      │    1ms       │      0%         │
└──────┴──────────────────┴────────────┴──────────────┴─────────────────┘
```

### Props Interface
```typescript
interface TopPerformersTableProps {
  data: Array<{
    rank: number;
    name: string;
    executions: number;
    avgResponseTime: number | string;
    successRate: number;
    lastUsed: string;
  }>;
  type: 'tools' | 'resources' | 'prompts' | 'servers';
  onTypeChange: (type: string) => void;
  theme: string;
}
```

### Implementation
```tsx
export function TopPerformersTable({ data, type, onTypeChange, theme }: TopPerformersTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('executions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn as keyof typeof a];
      const bVal = b[sortColumn as keyof typeof b];
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [data, sortColumn, sortDirection]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Top Performers
        </h3>
      </div>

      <Tabs value={type} onValueChange={onTypeChange}>
        <TabsList>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
        </TabsList>

        <TabsContent value={type}>
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
              {sortedData.map((item) => (
                <TableRow key={item.rank}>
                  <TableCell>
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {item.rank}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.executions}</TableCell>
                  <TableCell className="text-right">{item.avgResponseTime}</TableCell>
                  <TableCell className="text-right">
                    <span className={item.successRate === 0 ? 'text-red-600' : 'text-green-600'}>
                      {item.successRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {item.lastUsed}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Tab Content Layouts

### Overview Tab Layout
```tsx
<TabsContent value="overview" className="space-y-6">
  {/* Summary Cards Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard {...userStats} />
    <StatCard {...teamStats} />
    <StatCard {...resourceStats} />
    <StatCard {...metricsStats} />
  </div>

  {/* Performance Indicators Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <PerformanceIndicator {...executionsIndicator} />
    <PerformanceIndicator {...successRateIndicator} />
    <PerformanceIndicator {...responseTimeIndicator} />
    <PerformanceIndicator {...errorRateIndicator} />
  </div>

  {/* Top Performers Section */}
  <TopPerformersTable {...topPerformersProps} />
</TabsContent>
```

### Users & Teams Tab Layout
```tsx
<TabsContent value="users-teams" className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <MetricCard
      icon={<Users className="w-5 h-5" />}
      title="Users"
      metrics={usersMetrics}
      theme={theme}
    />
    <MetricCard
      icon={<Users className="w-5 h-5" />}
      title="Teams"
      metrics={teamsMetrics}
      theme={theme}
    />
  </div>
</TabsContent>
```

### MCP Resources Tab Layout
```tsx
<TabsContent value="mcp-resources" className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <MetricCard icon={<Server />} title="Virtual Servers" metrics={[...]} />
    <MetricCard icon={<Globe />} title="Gateway Peers" metrics={[...]} />
    <MetricCard icon={<Wrench />} title="Tools" metrics={[...]} />
    <MetricCard icon={<BookOpen />} title="Resources" metrics={[...]} />
    <MetricCard icon={<MessageSquare />} title="Prompts" metrics={[...]} />
    <MetricCard icon={<Bot />} title="A2A Agents" metrics={[...]} />
  </div>
</TabsContent>
```

### Activity Tab Layout
```tsx
<TabsContent value="activity" className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <MetricCard title="Tools Metrics" metrics={toolsActivityMetrics} />
    <MetricCard title="Resources Metrics" metrics={resourcesActivityMetrics} />
    <MetricCard title="Prompts Metrics" metrics={promptsActivityMetrics} />
    <MetricCard title="Servers Metrics" metrics={serversActivityMetrics} />
  </div>
</TabsContent>
```

### Security Tab Layout
```tsx
<TabsContent value="security" className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <MetricCard
      icon={<Lock className="w-5 h-5" />}
      title="Audit & Events"
      metrics={auditMetrics}
      theme={theme}
    />
    <MetricCard
      icon={<Settings className="w-5 h-5" />}
      title="Workflow State"
      metrics={workflowMetrics}
      theme={theme}
    />
  </div>
</TabsContent>
```

---

## Responsive Breakpoints

### Mobile (< 768px)
- Single column layout for all cards
- Stack performance indicators vertically
- Simplified table view with horizontal scroll

### Tablet (768px - 1024px)
- 2-column grid for most cards
- 2-column performance indicators
- Full table view

### Desktop (> 1024px)
- 4-column grid for summary cards
- 3-column grid for resource cards
- 4-column performance indicators
- Full table with all columns

---

## Color Reference

### Stat Card Colors
```typescript
const statCardColors = {
  blue: {
    light: 'bg-blue-100 border-blue-200',
    dark: 'dark:bg-blue-950 dark:border-blue-900',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  purple: {
    light: 'bg-purple-100 border-purple-200',
    dark: 'dark:bg-purple-950 dark:border-purple-900',
    icon: 'text-purple-600 dark:text-purple-400'
  },
  green: {
    light: 'bg-green-100 border-green-200',
    dark: 'dark:bg-green-950 dark:border-green-900',
    icon: 'text-green-600 dark:text-green-400'
  },
  orange: {
    light: 'bg-orange-100 border-orange-200',
    dark: 'dark:bg-orange-950 dark:border-orange-900',
    icon: 'text-orange-600 dark:text-orange-400'
  }
};
```

### Status Colors
```typescript
const statusColors = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400'
};
```

---

## Animation & Transitions

### Loading States
```tsx
// Skeleton loader for cards
<Card className="animate-pulse">
  <CardContent className="p-6">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
  </CardContent>
</Card>
```

### Refresh Animation
```tsx
// Spinning refresh icon
<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
```

### Fade In
```tsx
// Fade in new data
<div className="animate-in fade-in duration-300">
  {/* Content */}
</div>
```

---

## Export Button Styling

```tsx
<Button
  onClick={handleExport}
  variant="default"
  className="gap-2"
>
  <Download className="w-4 h-4" />
  Export Metrics
</Button>
```

Position: Bottom of Overview tab, below Top Performers table

---

## Error States

### Error Card
```tsx
<Card className="border-red-200 dark:border-red-900">
  <CardContent className="p-6">
    <div className="flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      <div>
        <p className="font-medium text-red-900 dark:text-red-100">
          Failed to load metrics
        </p>
        <p className="text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      </div>
    </div>
    <Button onClick={retry} variant="outline" className="mt-4">
      Retry
    </Button>
  </CardContent>
</Card>
```

---

## Accessibility Features

### ARIA Labels
```tsx
<div role="region" aria-label="System Metrics Dashboard">
  <Tabs aria-label="Metrics categories">
    <TabsList aria-label="Select metric category">
      <TabsTrigger value="overview" aria-label="Overview metrics">
        Overview
      </TabsTrigger>
    </TabsList>
  </Tabs>
</div>
```

### Live Regions
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  Last updated: {lastRefresh.toLocaleTimeString()}
</div>
```

### Keyboard Navigation
- Tab: Navigate between interactive elements
- Arrow keys: Navigate between tabs
- Enter/Space: Activate buttons and tabs
- Escape: Close modals/dropdowns

---

## Performance Optimizations

### Memoized Components
```tsx
const MemoizedStatCard = React.memo(StatCard);
const MemoizedMetricCard = React.memo(MetricCard);
const MemoizedPerformanceIndicator = React.memo(PerformanceIndicator);
```

### Lazy Loading
```tsx
const TopPerformersTable = lazy(() => import('./TopPerformersTable'));
```

### Virtual Scrolling
For large tables with 100+ rows, implement virtual scrolling using `react-virtual`

---

This specification provides all the details needed to implement the metrics dashboard components with consistent styling and behavior.