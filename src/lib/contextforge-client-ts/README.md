# ContextForge TypeScript Client

Auto-generated TypeScript client for the ContextForge API, built with [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts).

## Overview

This client provides type-safe access to the ContextForge API, which manages MCP (Model Context Protocol) servers, tools, prompts, resources, and more. The client is automatically generated from the OpenAPI specification and includes full TypeScript type definitions.

## Installation

The client is already included in this project at `src/lib/contextforge-client-ts/`. No additional installation is required.

## Quick Start

### Basic Usage

```typescript
import { client } from './lib/contextforge-client-ts';

// Configure the client with your base URL
client.setConfig({
  baseUrl: 'https://your-contextforge-instance.com'
});

// Make API calls
const servers = await client.get('/servers');
```

### Using Individual SDK Functions

```typescript
import { 
  listServersServersGet,
  createServerServersPost,
  getServerServersServerIdGet 
} from './lib/contextforge-client-ts';

// List all servers
const { data, error } = await listServersServersGet();

// Create a new server
const newServer = await createServerServersPost({
  body: {
    name: 'My MCP Server',
    endpoint_url: 'http://localhost:3000',
    // ... other server properties
  }
});

// Get a specific server
const server = await getServerServersServerIdGet({
  path: { server_id: 'server-123' }
});
```

## Configuration

### Client Configuration

```typescript
import { createClient, createConfig } from './lib/contextforge-client-ts/client';

// Create a custom client instance
const myClient = createClient(createConfig({
  baseUrl: 'https://api.contextforge.com',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
}));

// Use the custom client
const response = await myClient.get('/servers');
```

### Authentication

The client supports multiple authentication methods:

```typescript
// Bearer Token
client.setConfig({
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
});

// Basic Auth
client.setConfig({
  headers: {
    'Authorization': 'Basic ' + btoa('username:password')
  }
});

// Custom Headers
client.setConfig({
  headers: {
    'X-API-Key': 'YOUR_API_KEY'
  }
});
```

## API Categories

The ContextForge API is organized into several main categories:

### Servers
Manage MCP server configurations and connections.

```typescript
import { 
  listServersServersGet,
  createServerServersPost,
  updateServerServersServerIdPut,
  deleteServerServersServerIdDelete,
  toggleServerStatusServersServerIdTogglePost
} from './lib/contextforge-client-ts';

// List servers with filters
const servers = await listServersServersGet({
  query: {
    tags: ['production'],
    visibility: 'public'
  }
});

// Create a server
const newServer = await createServerServersPost({
  body: {
    name: 'Production Server',
    endpoint_url: 'https://api.example.com',
    tags: ['production'],
    visibility: 'team'
  }
});

// Toggle server status
await toggleServerStatusServersServerIdTogglePost({
  path: { server_id: 'server-123' }
});
```

### Tools
Manage tools exposed by MCP servers.

```typescript
import {
  listToolsToolsGet,
  createToolToolsPost,
  getToolToolsToolIdGet,
  updateToolToolsToolIdPut,
  deleteToolToolsToolIdDelete
} from './lib/contextforge-client-ts';

// List all tools
const tools = await listToolsToolsGet();

// Get tool details
const tool = await getToolToolsToolIdGet({
  path: { tool_id: 'tool-456' }
});
```

### Prompts
Manage prompt templates.

```typescript
import {
  listPromptsPromptsGet,
  createPromptPromptsPost,
  getPromptPromptsPromptIdPost,
  updatePromptPromptsPromptIdPut
} from './lib/contextforge-client-ts';

// List prompts
const prompts = await listPromptsPromptsGet();

// Get a prompt with arguments
const prompt = await getPromptPromptsPromptIdPost({
  path: { prompt_id: 'prompt-789' },
  body: {
    arguments: {
      variable1: 'value1',
      variable2: 'value2'
    }
  }
});
```

### Resources
Manage resources (files, data sources, etc.).

```typescript
import {
  listResourcesResourcesGet,
  createResourceResourcesPost,
  readResourceResourcesResourceIdGet,
  subscribeResourceResourcesSubscribeResourceIdPost
} from './lib/contextforge-client-ts';

// List resources
const resources = await listResourcesResourcesGet();

// Read a resource
const resource = await readResourceResourcesResourceIdGet({
  path: { resource_id: 'resource-101' }
});

// Subscribe to resource updates
await subscribeResourceResourcesSubscribeResourceIdPost({
  path: { resource_id: 'resource-101' }
});
```

### Gateways
Manage API gateways and OAuth integrations.

```typescript
import {
  listGatewaysGatewaysGet,
  registerGatewayGatewaysPost,
  updateGatewayGatewaysGatewayIdPut,
  deleteGatewayGatewaysGatewayIdDelete
} from './lib/contextforge-client-ts';

// Register a gateway
const gateway = await registerGatewayGatewaysPost({
  body: {
    name: 'GitHub Gateway',
    gateway_type: 'oauth',
    config: {
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET'
    }
  }
});
```

### Teams
Manage teams and team memberships.

```typescript
import {
  listTeamsTeamsGet,
  createTeamTeamsPost,
  getTeamTeamsTeamIdGet,
  inviteTeamMemberTeamsTeamIdInvitationsPost,
  listTeamMembersTeamsTeamIdMembersGet
} from './lib/contextforge-client-ts';

// Create a team
const team = await createTeamTeamsPost({
  body: {
    name: 'Engineering Team',
    description: 'Core engineering team',
    visibility: 'private'
  }
});

// Invite a team member
await inviteTeamMemberTeamsTeamIdInvitationsPost({
  path: { team_id: 'team-123' },
  body: {
    email: 'user@example.com',
    role: 'member'
  }
});
```

### Authentication & Authorization
User authentication and role-based access control.

```typescript
import {
  loginAuthEmailLoginPost,
  registerAuthEmailRegisterPost,
  getCurrentUserProfileAuthEmailMeGet,
  changePasswordAuthEmailChangePasswordPost
} from './lib/contextforge-client-ts';

// Login
const { data } = await loginAuthEmailLoginPost({
  body: {
    email: 'user@example.com',
    password: 'password123'
  }
});

// Get current user
const user = await getCurrentUserProfileAuthEmailMeGet();
```

### Observability
Monitor API usage, traces, and metrics.

```typescript
import {
  getObservabilityTracesAdminObservabilityTracesGet,
  getObservabilityStatsAdminObservabilityStatsGet,
  getMetricsMetricsGet
} from './lib/contextforge-client-ts';

// Get traces
const traces = await getObservabilityTracesAdminObservabilityTracesGet({
  query: {
    start_time: '2024-01-01T00:00:00Z',
    end_time: '2024-01-31T23:59:59Z'
  }
});

// Get metrics
const metrics = await getMetricsMetricsGet();
```

### Health & Status
Check system health and readiness.

```typescript
import {
  healthcheckHealthGet,
  readinessCheckReadyGet,
  versionEndpointVersionGet
} from './lib/contextforge-client-ts';

// Health check
const health = await healthcheckHealthGet();

// Readiness check
const ready = await readinessCheckReadyGet();

// Get version
const version = await versionEndpointVersionGet();
```

## Advanced Usage

### Error Handling

```typescript
import { listServersServersGet } from './lib/contextforge-client-ts';

try {
  const { data, error } = await listServersServersGet();
  
  if (error) {
    console.error('API Error:', error);
    return;
  }
  
  console.log('Servers:', data);
} catch (err) {
  console.error('Network Error:', err);
}
```

### Custom Fetch Options

```typescript
import { listServersServersGet } from './lib/contextforge-client-ts';

const servers = await listServersServersGet({
  // Custom fetch options
  signal: abortController.signal,
  cache: 'no-cache',
  // Custom headers for this request
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

### Using with React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { listServersServersGet } from './lib/contextforge-client-ts';

function ServerList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['servers'],
    queryFn: () => listServersServersGet()
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.data?.map(server => (
        <li key={server.id}>{server.name}</li>
      ))}
    </ul>
  );
}
```

### Server-Sent Events (SSE)

```typescript
import { sseEndpointServersServerIdSseGet } from './lib/contextforge-client-ts';

// Subscribe to server events
const eventSource = await sseEndpointServersServerIdSseGet({
  path: { server_id: 'server-123' }
});

// Handle events
eventSource.addEventListener('message', (event) => {
  console.log('Event:', JSON.parse(event.data));
});

// Close connection when done
eventSource.close();
```

## Type Definitions

All types are exported from the main index file:

```typescript
import type {
  A2aAgentCreate,
  ServerCreate,
  ToolCreate,
  PromptCreate,
  ResourceCreate,
  GatewayCreate,
  TeamCreate
} from './lib/contextforge-client-ts';

const serverData: ServerCreate = {
  name: 'My Server',
  endpoint_url: 'https://api.example.com',
  // TypeScript will enforce correct types
};
```

## Client Methods

The client instance provides these core methods:

- `client.get(url, options)` - GET request
- `client.post(url, options)` - POST request
- `client.put(url, options)` - PUT request
- `client.delete(url, options)` - DELETE request
- `client.patch(url, options)` - PATCH request
- `client.request(options)` - Generic request
- `client.setConfig(config)` - Update client configuration
- `client.getConfig()` - Get current configuration

## Development

This client is auto-generated. To regenerate:

1. Ensure you have the OpenAPI specification file
2. Run the code generation tool (typically `@hey-api/openapi-ts`)
3. The generated files will be placed in this directory

## File Structure

```
contextforge-client-ts/
├── index.ts              # Main entry point
├── client.gen.ts         # Client instance
├── sdk.gen.ts            # SDK functions (11k+ lines)
├── types.gen.ts          # Type definitions (17k+ lines)
├── client/               # Client implementation
│   ├── client.gen.ts
│   ├── index.ts
│   ├── types.gen.ts
│   └── utils.gen.ts
└── core/                 # Core utilities
    ├── auth.gen.ts
    ├── bodySerializer.gen.ts
    ├── params.gen.ts
    ├── pathSerializer.gen.ts
    ├── queryKeySerializer.gen.ts
    ├── serverSentEvents.gen.ts
    ├── types.gen.ts
    └── utils.gen.ts
```

## Resources

- [ContextForge Documentation](https://contextforge.dev)
- [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts)
- [OpenAPI Specification](https://swagger.io/specification/)

## License

This client is auto-generated and follows the same license as the parent project.