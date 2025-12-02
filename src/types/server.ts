export interface OAuthConfig {
  grant_type: 'authorization_code' | 'client_credentials';
  client_id: string;
  client_secret: string;
  token_url: string;
  auth_url?: string;
  redirect_uri?: string;
  scopes: string[];
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
}

export interface AuthHeader {
  key: string;
  value: string;
}

export type MCPServer = {
  id: string; // Changed from number to string to match API
  name: string;
  logoUrl: string;
  url: string;
  description: string;
  tags: string[];
  active: boolean;
  lastSeen: string;
  team: string;
  teamId?: string | null;
  visibility: 'public' | 'team' | 'private';
  transportType: string;
  authenticationType: string;
  passthroughHeaders: string[];
  // Authentication fields
  authToken?: string;
  authUsername?: string;
  authPassword?: string;
  authHeaders?: AuthHeader[];
  oauthConfig?: OAuthConfig | null;
  associatedTools?: string[];
  associatedResources?: string[];
  associatedPrompts?: string[];
};


