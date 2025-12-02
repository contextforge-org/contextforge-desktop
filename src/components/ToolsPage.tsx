import { useState, useEffect, useMemo } from 'react';
import { Search, MoreVertical, X, Filter, Pencil, Power, Copy, Trash2, ChevronDown, Wrench, Loader2, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { FilterCategory } from './FilterCategory';
import { BulkImportForm } from './BulkImportForm';
import { RightSidePanel } from './RightSidePanel';
import { toast } from '../lib/toastWithTray';
import { PageHeader, DataTableToolbar } from './common';
import * as api from '../lib/api/contextforge-api-ipc';
import {
  parseInputSchema,
  processInputParameters,
  parsePassthroughHeaders,
  validateFieldValue,
  type ParsedField,
} from '../lib/toolTestUtils';
import { ToolTestFormField } from './ToolTestFormField';

// Helper function to get consistent tag colors
const getTagColor = (tag: string, theme: string): { bg: string; text: string; border: string } => {
  const darkColors = [
    { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
    { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
    { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/40' },
    { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/40' },
    { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
  ];
  
  const lightColors = [
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
    { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  ];
  
  const colors = theme === 'dark' ? darkColors : lightColors;
  
  // Simple hash function for consistent color assignment
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index]!;
};

interface Tool {
  id: number;
  gatewayName: string;
  name: string;
  displayName?: string;
  url: string;
  type: string;
  requestMethod: string;
  description: string;
  annotations: string[];
  tags: string[];
  owner: string;
  team: string;
  teamId?: string | null;
  visibility: 'public' | 'team' | 'private';
  integrationType: string;
  headers: string;
  inputSchema: string;
  outputSchema: string;
  jsonPathFilter: string;
  authenticationType: string;
  active: boolean;
}

const sampleTools: Tool[] = [
  {
    id: 1,
    gatewayName: 'Azure DevOps',
    name: 'create_work_item',
    displayName: 'Create Work Item',
    url: 'https://dev.azure.com/org/project/_apis/wit/workitems',
    type: 'REST',
    requestMethod: 'POST',
    description: 'Creates a new work item in Azure DevOps',
    annotations: ['Up River Only'],
    tags: ['devops', 'azure', 'work-management'],
    owner: 'john.doe@example.com',
    team: 'DevOps Team',
    visibility: 'public',
    integrationType: 'REST',
    headers: '{"Content-Type": "application/json"}',
    inputSchema: '{"type": "object", "properties": {"title": {"type": "string"}}}',
    outputSchema: '{"type": "object", "properties": {"id": {"type": "number"}}}',
    jsonPathFilter: '$.id',
    authenticationType: 'Bearer',
    active: true
  },
  {
    id: 2,
    gatewayName: 'GitHub API',
    name: 'delete_repository',
    displayName: 'Delete Repository',
    url: 'https://api.github.com/repos/{owner}/{repo}',
    type: 'REST',
    requestMethod: 'DELETE',
    description: 'Permanently deletes a GitHub repository',
    annotations: ['Destructive'],
    tags: ['github', 'repository'],
    owner: 'jane.smith@example.com',
    team: 'Engineering',
    visibility: 'team',
    integrationType: 'REST',
    headers: '{"Accept": "application/vnd.github+json"}',
    inputSchema: '{"type": "object", "properties": {"owner": {"type": "string"}, "repo": {"type": "string"}}}',
    outputSchema: '{"type": "object"}',
    jsonPathFilter: '',
    authenticationType: 'Bearer',
    active: true
  },
  {
    id: 3,
    gatewayName: 'Jira Cloud',
    name: 'get_issue',
    displayName: 'Get Issue',
    url: 'https://your-domain.atlassian.net/rest/api/3/issue/{issueIdOrKey}',
    type: 'REST',
    requestMethod: 'GET',
    description: 'Retrieves details of a Jira issue',
    annotations: ['IAMaxtium'],
    tags: ['jira', 'issues'],
    owner: 'bob.jones@example.com',
    team: 'Product Team',
    visibility: 'public',
    integrationType: 'REST',
    headers: '{"Content-Type": "application/json"}',
    inputSchema: '{"type": "object", "properties": {"issueIdOrKey": {"type": "string"}}}',
    outputSchema: '{"type": "object", "properties": {"id": {"type": "string"}, "key": {"type": "string"}}}',
    jsonPathFilter: '$.fields',
    authenticationType: 'Basic',
    active: true
  },
  {
    id: 4,
    gatewayName: 'Stripe API',
    name: 'process_payment',
    displayName: 'Process Payment',
    url: 'https://api.stripe.com/v1/payment_intents',
    type: 'REST',
    requestMethod: 'POST',
    description: 'Processes a payment through Stripe',
    annotations: ['External Access'],
    tags: ['payments', 'stripe'],
    owner: 'finance@example.com',
    team: 'Finance Team',
    visibility: 'private',
    integrationType: 'REST',
    headers: '{"Content-Type": "application/x-www-form-urlencoded"}',
    inputSchema: '{"type": "object", "properties": {"amount": {"type": "number"}, "currency": {"type": "string"}}}',
    outputSchema: '{"type": "object", "properties": {"id": {"type": "string"}, "status": {"type": "string"}}}',
    jsonPathFilter: '$.id',
    authenticationType: 'Bearer',
    active: false
  },
  {
    id: 5,
    gatewayName: 'System Utils',
    name: 'get_system_time',
    displayName: 'Get System Time',
    url: 'https://api.example.com/time',
    type: 'REST',
    requestMethod: 'GET',
    description: 'Get current system time in specified timezone',
    annotations: [],
    tags: ['system', 'utilities', 'time'],
    owner: 'john.doe@example.com',
    team: 'DevOps Team',
    visibility: 'public',
    integrationType: 'REST',
    headers: '{"Content-Type": "application/json"}',
    inputSchema: '{"type": "object", "properties": {"timezone": {"type": "string", "description": "IANA timezone name (e.g., \'America/New_York\', \'Europe/London\'). Defaults to UTC"}}}',
    outputSchema: '{"type": "object", "properties": {"content": {"type": "array"}, "is_error": {"type": "boolean"}}}',
    jsonPathFilter: '$.content',
    authenticationType: 'None',
    active: true
  }
];

export function ToolsPage() {
  const { theme } = useTheme();
  const [toolsData, setToolsData] = useState<Tool[]>([]);
  const [gatewaysData, setGatewaysData] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [panelMode, setPanelMode] = useState<'view' | 'add'>('view');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Test panel states
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testingTool, setTestingTool] = useState<Tool | null>(null);
  const [testInputs, setTestInputs] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [parsedFields, setParsedFields] = useState<ParsedField[]>([]);
  const [passthroughHeaders, setPassthroughHeaders] = useState('');
  const [arrayInputs, setArrayInputs] = useState<Record<string, string[]>>({});

  // Edited fields
  const [editedGatewayName, setEditedGatewayName] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedDisplayName, setEditedDisplayName] = useState('');
  const [editedUrl, setEditedUrl] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedRequestMethod, setEditedRequestMethod] = useState('GET');
  const [editedIntegrationType, setEditedIntegrationType] = useState('REST');
  const [editedHeaders, setEditedHeaders] = useState('');
  const [editedInputSchema, setEditedInputSchema] = useState('');
  const [editedOutputSchema, setEditedOutputSchema] = useState('');
  const [editedJsonPathFilter, setEditedJsonPathFilter] = useState('');
  const [editedAuthenticationType, setEditedAuthenticationType] = useState('None');
  const [editedAnnotations, setEditedAnnotations] = useState<string[]>([]);
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedVisibility, setEditedVisibility] = useState<'public' | 'team' | 'private'>('public');
  const [editedActive, setEditedActive] = useState(true);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAnnotations, setSelectedAnnotations] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedVisibility, setSelectedVisibility] = useState<string[]>([]);

  const allAnnotations = ['Up River Only', 'Destructive', 'IAMaxtium', 'External Access'];
  const allTypes = ['REST', 'GraphQL', 'gRPC'];
  const allMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const allVisibilityOptions = ['Public', 'Team', 'Private'];

  const [isGatewayDropdownOpen, setIsGatewayDropdownOpen] = useState(false);
  const [isIntegrationTypeDropdownOpen, setIsIntegrationTypeDropdownOpen] = useState(false);
  const [isRequestMethodDropdownOpen, setIsRequestMethodDropdownOpen] = useState(false);
  const [isAuthTypeDropdownOpen, setIsAuthTypeDropdownOpen] = useState(false);

  const { selectedTeamId } = useTeam();

  // Filter tools by selected team first
  const teamFilteredTools = useMemo(() => {
    if (!selectedTeamId) {
      return toolsData;
    }
    return toolsData.filter(tool => tool.teamId === selectedTeamId);
  }, [toolsData, selectedTeamId]);

  // Fetch tools on mount
  useEffect(() => {
    async function fetchTools() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch tools
        try {
          const tools = await api.listTools();
          // Map API response to Tool interface
          const mappedTools = tools.map((tool: any) => ({
            id: tool.id,
            gatewayId: tool.gateway_id || tool.gatewayId || null,
            gatewayName: tool.gateway_name || tool.gatewayName || tool.gateway_slug || tool.gatewaySlug || (tool.gatewayId ? `Gateway ${tool.gatewayId.slice(0, 8)}` : 'Local Tool'),
            name: tool.name,
            displayName: tool.display_name || tool.displayName || tool.name,
            url: tool.url,
            type: tool.integration_type || tool.type || 'REST',
            requestMethod: tool.request_type || tool.requestMethod || 'GET',
            description: tool.description || '',
            annotations: Array.isArray(tool.annotations) ? tool.annotations : [],
            tags: Array.isArray(tool.tags) ? tool.tags : [],
            owner: tool.owner || 'Unknown',
            team: tool.team || 'Default Team',
            teamId: tool.team_id || tool.teamId || null,
            visibility: tool.visibility || 'public',
            integrationType: tool.integration_type || tool.integrationType || 'REST',
            headers: typeof tool.headers === 'object' ? JSON.stringify(tool.headers, null, 2) : tool.headers || '',
            inputSchema: typeof tool.input_schema === 'object' ? JSON.stringify(tool.input_schema, null, 2) : tool.inputSchema || '',
            outputSchema: typeof tool.output_schema === 'object' ? JSON.stringify(tool.output_schema, null, 2) : (typeof tool.outputSchema === 'object' ? JSON.stringify(tool.outputSchema, null, 2) : (tool.output_schema || tool.outputSchema || '')),
            jsonPathFilter: tool.jsonpath_filter || tool.jsonPathFilter || '',
            authenticationType: tool.auth_type || tool.authenticationType || 'None',
            active: tool.enabled !== undefined ? tool.enabled : (tool.active !== undefined ? tool.active : true),
          }));
          setToolsData(mappedTools);
        } catch (fetchError) {
          // If fetch fails due to auth, try to login
          const errorMsg = (fetchError as Error).message;
          if (errorMsg.includes('Authorization') || errorMsg.includes('authenticated') || errorMsg.includes('401')) {
            console.log('Not authenticated, attempting login...');
            try {
              await api.login(
                import.meta.env['VITE_API_EMAIL'],
                import.meta.env['VITE_API_PASSWORD']
              );
              // Retry fetching tools
              const tools = await api.listTools();
              const mappedTools = tools.map((tool: any) => ({
                id: tool.id,
                gatewayId: tool.gateway_id || tool.gatewayId || null,
                gatewayName: tool.gateway_name || tool.gatewayName || tool.gateway_slug || tool.gatewaySlug || (tool.gatewayId ? `Gateway ${tool.gatewayId.slice(0, 8)}` : 'Local Tool'),
                teamId: tool.team_id || tool.teamId || null,
                name: tool.name,
                displayName: tool.display_name || tool.displayName || tool.name,
                url: tool.url,
                type: tool.integration_type || tool.type || 'REST',
                requestMethod: tool.request_type || tool.requestMethod || 'GET',
                description: tool.description || '',
                annotations: Array.isArray(tool.annotations) ? tool.annotations : [],
                tags: Array.isArray(tool.tags) ? tool.tags : [],
                owner: tool.owner || 'Unknown',
                team: tool.team || 'Default Team',
                visibility: tool.visibility || 'public',
                integrationType: tool.integration_type || tool.integrationType || 'REST',
                headers: typeof tool.headers === 'object' ? JSON.stringify(tool.headers, null, 2) : tool.headers || '',
                inputSchema: typeof tool.input_schema === 'object' ? JSON.stringify(tool.input_schema, null, 2) : tool.inputSchema || '',
                outputSchema: typeof tool.output_schema === 'object' ? JSON.stringify(tool.output_schema, null, 2) : (typeof tool.outputSchema === 'object' ? JSON.stringify(tool.outputSchema, null, 2) : (tool.output_schema || tool.outputSchema || '')),
                jsonPathFilter: tool.jsonpath_filter || tool.jsonPathFilter || '',
                authenticationType: tool.auth_type || tool.authenticationType || 'None',
                active: tool.enabled !== undefined ? tool.enabled : (tool.active !== undefined ? tool.active : true),
              }));
              setToolsData(mappedTools);
              toast.success('Connected to ContextForge backend');
            } catch (loginError) {
              throw new Error('Failed to authenticate: ' + (loginError as Error).message);
            }
          } else {
            throw fetchError;
          }
        }
      } catch (err) {
        console.log(err);
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        toast.error('Failed to load tools: ' + errorMessage);
        console.error('Failed to fetch tools:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTools();
  }, []);

  // Fetch gateways for the dropdown
  useEffect(() => {
    async function fetchGateways() {
      try {
        const gateways = await api.listGateways();
        const mappedGateways = gateways.map((gateway: any) => ({
          id: gateway.id,
          name: gateway.name,
        }));
        setGatewaysData(mappedGateways);
      } catch (err) {
        console.error('Failed to fetch gateways:', err);
        // Don't show error toast for gateways - it's not critical
      }
    }
    fetchGateways();
  }, []);

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
    setEditedGatewayName(tool.gatewayName);
    setEditedName(tool.name);
    setEditedDisplayName(tool.displayName || '');
    setEditedUrl(tool.url);
    setEditedDescription(tool.description);
    setEditedRequestMethod(tool.requestMethod);
    setEditedIntegrationType(tool.integrationType);
    // Ensure JSON fields are strings, not objects
    setEditedHeaders(typeof tool.headers === 'object' ? JSON.stringify(tool.headers, null, 2) : tool.headers);
    setEditedInputSchema(typeof tool.inputSchema === 'object' ? JSON.stringify(tool.inputSchema, null, 2) : tool.inputSchema);
    setEditedOutputSchema(typeof tool.outputSchema === 'object' ? JSON.stringify(tool.outputSchema, null, 2) : tool.outputSchema);
    setEditedJsonPathFilter(tool.jsonPathFilter);
    setEditedAuthenticationType(tool.authenticationType);
    setEditedAnnotations(tool.annotations);
    setEditedTags(tool.tags);
    setEditedVisibility(tool.visibility);
    setEditedActive(tool.active);
    setPanelMode('view');
    setShowSidePanel(true);
  };

  const handleAddToolClick = () => {
    setSelectedTool(null);
    setEditedGatewayName('');
    setEditedName('');
    setEditedDisplayName('');
    setEditedUrl('');
    setEditedDescription('');
    setEditedRequestMethod('GET');
    setEditedIntegrationType('REST');
    setEditedHeaders('');
    setEditedInputSchema('');
    setEditedOutputSchema('');
    setEditedJsonPathFilter('');
    setEditedAuthenticationType('None');
    setEditedAnnotations([]);
    setEditedTags([]);
    setEditedVisibility('public');
    setEditedActive(true);
    setPanelMode('add');
    setShowSidePanel(true);
  };

  const handleBulkImportClick = () => {
    setShowBulkImport(true);
  };

  const handleTestTool = (tool: Tool) => {
    setTestingTool(tool);
    setTestInputs({});
    setTestResult(null);
    setTestError(null);
    setPassthroughHeaders('');
    setArrayInputs({});
    setShowSidePanel(false);
    setShowTestPanel(true);
    
    // Parse the input schema - handle both string and object cases
    let schemaInput: string | object = tool.inputSchema || '{}';
    
    // If inputSchema is somehow an object (shouldn't happen but handle it), convert to string
    if (typeof schemaInput === 'object' && schemaInput !== null) {
      try {
        schemaInput = JSON.stringify(schemaInput);
      } catch (e) {
        console.error('Error stringifying input schema:', e);
        schemaInput = '{}';
      }
    }
    
    const fields = parseInputSchema(schemaInput);
    setParsedFields(fields);
    
    // Initialize inputs with default values
    const initialInputs: Record<string, any> = {};
    const initialArrays: Record<string, string[]> = {};
    
    fields.forEach(field => {
      if (field.default !== undefined) {
        initialInputs[field.name] = field.default;
      }
      if (field.type === 'array') {
        initialArrays[field.name] = [''];
      }
    });
    
    setTestInputs(initialInputs);
    setArrayInputs(initialArrays);
  };

  const handleRunTest = async () => {
    if (!testingTool || testLoading) return;
    
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);
    
    try {
      // Validate inputs
      for (const field of parsedFields) {
        const value = field.type === 'array'
          ? arrayInputs[field.name]?.filter(v => v.trim())
          : testInputs[field.name];
        
        const validation = validateFieldValue(value, field);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }
      
      // Parse passthrough headers
      let headers: Record<string, string> = {};
      if (passthroughHeaders.trim()) {
        headers = parsePassthroughHeaders(passthroughHeaders);
      }
      
      // Process array inputs into testInputs
      const processedInputs = { ...testInputs };
      for (const [fieldName, values] of Object.entries(arrayInputs)) {
        const field = parsedFields.find(f => f.name === fieldName);
        if (field && field.type === 'array') {
          processedInputs[fieldName] = values.filter(v => v.trim());
        }
      }
      
      // Process inputs into properly typed parameters
      const params = processInputParameters(processedInputs, parsedFields);
      
      // Execute the tool via RPC
      const result = await api.executeToolRpc(
        testingTool.name,
        params,
        headers,
        60000 // 60 second timeout
      );
      
      setTestResult(JSON.stringify(result, null, 2));
      toast.success('Tool executed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTestError(errorMessage);
      toast.error(`Tool execution failed: ${errorMessage}`);
      console.error('Tool test error:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const handleBulkImport = (importedTools: any[]) => {
    const newTools = importedTools.map((tool, index) => ({
      id: Math.max(...toolsData.map(t => t.id), 0) + index + 1,
      gatewayName: tool.gateway_name || 'Imported Gateway',
      name: tool.name,
      displayName: tool.displayName || tool.name,
      url: tool.url,
      type: tool.integration_type || 'REST',
      requestMethod: tool.request_type || 'GET',
      description: tool.description || '',
      annotations: tool.annotations || [],
      tags: Array.isArray(tool.tags) ? tool.tags : [],
      owner: tool.owner || 'Current User',
      team: tool.team || 'Default Team',
      visibility: (tool.visibility as 'public' | 'team' | 'private') || 'public',
      integrationType: tool.integration_type || 'REST',
      headers: typeof tool.headers === 'object' ? JSON.stringify(tool.headers, null, 2) : tool.headers || '',
      inputSchema: typeof tool.input_schema === 'object' ? JSON.stringify(tool.input_schema, null, 2) : tool.input_schema || '',
      outputSchema: tool.output_schema || '',
      jsonPathFilter: tool.jsonpath_filter || '',
      authenticationType: tool.auth_type || 'None',
      active: tool.active !== undefined ? tool.active : true,
    }));
    
    setToolsData(prevData => [...prevData, ...newTools]);
  };

  const handleSaveTool = () => {
    if (panelMode === 'add') {
      const newTool = {
        id: Math.max(...toolsData.map(t => t.id)) + 1,
        gatewayName: editedGatewayName || 'New Gateway',
        name: editedName || 'new_tool',
        displayName: editedDisplayName,
        url: editedUrl || '',
        type: editedIntegrationType,
        requestMethod: editedRequestMethod,
        description: editedDescription || '',
        annotations: editedAnnotations,
        tags: editedTags,
        owner: 'current.user@example.com',
        team: 'My Team',
        visibility: editedVisibility,
        integrationType: editedIntegrationType,
        headers: editedHeaders,
        inputSchema: editedInputSchema,
        outputSchema: editedOutputSchema,
        jsonPathFilter: editedJsonPathFilter,
        authenticationType: editedAuthenticationType,
        active: editedActive
      };
      setToolsData(prevData => [...prevData, newTool]);
      toast.success(`"${newTool.name}" added successfully`);
      setShowSidePanel(false);
    } else {
      if (selectedTool) {
        setToolsData(prevData =>
          prevData.map(tool =>
            tool.id === selectedTool.id
              ? {
                  ...tool,
                  gatewayName: editedGatewayName,
                  name: editedName,
                  displayName: editedDisplayName,
                  url: editedUrl,
                  description: editedDescription,
                  requestMethod: editedRequestMethod,
                  integrationType: editedIntegrationType,
                  headers: editedHeaders,
                  inputSchema: editedInputSchema,
                  outputSchema: editedOutputSchema,
                  jsonPathFilter: editedJsonPathFilter,
                  authenticationType: editedAuthenticationType,
                  annotations: editedAnnotations,
                  tags: editedTags,
                  visibility: editedVisibility,
                  active: editedActive
                }
              : tool
          )
        );
        toast.success(`"${editedName}" updated successfully`);
        setShowSidePanel(false);
      }
    }
  };

  const toggleToolActive = async (toolId: number) => {
    const tool = toolsData.find(t => t.id === toolId);
    if (!tool) return;
    
    const wasActive = tool.active;
    const newActiveState = !wasActive;
    const previousData = [...toolsData];
    
    // Optimistically update UI
    setToolsData(prevData =>
      prevData.map(t =>
        t.id === toolId
          ? { ...t, active: newActiveState }
          : t
      )
    );
    
    if (selectedTool?.id === toolId) {
      setSelectedTool({
        ...selectedTool,
        active: newActiveState
      });
      setEditedActive(newActiveState);
    }
    
    try {
      // Call the API to persist the change with explicit activate parameter
      await api.toggleToolStatus(String(toolId), newActiveState);
      
      // Show confirmation toast with undo option only when deactivating
      if (wasActive) {
        toast.success(`"${tool.name}" deactivated`, {
          description: 'The tool has been deactivated',
          action: {
            label: 'Undo',
            onClick: async () => {
              setToolsData(previousData);
              if (selectedTool?.id === toolId) {
                setSelectedTool({ ...selectedTool, active: true });
                setEditedActive(true);
              }
              // Call API to revert with explicit activate=true
              await api.toggleToolStatus(String(toolId), true);
              toast.info('Deactivation undone');
            },
          },
        });
      }
    } catch (error) {
      // Revert on error
      setToolsData(previousData);
      if (selectedTool?.id === toolId) {
        setSelectedTool({ ...selectedTool, active: wasActive });
        setEditedActive(wasActive);
      }
      toast.error('Failed to toggle tool status', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const duplicateTool = (toolId: number) => {
    const toolToDuplicate = toolsData.find(t => t.id === toolId);
    if (toolToDuplicate) {
      const newTool = {
        ...toolToDuplicate,
        id: Math.max(...toolsData.map(t => t.id)) + 1,
        name: `${toolToDuplicate.name}_copy`
      };
      setToolsData(prevData => [...prevData, newTool]);
      toast.success(`"${newTool.name}" created successfully`);
    }
  };

  const deleteTool = (toolId: number) => {
    const toolToDelete = toolsData.find(t => t.id === toolId);
    if (toolToDelete) {
      const deletedToolIndex = toolsData.findIndex(t => t.id === toolId);
      
      setToolsData(prevData => prevData.filter(t => t.id !== toolId));
      
      if (selectedTool?.id === toolId) {
        setShowSidePanel(false);
        setSelectedTool(null);
      }
      
      toast.success(`"${toolToDelete.name}" deleted`, {
        action: {
          label: 'Undo',
          onClick: () => {
            setToolsData(prevData => {
              const newData = [...prevData];
              newData.splice(deletedToolIndex, 0, toolToDelete);
              return newData;
            });
            toast.success(`"${toolToDelete.name}" restored`);
          }
        },
        duration: 5000
      });
    }
  };

  const removeTag = (index: number) => {
    setEditedTags(editedTags.filter((_, i) => i !== index));
  };

  const getAnnotationColors = (annotation: string) => {
    switch (annotation) {
      case 'Up River Only':
        return { bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100', text: theme === 'dark' ? 'text-blue-300' : 'text-blue-700', border: theme === 'dark' ? 'border-blue-700' : 'border-blue-300' };
      case 'Destructive':
        return { bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100', text: theme === 'dark' ? 'text-red-300' : 'text-red-700', border: theme === 'dark' ? 'border-red-700' : 'border-red-300' };
      case 'IAMaxtium':
        return { bg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100', text: theme === 'dark' ? 'text-purple-300' : 'text-purple-700', border: theme === 'dark' ? 'border-purple-700' : 'border-purple-300' };
      case 'External Access':
        return { bg: theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100', text: theme === 'dark' ? 'text-orange-300' : 'text-orange-700', border: theme === 'dark' ? 'border-orange-700' : 'border-orange-300' };
      default:
        return { bg: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200', text: theme === 'dark' ? 'text-gray-300' : 'text-gray-700', border: theme === 'dark' ? 'border-gray-600' : 'border-gray-300' };
    }
  };

  const filteredTools = teamFilteredTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.gatewayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAnnotations = selectedAnnotations.length === 0 ||
                               tool.annotations.some(a => selectedAnnotations.includes(a));
    const matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(tool.type);
    const matchesMethods = selectedMethods.length === 0 || selectedMethods.includes(tool.requestMethod);
    const matchesVisibility = selectedVisibility.length === 0 ||
                              selectedVisibility.includes(tool.visibility.charAt(0).toUpperCase() + tool.visibility.slice(1));
    
    return matchesSearch && matchesAnnotations && matchesTypes && matchesMethods && matchesVisibility;
  });

  const hasActiveFilters = selectedAnnotations.length > 0 || selectedTypes.length > 0 || 
                          selectedMethods.length > 0 || selectedVisibility.length > 0;

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <PageHeader
          title="MCP Tools"
          description="This is the diverse catalog of MCP Tools available. You can also add custom tools from REST APIs."
          theme={theme}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64 px-[32px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Loading tools...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="px-[32px]">
            <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
                Failed to load tools
              </h3>
              <p className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className={`mt-4 px-4 py-2 rounded ${theme === 'dark' ? 'bg-red-800 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && toolsData.length === 0 && (
          <div className="flex items-center justify-center h-64 px-[32px]">
            <div className="text-center max-w-md">
              <Wrench
                className={`mx-auto h-16 w-16 mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
              />
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                No Tools Yet
              </h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Get started by adding your first tool to connect external APIs and services.
              </p>
              <button
                onClick={handleAddToolClick}
                className="h-[36px] px-[12px] bg-cyan-500 hover:bg-cyan-600 rounded-[6px] transition-colors shadow-sm shadow-cyan-500/20 text-white font-medium text-[13px]"
              >
                Add Your First Tool
              </button>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        {!isLoading && !error && toolsData.length > 0 && (
        <div className="px-[32px] pb-[24px]">
          <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
            {/* Controls Header */}
            <div className={`border-b ${theme === 'dark' ? 'bg-zinc-800/50 border-zinc-800' : 'bg-white border-gray-200'}`}>
              <DataTableToolbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterComponent={
                  <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
                    <DropdownMenuTrigger asChild>
                      <button className={`relative flex items-center justify-center size-[32px] border rounded-[6px] transition-colors ${
                        hasActiveFilters
                          ? theme === 'dark'
                            ? 'bg-cyan-900/30 border-cyan-500 hover:bg-cyan-900/40'
                            : 'bg-cyan-50 border-cyan-500 hover:bg-cyan-100'
                          : theme === 'dark'
                            ? 'bg-zinc-950 border-zinc-700 hover:bg-zinc-800'
                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                      }`}>
                        <Filter size={14} className={hasActiveFilters ? 'text-cyan-500' : theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                        {hasActiveFilters && (
                          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-cyan-500 rounded-full text-white text-[10px] font-semibold">
                            {selectedAnnotations.length + selectedTypes.length + selectedMethods.length + selectedVisibility.length}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className={`w-64 max-h-[500px] overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
                      onInteractOutside={(e) => e.preventDefault()}
                    >
                      <FilterCategory
                        label="Annotations"
                        items={allAnnotations}
                        selectedItems={selectedAnnotations}
                        onToggle={(item) => {
                          setSelectedAnnotations(prev =>
                            prev.includes(item)
                              ? prev.filter(i => i !== item)
                              : [...prev, item]
                          );
                        }}
                        theme={theme}
                      />
                      <FilterCategory
                        label="Type"
                        items={allTypes}
                        selectedItems={selectedTypes}
                        onToggle={(item) => {
                          setSelectedTypes(prev =>
                            prev.includes(item)
                              ? prev.filter(i => i !== item)
                              : [...prev, item]
                          );
                        }}
                        theme={theme}
                      />
                      <FilterCategory
                        label="Request Method"
                        items={allMethods}
                        selectedItems={selectedMethods}
                        onToggle={(item) => {
                          setSelectedMethods(prev =>
                            prev.includes(item)
                              ? prev.filter(i => i !== item)
                              : [...prev, item]
                          );
                        }}
                        theme={theme}
                      />
                      <FilterCategory
                        label="Visibility"
                        items={allVisibilityOptions}
                        selectedItems={selectedVisibility}
                        onToggle={(item) => {
                          setSelectedVisibility(prev =>
                            prev.includes(item)
                              ? prev.filter(i => i !== item)
                              : [...prev, item]
                          );
                        }}
                        theme={theme}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
                secondaryActions={
                  <div className="flex items-center gap-0 shadow-lg shadow-orange-500/20 rounded-[6px] overflow-hidden">
                    <button
                      onClick={handleAddToolClick}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 flex gap-[6px] items-center justify-center px-[12px] py-[8px] hover:from-orange-600 hover:to-orange-700 transition-all"
                    >
                      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic text-[13px] text-white text-nowrap whitespace-pre">
                        Add Tool
                      </p>
                    </button>
                    <div className="w-px h-[20px] bg-orange-400/30"></div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center px-[8px] py-[8px] hover:from-orange-600 hover:to-orange-700 transition-all"
                        >
                          <ChevronDown size={16} className="text-white" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}>
                        <DropdownMenuItem
                          onClick={handleAddToolClick}
                          className={theme === 'dark' ? 'text-zinc-300 focus:bg-zinc-800 focus:text-white' : 'text-gray-700 focus:bg-gray-100'}
                        >
                          Add Single Tool
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleBulkImportClick}
                          className={theme === 'dark' ? 'text-zinc-300 focus:bg-zinc-800 focus:text-white' : 'text-gray-700 focus:bg-gray-100'}
                        >
                          Bulk Import Tools
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                }
                theme={theme}
              />
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <table className="w-full">
                <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Name</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>URL</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Description</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Method</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Tags</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium w-12 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}></th>
                  </tr>
                </thead>
                <tbody className={theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white'}>
                  {filteredTools.map((tool) => (
                    <tr
                      key={tool.id}
                      onClick={() => handleToolClick(tool)}
                      className={`border-b last:border-b-0 transition-colors cursor-pointer ${
                        selectedTool?.id === tool.id
                          ? theme === 'dark'
                            ? 'bg-cyan-950/20 border-cyan-800/50'
                            : 'bg-cyan-50 border-cyan-200'
                          : theme === 'dark' 
                            ? 'border-zinc-800 hover:bg-zinc-800/50' 
                            : 'border-gray-200 hover:bg-gray-50'
                      } ${selectedTool?.id === tool.id ? 'border-l-4 border-l-cyan-500' : ''}`}
                    >
                      <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium flex items-center gap-2 break-words">
                              {tool.name}
                              <span className={`w-2 h-2 rounded-full shrink-0 ${tool.active ? 'bg-cyan-500' : 'bg-gray-400'}`}></span>
                            </div>
                            {tool.displayName && (
                              <div className={`text-sm break-words ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                                {tool.displayName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-5 text-sm break-words ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                        {tool.url}
                      </td>
                      <td className={`px-4 py-5 text-sm break-words ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                        {tool.description}
                      </td>
                      <td className="px-4 py-5">
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          tool.requestMethod === 'GET' ? (theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700') :
                          tool.requestMethod === 'POST' ? (theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700') :
                          tool.requestMethod === 'DELETE' ? (theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700') :
                          (theme === 'dark' ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700')
                        }`}>
                          {tool.requestMethod}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-1">
                          {tool.tags.map((tag, idx) => {
                            const colors = getTagColor(tag, theme);
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-full text-xs border ${colors.bg} ${colors.text} ${colors.border}`}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className={`p-1 rounded transition-colors mr-4 ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'}`} 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTestTool(tool);
                              }}
                              className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                            >
                              <Wrench size={14} className="mr-2" />
                              Test
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleToolActive(tool.id);
                              }}
                              className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                            >
                              <Power size={14} className="mr-2" />
                              {tool.active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToolClick(tool);
                              }}
                              className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                            >
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateTool(tool.id);
                              }}
                              className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                            >
                              <Copy size={14} className="mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTool(tool.id);
                              }}
                              className={`cursor-pointer ${theme === 'dark' ? 'text-red-400 hover:bg-zinc-800' : 'text-red-600 hover:bg-gray-100'}`}
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className={`p-4 ${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'bg-zinc-800/50 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {tool.name}
                      </h3>
                      {tool.displayName && (
                        <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                          {tool.displayName}
                        </p>
                      )}
                      <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                        {tool.gatewayName}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleToolActive(tool.id);
                          }}
                          className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                        >
                          <Power size={14} className="mr-2" />
                          {tool.active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToolClick(tool);
                          }}
                          className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                        >
                          <Pencil size={14} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTool(tool.id);
                          }}
                          className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                        >
                          <Copy size={14} className="mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTool(tool.id);
                          }}
                          className={`cursor-pointer ${theme === 'dark' ? 'text-red-400 hover:bg-zinc-800' : 'text-red-600 hover:bg-gray-100'}`}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}>
                    {tool.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tool.requestMethod === 'GET' ? (theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700') :
                      tool.requestMethod === 'POST' ? (theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700') :
                      tool.requestMethod === 'DELETE' ? (theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700') :
                      (theme === 'dark' ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700')
                    }`}>
                      {tool.requestMethod}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                      tool.active
                        ? theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                        : theme === 'dark' ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tool.active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {tool.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {tool.annotations.map((annotation) => {
                      const colors = getAnnotationColors(annotation);
                      return (
                        <span
                          key={annotation}
                          className={`${colors.bg} ${colors.text} ${colors.border} border px-2 py-1 rounded text-xs font-medium`}
                        >
                          {annotation}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 rounded text-xs ${
                          theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                    {tool.tags.length > 3 && (
                      <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                        +{tool.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
                </div>
                {filteredTools.length === 0 && (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                    No tools found
                  </div>
                )}
              </div>
            )}

            {filteredTools.length === 0 && viewMode === 'table' && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
                No tools found
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className={`mt-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            Showing {filteredTools.length} of {toolsData.length} tools
          </div>
        </div>
        )}
      </div>

      {/* Side Panel */}
      <RightSidePanel
        isOpen={showSidePanel}
        onClose={() => setShowSidePanel(false)}
        title={panelMode === 'add' ? 'Add New Tool from REST API' : editedName}
        subtitle={panelMode === 'view' ? editedGatewayName : undefined}
        theme={theme as 'light' | 'dark'}
        width="w-[600px]"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowSidePanel(false)}
              className={`flex-1 px-4 py-2 rounded-md transition-colors border ${theme === 'dark' ? 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTool}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-md hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
            >
              {panelMode === 'add' ? 'Add Tool' : 'Save Changes'}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
              {/* Gateway Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Gateway Name
                </label>
                <DropdownMenu open={isGatewayDropdownOpen} onOpenChange={setIsGatewayDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`w-full px-3 py-2 rounded-md border transition-colors flex items-center justify-between ${
                        theme === 'dark'
                          ? 'bg-zinc-800 border-zinc-700 text-white hover:border-cyan-500'
                          : 'bg-white border-gray-300 text-gray-900 hover:border-cyan-500'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500`}
                    >
                      <span className={editedGatewayName ? '' : theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>
                        {editedGatewayName || 'Select MCP Server'}
                      </span>
                      <ChevronDown size={16} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    sideOffset={4}
                    className={`min-w-[200px] ${
                      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                    }`}
                  >
                    {gatewaysData.length === 0 ? (
                      <DropdownMenuItem disabled className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>
                        No gateways available
                      </DropdownMenuItem>
                    ) : (
                      gatewaysData.map((gateway) => (
                        <DropdownMenuItem
                          key={gateway.id}
                          onClick={() => {
                            setEditedGatewayName(gateway.name);
                            setIsGatewayDropdownOpen(false);
                          }}
                          className={`cursor-pointer ${
                            theme === 'dark' 
                              ? 'text-white hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white' 
                              : 'text-gray-900 hover:bg-gray-100 focus:bg-gray-100'
                          } ${editedGatewayName === gateway.name ? (theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100') : ''}`}
                        >
                          {gateway.name}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Name
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white focus:border-cyan-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />
              </div>

              {/* Display Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Display Name <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={editedDisplayName}
                  onChange={(e) => setEditedDisplayName(e.target.value)}
                  placeholder="Custom display name for your UI"
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-cyan-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />
              </div>

              {/* URL */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  URL
                </label>
                <input
                  type="text"
                  value={editedUrl}
                  onChange={(e) => setEditedUrl(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white focus:border-cyan-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-md border transition-colors resize-none ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white focus:border-cyan-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />
              </div>

              {/* Integration Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Integration Type
                </label>
                <div className="relative">
                  <div className={`relative rounded-md w-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setIsIntegrationTypeDropdownOpen(!isIntegrationTypeDropdownOpen)}
                      className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800/30' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                    >
                      <span className={`text-sm ${!editedIntegrationType && (theme === 'dark' ? 'text-zinc-500' : 'text-gray-400')}`}>
                        {editedIntegrationType || 'Select Integration Type'}
                      </span>
                      <ChevronDown size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                    </button>
                  </div>
                  
                  {isIntegrationTypeDropdownOpen && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-md border shadow-lg z-50 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                      {['REST', 'GraphQL', 'gRPC'].map((type) => (
                        <div
                          key={type}
                          className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                            editedIntegrationType === type 
                              ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                              : theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setEditedIntegrationType(type);
                            setIsIntegrationTypeDropdownOpen(false);
                          }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Request Method */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Request Type
                </label>
                <div className="relative">
                  <div className={`relative rounded-md w-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setIsRequestMethodDropdownOpen(!isRequestMethodDropdownOpen)}
                      className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800/30' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                    >
                      <span className={`text-sm ${!editedRequestMethod && (theme === 'dark' ? 'text-zinc-500' : 'text-gray-400')}`}>
                        {editedRequestMethod || 'Select Request Type'}
                      </span>
                      <ChevronDown size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                    </button>
                  </div>
                  
                  {isRequestMethodDropdownOpen && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-md border shadow-lg z-50 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                      {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((method) => (
                        <div
                          key={method}
                          className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                            editedRequestMethod === method 
                              ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                              : theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setEditedRequestMethod(method);
                            setIsRequestMethodDropdownOpen(false);
                          }}
                        >
                          {method}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Headers (JSON) */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Headers (JSON)
                </label>
                <textarea
                  value={editedHeaders}
                  onChange={(e) => setEditedHeaders(e.target.value)}
                  rows={4}
                  placeholder='{"Content-Type": "application/json"}'
                  className={`w-full px-3 py-2 rounded-md border transition-colors resize-none font-mono text-sm ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-700 text-cyan-400 placeholder-zinc-600 focus:border-cyan-500'
                      : 'bg-gray-50 border-gray-300 text-cyan-700 placeholder-gray-400 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />
              </div>

              {/* Input Schema */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Input Schema (JSON)
                </label>
                <textarea
                  value={editedInputSchema}
                  onChange={(e) => setEditedInputSchema(e.target.value)}
                  rows={5}
                  placeholder='{"type": "object", "properties": {...}}'
                  className={`w-full px-3 py-2 rounded-md border transition-colors resize-none font-mono text-sm ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-700 text-cyan-400 placeholder-zinc-600 focus:border-cyan-500'
                      : 'bg-gray-50 border-gray-300 text-cyan-700 placeholder-gray-400 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />
              </div>

              {/* Output Schema */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Output Schema (JSON)
                </label>
                <textarea
                  value={editedOutputSchema}
                  onChange={(e) => setEditedOutputSchema(e.target.value)}
                  rows={5}
                  placeholder='{"type": "object", "properties": {...}}'
                  className={`w-full px-3 py-2 rounded-md border transition-colors resize-none font-mono text-sm ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-700 text-cyan-400 placeholder-zinc-600 focus:border-cyan-500'
                      : 'bg-gray-50 border-gray-300 text-cyan-700 placeholder-gray-400 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Optional JSON Schema for validating unstructured output - uses empty if not request
                </p>
              </div>

              {/* Json Path Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Json Path Filter
                </label>
                <input
                  type="text"
                  value={editedJsonPathFilter}
                  onChange={(e) => setEditedJsonPathFilter(e.target.value)}
                  placeholder="$.data"
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-cyan-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />
              </div>

              {/* Authentication Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Authentication Type
                </label>
                <div className="relative">
                  <div className={`relative rounded-md w-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setIsAuthTypeDropdownOpen(!isAuthTypeDropdownOpen)}
                      className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800/30' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                    >
                      <span className={`text-sm ${!editedAuthenticationType && (theme === 'dark' ? 'text-zinc-500' : 'text-gray-400')}`}>
                        {editedAuthenticationType || 'Select Authentication Type'}
                      </span>
                      <ChevronDown size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                    </button>
                  </div>
                  
                  {isAuthTypeDropdownOpen && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-md border shadow-lg z-50 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                      {['None', 'Bearer Token', 'Basic Auth', 'API Key'].map((type) => (
                        <div
                          key={type}
                          className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                            editedAuthenticationType === type 
                              ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                              : theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setEditedAuthenticationType(type);
                            setIsAuthTypeDropdownOpen(false);
                          }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Tags
                </label>
                <div className={`w-full px-3 py-2 border rounded-md focus-within:ring-2 focus-within:ring-cyan-500 flex flex-wrap gap-2 items-center ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                  {editedTags.map((tag, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className={`hover:opacity-70 transition-opacity`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder={editedTags.length === 0 ? "Enter tag" : ""}
                    className={`flex-1 min-w-[120px] outline-none ${theme === 'dark' ? 'bg-zinc-900 text-white placeholder:text-zinc-500' : 'bg-white text-gray-900 placeholder:text-gray-400'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = e.currentTarget.value.trim();
                        if (value && !editedTags.includes(value)) {
                          setEditedTags([...editedTags, value]);
                          e.currentTarget.value = '';
                        }
                      } else if (e.key === 'Backspace' && e.currentTarget.value === '' && editedTags.length > 0) {
                        setEditedTags(editedTags.slice(0, -1));
                      }
                    }}
                  />
                </div>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Press Enter to submit a tag
                </p>
              </div>

              {/* Annotations */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Annotations
                </label>
                <input
                  type="text"
                  value={Array.isArray(editedAnnotations) ? editedAnnotations.join(', ') : ''}
                  onChange={(e) => setEditedAnnotations(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  placeholder="Up River Only, Destructive"
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-cyan-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />
              </div>

              {/* Visibility */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Visibility
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={editedVisibility === 'public'}
                      onChange={(e) => setEditedVisibility(e.target.value as 'public' | 'team' | 'private')}
                      className="w-4 h-4"
                    />
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Public</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="team"
                      checked={editedVisibility === 'team'}
                      onChange={(e) => setEditedVisibility(e.target.value as 'public' | 'team' | 'private')}
                      className="w-4 h-4"
                    />
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Team</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={editedVisibility === 'private'}
                      onChange={(e) => setEditedVisibility(e.target.value as 'public' | 'team' | 'private')}
                      className="w-4 h-4"
                    />
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Private</span>
                  </label>
                </div>
              </div>

              {/* Owner */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Owner</label>
                <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTool?.owner || 'current.user@example.com'}</p>
              </div>

              {/* Team */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Team</label>
                <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTool?.team || 'My Team'}</p>
              </div>
            </div>
      </RightSidePanel>

      {/* Test Panel */}
      {showTestPanel && testingTool && (
        <div className={`w-[600px] border-l flex flex-col ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className={`p-6 border-b sticky top-0 z-10 ${theme === 'dark' ? 'border-zinc-700 bg-zinc-900' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Test Tool: {testingTool.name}
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                    {testingTool.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowTestPanel(false)}
                  className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}
                >
                  <X size={20} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                </button>
              </div>
            </div>

            {/* Test Form Content */}
            <div className="p-6 space-y-6">
              {/* Input Parameters Section */}
              {parsedFields.length > 0 ? (
                <div className="space-y-4">
                  <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                    Input Parameters
                  </h3>
                  {parsedFields.map((field) => (
                    <ToolTestFormField
                      key={field.name}
                      field={field}
                      value={testInputs[field.name]}
                      arrayValues={arrayInputs[field.name]}
                      onChange={(value) => setTestInputs({ ...testInputs, [field.name]: value })}
                      onArrayChange={(values) => setArrayInputs({ ...arrayInputs, [field.name]: values })}
                    />
                  ))}
                </div>
              ) : (
                <div className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  No input parameters required
                </div>
              )}

              {/* Passthrough Headers Section */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Passthrough Headers (Optional)
                </label>
                <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Add custom headers to pass through with the request. One per line in format: Header-Name: Value
                </p>
                <textarea
                  value={passthroughHeaders}
                  onChange={(e) => setPassthroughHeaders(e.target.value)}
                  placeholder="X-Custom-Header: value&#10;Authorization: Bearer token"
                  rows={4}
                  className={`w-full px-3 py-2 rounded-md border transition-colors font-mono text-sm ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-cyan-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-cyan-500'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                />
              </div>

              {/* Error Display */}
              {testError && (
                <div className={`p-4 rounded-md border flex items-start gap-3 ${
                  theme === 'dark'
                    ? 'bg-red-950/20 border-red-900/50 text-red-400'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Error</p>
                    <p className="text-sm mt-1">{testError}</p>
                  </div>
                </div>
              )}

              {/* Run Tool Button */}
              <button
                onClick={handleRunTest}
                disabled={testLoading}
                className={`flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-medium text-sm ${
                  testLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {testLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Running...
                  </>
                ) : (
                  'Run Tool'
                )}
              </button>

              {/* Results Section */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Result
                </label>
                {testResult ? (
                  <div className={`w-full rounded-md border overflow-hidden ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-700'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex">
                      <div className={`py-4 px-4 select-none font-mono text-sm text-right ${
                        theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'
                      }`}>
                        {testResult.split('\n').map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>
                      <pre className={`flex-1 py-4 pr-4 overflow-x-auto font-mono text-sm ${
                        theme === 'dark'
                          ? 'text-cyan-400'
                          : 'text-cyan-700'
                      }`}>
                        {testResult}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className={`w-full h-32 p-4 rounded-md border flex items-center justify-center ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-700 text-zinc-600'
                      : 'bg-gray-50 border-gray-300 text-gray-400'
                  }`}>
                    {testLoading ? 'Executing tool...' : 'No results yet'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Form */}
      {showBulkImport && (
        <BulkImportForm
          onClose={() => setShowBulkImport(false)}
          onImport={handleBulkImport}
        />
      )}
    </div>
  );
}
