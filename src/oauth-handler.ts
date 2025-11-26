import { BrowserWindow, shell } from 'electron';
import { URL } from 'url';

/**
 * OAuth Handler for Electron
 * Manages OAuth 2.0 flows including Authorization Code and Client Credentials
 */

interface OAuthConfig {
  grant_type: string;
  client_id: string;
  client_secret: string;
  token_url: string;
  auth_url?: string;
  scopes?: string[];
  redirect_uri?: string;
}

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * Generate OAuth authorization URL
 */
export function generateAuthorizationUrl(config: OAuthConfig): string {
  if (!config.auth_url) {
    throw new Error('Authorization URL is required for authorization code flow');
  }

  const url = new URL(config.auth_url);
  url.searchParams.set('client_id', config.client_id);
  url.searchParams.set('response_type', 'code');
  
  if (config.redirect_uri) {
    url.searchParams.set('redirect_uri', config.redirect_uri);
  }
  
  if (config.scopes && config.scopes.length > 0) {
    url.searchParams.set('scope', config.scopes.join(' '));
  }
  
  // Add state parameter for CSRF protection
  const state = generateRandomState();
  url.searchParams.set('state', state);
  
  return url.toString();
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeAuthorizationCode(
  code: string,
  config: OAuthConfig
): Promise<OAuthTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.client_id,
    client_secret: config.client_secret,
  });

  if (config.redirect_uri) {
    body.set('redirect_uri', config.redirect_uri);
  }

  const response = await fetch(config.token_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Get access token using client credentials flow
 */
export async function getClientCredentialsToken(
  config: OAuthConfig
): Promise<OAuthTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.client_id,
    client_secret: config.client_secret,
  });

  if (config.scopes && config.scopes.length > 0) {
    body.set('scope', config.scopes.join(' '));
  }

  const response = await fetch(config.token_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token request failed: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Refresh an access token using a refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  config: OAuthConfig
): Promise<OAuthTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.client_id,
    client_secret: config.client_secret,
  });

  const response = await fetch(config.token_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Open OAuth authorization URL in system browser and listen for callback
 * Returns a promise that resolves with the authorization code
 */
export async function authorizeWithBrowser(
  config: OAuthConfig,
  mainWindow: BrowserWindow
): Promise<string> {
  return new Promise((resolve, reject) => {
    const authUrl = generateAuthorizationUrl(config);
    
    // Open in system browser
    shell.openExternal(authUrl);
    
    // Create a simple HTTP server to listen for the callback
    // This is a simplified version - in production you'd want a proper server
    const callbackWindow = new BrowserWindow({
      width: 600,
      height: 800,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Listen for navigation events
    callbackWindow.webContents.on('will-navigate', (event, url) => {
      handleCallback(url);
    });

    callbackWindow.webContents.on('did-navigate', (event, url) => {
      handleCallback(url);
    });

    function handleCallback(url: string) {
      const urlObj = new URL(url);
      
      // Check if this is our callback URL
      if (config.redirect_uri && url.startsWith(config.redirect_uri)) {
        const code = urlObj.searchParams.get('code');
        const error = urlObj.searchParams.get('error');
        
        callbackWindow.close();
        
        if (error) {
          reject(new Error(`OAuth error: ${error}`));
        } else if (code) {
          resolve(code);
        } else {
          reject(new Error('No authorization code received'));
        }
      }
    }

    // Handle window close
    callbackWindow.on('closed', () => {
      reject(new Error('Authorization window was closed'));
    });

    // Show the window after a short delay
    setTimeout(() => {
      callbackWindow.show();
    }, 100);
  });
}

/**
 * Generate a random state parameter for CSRF protection
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Token storage manager
 * Stores OAuth tokens securely in Electron's safeStorage
 */
export class TokenStorage {
  private tokens: Map<string, OAuthTokenResponse> = new Map();

  /**
   * Store a token for an agent
   */
  setToken(agentId: string, token: OAuthTokenResponse): void {
    this.tokens.set(agentId, token);
    
    // In production, you'd want to persist this securely
    // using Electron's safeStorage API
  }

  /**
   * Get a token for an agent
   */
  getToken(agentId: string): OAuthTokenResponse | null {
    return this.tokens.get(agentId) || null;
  }

  /**
   * Remove a token for an agent
   */
  removeToken(agentId: string): void {
    this.tokens.delete(agentId);
  }

  /**
   * Check if a token is expired
   */
  isTokenExpired(token: OAuthTokenResponse): boolean {
    if (!token.expires_in) {
      return false; // No expiry info, assume valid
    }
    
    // This is simplified - in production you'd want to track when the token was issued
    // and calculate expiry based on that
    return false;
  }

  /**
   * Get a valid token, refreshing if necessary
   */
  async getValidToken(
    agentId: string,
    config: OAuthConfig
  ): Promise<OAuthTokenResponse | null> {
    const token = this.getToken(agentId);
    
    if (!token) {
      return null;
    }
    
    if (this.isTokenExpired(token) && token.refresh_token) {
      try {
        const newToken = await refreshAccessToken(token.refresh_token, config);
        this.setToken(agentId, newToken);
        return newToken;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        this.removeToken(agentId);
        return null;
      }
    }
    
    return token;
  }
}

// Export a singleton instance
export const tokenStorage = new TokenStorage();