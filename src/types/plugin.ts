/**
 * Plugin types for Context Forge
 * Based on the backend API plugin types
 */

export interface PluginSummary {
  name: string;
  description?: string | null;
  author?: string | null;
  version?: string | null;
  mode?: string | null;
  priority?: number | null;
  hooks?: string[] | null;
  tags?: string[] | null;
  status?: string | null;
  config_summary?: string | Record<string, unknown> | null;
}

export interface PluginDetail {
  name: string;
  description?: string | null;
  author?: string | null;
  version?: string | null;
  mode?: string | null;
  priority?: number | null;
  hooks?: string[] | null;
  tags?: string[] | null;
  status?: string | null;
  config_summary?: string | Record<string, unknown> | null;
  plugin_type?: string | null;
  namespace?: string | null;
  conditions?: Record<string, unknown> | null;
  config?: Record<string, unknown> | null;
  manifest?: Record<string, unknown> | null;
}

export interface PluginListResponse {
  plugins: PluginSummary[];
  total: number;
  enabled: number;
  disabled: number;
}

export interface PluginStatsResponse {
  total_plugins: number;
  enabled_plugins: number;
  disabled_plugins: number;
  plugins_by_hook?: Record<string, number>;
  plugins_by_mode?: Record<string, number>;
}

export interface PluginFilters {
  status?: 'enabled' | 'disabled' | null;
  mode?: string | null;
  hook?: string | null;
  tag?: string | null;
}

// Made with Bob
