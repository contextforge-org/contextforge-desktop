import { BrowserWindow, shell } from 'electron';
import { URL } from 'url';
import * as http from 'http';
import * as net from 'net';

/**
 * OAuth Handler for Electron
 * Manages OAuth 2.0 flows including Authorization Code and Client Credentials
 * Supports native browser-based OAuth flow with local callback server
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

export interface NativeOAuthResult {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
}

// Track active OAuth flows and their callback servers
const activeOAuthFlows: Map<string, {
  server: http.Server;
  port: number;
  state: string;
  resolve: (result: NativeOAuthResult) => void;
  reject: (error: Error) => void;
  timeoutId: NodeJS.Timeout;
}> = new Map();

/**
 * Default OAuth callback port - use a fixed port so users can pre-register the redirect URI
 */
export const OAUTH_CALLBACK_PORT = 54932;
export const OAUTH_REDIRECT_URI = `http://127.0.0.1:${OAUTH_CALLBACK_PORT}/oauth/callback`;

/**
 * Find an available port for the OAuth callback server
 * Prefers the default port, falls back to range if in use
 */
async function findAvailablePort(startPort = OAUTH_CALLBACK_PORT, endPort = 54999): Promise<number> {
  for (let port = startPort; port <= endPort; port++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const server = net.createServer();
        server.listen(port, '127.0.0.1');
        server.once('listening', () => {
          server.close();
          resolve();
        });
        server.once('error', reject);
      });
      return port;
    } catch {
      // Port is in use, try next one
      continue;
    }
  }
  throw new Error('No available ports found for OAuth callback server');
}

/**
 * Generate OAuth authorization URL with state
 */
export function generateAuthorizationUrl(config: OAuthConfig, state?: string): string {
  if (!config.auth_url) {
    throw new Error('Authorization URL is required for authorization code flow');
  }

  console.log('[generateAuthorizationUrl] Config:', {
    auth_url: config.auth_url,
    client_id: config.client_id ? '***' : undefined,
    redirect_uri: config.redirect_uri,
    scopes: config.scopes,
  });

  const url = new URL(config.auth_url);
  url.searchParams.set('client_id', config.client_id);
  url.searchParams.set('response_type', 'code');
  
  if (config.redirect_uri) {
    url.searchParams.set('redirect_uri', config.redirect_uri);
  } else {
    console.warn('[generateAuthorizationUrl] WARNING: No redirect_uri provided!');
  }
  
  if (config.scopes && config.scopes.length > 0) {
    url.searchParams.set('scope', config.scopes.join(' '));
  }
  
  // Add state parameter for CSRF protection
  url.searchParams.set('state', state || generateRandomState());
  
  const finalUrl = url.toString();
  console.log('[generateAuthorizationUrl] Final URL:', finalUrl);
  
  return finalUrl;
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
 * Perform native OAuth Authorization Code flow with local callback server
 * This starts a local HTTP server to receive the OAuth callback, opens the browser
 * to the authorization URL, and exchanges the code for tokens automatically.
 * 
 * @param config OAuth configuration
 * @param timeoutMs Timeout in milliseconds (default 5 minutes)
 * @returns Promise with the OAuth result including tokens
 */
export async function performNativeOAuthFlow(
  config: OAuthConfig,
  timeoutMs = 300000
): Promise<NativeOAuthResult> {
  console.log('[performNativeOAuthFlow] Starting with config:', {
    grant_type: config.grant_type,
    client_id: config.client_id ? '***' : undefined,
    client_secret: config.client_secret ? '***' : undefined,
    token_url: config.token_url,
    auth_url: config.auth_url,
    scopes: config.scopes,
    redirect_uri: config.redirect_uri,
  });
  
  if (!config.auth_url) {
    return {
      success: false,
      error: 'Authorization URL is required for authorization code flow'
    };
  }

  // Generate unique flow ID and state
  const flowId = generateRandomState();
  const state = generateRandomState();

  // Find an available port
  const port = await findAvailablePort();
  const redirectUri = `http://127.0.0.1:${port}/oauth/callback`;

  // Override the config redirect_uri with our local one
  const flowConfig = {
    ...config,
    redirect_uri: redirectUri
  };

  console.log('[performNativeOAuthFlow] Using redirect_uri:', redirectUri);

  return new Promise((resolve) => {
    // Create the callback server
    const server = http.createServer(async (req, res) => {
      if (!req.url) {
        res.writeHead(400);
        res.end('Bad Request');
        return;
      }

      const url = new URL(req.url, `http://127.0.0.1:${port}`);
      
      // Only handle the callback path
      if (url.pathname !== '/oauth/callback') {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const receivedState = url.searchParams.get('state');
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');

      // Verify state
      if (receivedState !== state) {
        const errorHtml = createOAuthResultHtml(false, 'State mismatch - possible CSRF attack');
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(errorHtml);
        cleanup(flowId);
        resolve({
          success: false,
          error: 'State mismatch - possible CSRF attack'
        });
        return;
      }

      if (error) {
        const errorMsg = errorDescription || error;
        const errorHtml = createOAuthResultHtml(false, errorMsg);
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(errorHtml);
        cleanup(flowId);
        resolve({
          success: false,
          error: errorMsg
        });
        return;
      }

      if (!code) {
        const errorHtml = createOAuthResultHtml(false, 'No authorization code received');
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(errorHtml);
        cleanup(flowId);
        resolve({
          success: false,
          error: 'No authorization code received'
        });
        return;
      }

      try {
        // Exchange code for tokens
        const tokenResponse = await exchangeAuthorizationCode(code, flowConfig);
        
        const successHtml = createOAuthResultHtml(true);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(successHtml);
        cleanup(flowId);
        resolve({
          success: true,
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_in: tokenResponse.expires_in,
          token_type: tokenResponse.token_type,
          scope: tokenResponse.scope
        });
      } catch (exchangeError) {
        const errorMsg = exchangeError instanceof Error ? exchangeError.message : 'Token exchange failed';
        const errorHtml = createOAuthResultHtml(false, errorMsg);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(errorHtml);
        cleanup(flowId);
        resolve({
          success: false,
          error: errorMsg
        });
      }
    });

    // Handle server errors
    server.on('error', (err) => {
      cleanup(flowId);
      resolve({
        success: false,
        error: `Callback server error: ${err.message}`
      });
    });

    // Start listening
    server.listen(port, '127.0.0.1', () => {
      console.log(`OAuth callback server listening on port ${port}`);
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        cleanup(flowId);
        resolve({
          success: false,
          error: 'OAuth flow timed out'
        });
      }, timeoutMs);

      // Store the flow
      activeOAuthFlows.set(flowId, {
        server,
        port,
        state,
        resolve: () => {}, // Not used in this implementation
        reject: () => {},  // Not used in this implementation
        timeoutId
      });

      // Generate auth URL and open in browser
      const authUrl = generateAuthorizationUrl(flowConfig, state);
      shell.openExternal(authUrl);
    });
  });
}

/**
 * Cancel an active OAuth flow
 */
export function cancelOAuthFlow(flowId: string): boolean {
  return cleanup(flowId);
}

/**
 * Get the list of active OAuth flow IDs
 */
export function getActiveOAuthFlows(): string[] {
  return Array.from(activeOAuthFlows.keys());
}

/**
 * Clean up an OAuth flow
 */
function cleanup(flowId: string): boolean {
  const flow = activeOAuthFlows.get(flowId);
  if (flow) {
    clearTimeout(flow.timeoutId);
    flow.server.close();
    activeOAuthFlows.delete(flowId);
    console.log(`OAuth flow ${flowId} cleaned up`);
    return true;
  }
  return false;
}

/**
 * Create HTML page to show OAuth result
 */
function createOAuthResultHtml(success: boolean, errorMessage?: string): string {
  if (success) {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Authorization Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 { margin: 0 0 10px; }
    p { margin: 0; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✓</div>
    <h1>Authorization Successful!</h1>
    <p>You can close this window and return to ContextForge.</p>
  </div>
  <script>setTimeout(() => window.close(), 3000);</script>
</body>
</html>`;
  } else {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Authorization Failed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      max-width: 500px;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 { margin: 0 0 10px; }
    p { margin: 0; opacity: 0.9; }
    .error { margin-top: 15px; font-size: 14px; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✗</div>
    <h1>Authorization Failed</h1>
    <p>Please close this window and try again.</p>
    <p class="error">${errorMessage || 'Unknown error occurred'}</p>
  </div>
</body>
</html>`;
  }
}

/**
 * Open OAuth authorization URL in system browser and listen for callback
 * @deprecated Use performNativeOAuthFlow instead for a complete OAuth flow
 * Returns a promise that resolves with the authorization code
 */
export async function authorizeWithBrowser(
  config: OAuthConfig,
  _mainWindow: BrowserWindow
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
    callbackWindow.webContents.on('will-navigate', (_event, url) => {
      handleCallback(url);
    });

    callbackWindow.webContents.on('did-navigate', (_event, url) => {
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