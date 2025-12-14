import { useState } from 'react';
import { useTraces, useObservabilityStats } from '../hooks/useObservability';
import { TraceFilters, Trace } from '../types/observability';
import { PageHeader } from './common';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Activity, Clock, AlertCircle, CheckCircle, Filter, Search, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function TracingPage() {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<TraceFilters>({
    time_range: '24h',
    status_filter: 'all',
    limit: 50,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  const { traces, isLoading: tracesLoading, refetch: refetchTraces } = useTraces(filters);
  const { stats, isLoading: statsLoading } = useObservabilityStats(filters.time_range);

  const filteredTraces = (Array.isArray(traces) ? traces : []).filter(trace => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      trace.name?.toLowerCase().includes(search) ||
      trace.trace_id?.toLowerCase().includes(search) ||
      trace.user_email?.toLowerCase().includes(search) ||
      trace.tool_name?.toLowerCase().includes(search)
    );
  });

  const updateFilter = (key: keyof TraceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      time_range: '24h',
      status_filter: 'all',
      limit: 50,
    });
    setSearchTerm('');
  };

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <PageHeader
        title="Request Tracing"
        description="Monitor and analyze distributed traces across your system"
        theme={theme}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Traces</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.total_traces?.toLocaleString() || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.avg_duration_ms?.toFixed(0) || 0}ms</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-red-500">
                  {((stats?.error_rate || 0) * 100).toFixed(1)}%
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">P95 Latency</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats?.p95_duration_ms?.toFixed(0) || 0}ms</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <CardTitle className="text-base">Filters</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <Select value={filters.time_range} onValueChange={(value) => updateFilter('time_range', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status_filter} onValueChange={(value) => updateFilter('status_filter', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="ok">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Min Duration (ms)</label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={filters.min_duration || ''}
                  onChange={(e) => updateFilter('min_duration', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search traces..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traces List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Traces</CardTitle>
                <CardDescription>
                  {filteredTraces.length} trace{filteredTraces.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchTraces()}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tracesLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredTraces.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No traces found</p>
                <p className="text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTraces.map((trace) => (
                  <div
                    key={trace.trace_id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTrace?.trace_id === trace.trace_id
                        ? theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-300'
                        : theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTrace(trace)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {trace.status === 'ok' ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                          <span className="font-medium truncate">{trace.name || 'Unnamed Trace'}</span>
                          {trace.http_method && (
                            <Badge variant="outline" className="text-xs">
                              {trace.http_method}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {trace.duration_ms?.toFixed(0)}ms
                          </span>
                          {trace.user_email && (
                            <span className="truncate">{trace.user_email}</span>
                          )}
                          {trace.tool_name && (
                            <Badge variant="secondary" className="text-xs">
                              {trace.tool_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4 flex-shrink-0">
                        {new Date(trace.start_time).toLocaleString()}
                      </div>
                    </div>
                    {trace.error_message && (
                      <div className="mt-2 text-sm text-red-500 truncate">
                        Error: {trace.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trace Detail */}
        {selectedTrace && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Trace Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTrace(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Trace ID</div>
                    <div className="font-mono text-sm mt-1">{selectedTrace.trace_id}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Duration</div>
                    <div className="text-sm mt-1">{selectedTrace.duration_ms?.toFixed(2)}ms</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="mt-1">
                      <Badge variant={selectedTrace.status === 'ok' ? 'default' : 'destructive'}>
                        {selectedTrace.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Spans</div>
                    <div className="text-sm mt-1">{selectedTrace.spans?.length || 0}</div>
                  </div>
                </div>

                {selectedTrace.spans && selectedTrace.spans.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Spans</div>
                    <div className="space-y-2">
                      {selectedTrace.spans.map((span, idx) => (
                        <div
                          key={span.span_id || idx}
                          className={`p-3 rounded border ${
                            theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{span.name}</span>
                            <span className="text-xs text-muted-foreground">{span.duration_ms?.toFixed(2)}ms</span>
                          </div>
                          {span.attributes && Object.keys(span.attributes).length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {Object.entries(span.attributes).slice(0, 3).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-mono">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Made with Bob
