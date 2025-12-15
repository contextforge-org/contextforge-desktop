import { net } from 'electron';

/**
 * Fetch-compatible adapter for Electron's net module
 * Allows generated client to work in main process
 * 
 * This adapter bridges the gap between the browser's fetch API
 * (which the generated client expects) and Electron's net.request API
 * (which is available in the main process).
 */
export function createElectronFetchAdapter(): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Handle Request object vs URL/string
    let url: string;
    let method: string;
    let headers: Headers;
    let body: any;
    
    if (input instanceof Request) {
      // Extract from Request object
      url = input.url;
      method = input.method.toUpperCase();
      headers = new Headers(input.headers);
      // Get body from Request if it exists
      body = await input.text().catch((): null => null);
    } else {
      // Extract from init options
      url = input.toString();
      method = (init?.method || 'GET').toUpperCase();
      headers = new Headers(init?.headers);
      body = init?.body;
    }
    
    return new Promise((resolve, reject) => {
      const request = net.request({
        method,
        url,
      });
      
      // Set headers
      headers.forEach((value, key) => {
        request.setHeader(key, value);
      });
      
      let responseData = '';
      let statusCode = 0;
      let statusMessage = '';
      let responseHeaders: Record<string, string | string[]> = {};
      
      request.on('response', (response) => {
        statusCode = response.statusCode;
        statusMessage = response.statusMessage;
        responseHeaders = response.headers;
        
        response.on('data', (chunk) => {
          responseData += chunk.toString();
        });
        
        response.on('end', () => {
          // Convert Electron headers to fetch Headers format
          const fetchHeaders = new Headers();
          Object.entries(responseHeaders).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach(v => fetchHeaders.append(key, v));
            } else {
              fetchHeaders.set(key, value);
            }
          });
          
          // Create fetch-compatible Response
          // 204 No Content responses must not have a body
          const body = statusCode === 204 ? null : responseData;
          const fetchResponse = new Response(body, {
            status: statusCode,
            statusText: statusMessage || getStatusText(statusCode),
            headers: fetchHeaders,
          });
          
          resolve(fetchResponse);
        });
        
        response.on('error', (error) => {
          reject(new Error(`Response error: ${error.message}`));
        });
      });
      
      request.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });
      
      request.on('abort', () => {
        reject(new Error('Request aborted'));
      });
      
      // Send body if present
      if (body) {
        if (typeof body === 'string') {
          request.write(body);
        } else if (body instanceof Buffer) {
          request.write(body);
        } else {
          // For other body types, convert to string
          request.write(String(body));
        }
      }
      
      request.end();
    });
  };
}

/**
 * Get standard HTTP status text for a status code
 */
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statusTexts[status] || 'Unknown';
}
