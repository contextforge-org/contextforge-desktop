// Catalog server types based on the generated API client

export interface CatalogServer {
  id: string;
  name: string;
  category: string;
  url: string;
  auth_type: string;
  provider: string;
  description: string;
  requires_api_key?: boolean;
  secure?: boolean;
  tags?: string[];
  transport?: string | null;
  logo_url?: string | null;
  documentation_url?: string | null;
  is_registered?: boolean;
  is_available?: boolean;
}

export interface CatalogListResponse {
  servers: CatalogServer[];
  total: number;
  page: number;
  page_size: number;
  categories: string[];
  providers: string[];
}

export interface CatalogServerRegisterRequest {
  server_id: string;
  custom_name?: string | null;
  custom_config?: Record<string, unknown> | null;
  team_id?: string | null;
}

export interface CatalogServerRegisterResponse {
  success: boolean;
  message: string;
  gateway_id?: string;
}

export interface CatalogServerStatusResponse {
  server_id: string;
  is_available: boolean;
  last_checked?: string | null;
  error_message?: string | null;
}

export interface CatalogBulkRegisterRequest {
  server_ids: string[];
  team_id?: string | null;
}

export interface CatalogBulkRegisterResponse {
  success: boolean;
  registered: string[];
  failed: string[];
  errors: Record<string, string>;
}

export interface CatalogFilters {
  category?: string;
  provider?: string;
  auth_type?: string;
  search?: string;
  tags?: string[];
  show_registered?: boolean;
}

// Made with Bob
