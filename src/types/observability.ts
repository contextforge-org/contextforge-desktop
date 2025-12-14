/**
 * Observability and Tracing Types
 * 
 * Types for working with distributed tracing and observability data
 */

export interface TraceSpan {
  span_id: string;
  trace_id: string;
  parent_span_id?: string | null;
  name: string;
  start_time: string;
  end_time: string;
  duration_ms: number;
  status: 'ok' | 'error';
  attributes: Record<string, any>;
  events?: TraceEvent[];
  links?: TraceLink[];
}

export interface TraceEvent {
  timestamp: string;
  name: string;
  attributes: Record<string, any>;
}

export interface TraceLink {
  trace_id: string;
  span_id: string;
  attributes: Record<string, any>;
}

export interface Trace {
  trace_id: string;
  name: string;
  start_time: string;
  end_time: string;
  duration_ms: number;
  status: 'ok' | 'error';
  http_method?: string;
  http_status_code?: number;
  user_email?: string;
  tool_name?: string;
  spans: TraceSpan[];
  root_span?: TraceSpan;
  error_message?: string;
  attributes: Record<string, any>;
}

export interface ObservabilityStats {
  total_traces: number;
  total_spans: number;
  error_count: number;
  avg_duration_ms: number;
  p50_duration_ms: number;
  p95_duration_ms: number;
  p99_duration_ms: number;
  traces_per_minute: number;
  error_rate: number;
}

export interface TraceFilters {
  time_range?: '1h' | '6h' | '24h' | '7d' | '30d';
  status_filter?: 'all' | 'ok' | 'error';
  limit?: number;
  min_duration?: number;
  max_duration?: number;
  http_method?: string;
  user_email?: string;
  name_search?: string;
  attribute_search?: string;
  tool_name?: string;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface TimeSeriesMetric {
  name: string;
  data: MetricDataPoint[];
  unit?: string;
}

export interface TopPerformer {
  name: string;
  count: number;
  avg_duration_ms: number;
  error_rate: number;
  p95_duration_ms: number;
}

export interface HeatmapData {
  x: string; // time bucket
  y: string; // duration bucket
  value: number; // count
}

export interface ToolUsageMetric {
  tool_name: string;
  invocation_count: number;
  success_count: number;
  error_count: number;
  avg_duration_ms: number;
  p95_duration_ms: number;
  last_used: string;
}

export interface ToolChainMetric {
  tools: string[];
  count: number;
  avg_duration_ms: number;
  success_rate: number;
}

export interface SavedQuery {
  id: string;
  name: string;
  description?: string;
  filters: TraceFilters;
  created_at: string;
  updated_at: string;
  use_count: number;
}

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';
export type StatusFilter = 'all' | 'ok' | 'error';

// Made with Bob
