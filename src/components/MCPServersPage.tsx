import { useState } from 'react';
import { Search, MoreVertical, X, Filter, LayoutGrid, Table, Pencil, Power, Copy, Trash2, ChevronDown } from 'lucide-react';
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
import { FilterCategory } from './FilterCategory';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import imgAzure from "../../assets/icons/brands/terraform.png";
import imgBox from "../../assets/icons/brands/box.png";
import imgGitHub from "../../assets/icons/brands/github.png";
import imgPostman from "../../assets/icons/brands/postman.png";
import imgTerraform from "../../assets/icons/brands/terraform.png";

// Helper function to get consistent tag colors
const getTagColor = (tag: string, theme: string) => {
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
  return colors[Math.abs(hash) % colors.length];
};

// Define the MCPServer type first
type MCPServer = {
  id: number;
  name: string;
  logoUrl: string;
  url: string;
  description: string;
  tags: string[];
  active: boolean;
  lastSeen: string;
  team: string;
  visibility: 'public' | 'team' | 'private';
  transportType: string;
  authenticationType: string;
  passthroughHeaders: string[];
};

// Sample MCP Server data
const sampleMCPServers: MCPServer[] = [
  {
    id: 1,
    name: 'Azure',
    logoUrl: imgAzure,
    url: 'https://azure.microsoft.com/mcp',
    description: 'Production-ready MCP server connecting AI agents with 40+ Azure services including AI Foundry, AI Search, App Insights',
    tags: ['microsoft', 'cloud', 'production'],
    active: true,
    lastSeen: '2 min ago',
    team: 'Microsoft',
    visibility: 'public',
    transportType: 'SSE',
    authenticationType: 'OAuth 2.0',
    passthroughHeaders: ['Authorization', 'X-Tenant-Id'],
  },
  {
    id: 2,
    name: 'Box',
    logoUrl: imgBox,
    url: 'https://box.com/mcp',
    description: 'Securely connect AI agents to your enterprise content in Box',
    tags: ['storage', 'enterprise', 'content'],
    active: true,
    lastSeen: '30 min ago',
    team: 'Box',
    visibility: 'team',
    transportType: 'SSE',
    authenticationType: 'OAuth 2.0',
    passthroughHeaders: ['Authorization', 'X-Trace-Id'],
  },
  {
    id: 3,
    name: 'GitHub',
    logoUrl: imgGitHub,
    url: 'https://github.com/mcp',
    description: 'MCP Server for the GitHub API, enabling repository management, issue tracking, and code operations',
    tags: ['developer-tools', 'version-control', 'collaboration'],
    active: false,
    lastSeen: '2 days ago',
    team: 'GitHub',
    visibility: 'public',
    transportType: 'SSE',
    authenticationType: 'Bearer Token',
    passthroughHeaders: ['Authorization'],
  },
  {
    id: 4,
    name: 'Postman',
    logoUrl: imgPostman,
    url: 'https://postman.com/mcp',
    description: 'MCP Server for the Postman API, enabling API testing, documentation, and collaboration',
    tags: ['developer-tools', 'api-testing', 'collaboration'],
    active: true,
    lastSeen: '10 min ago',
    team: 'Postman',
    visibility: 'public',
    transportType: 'HTTP',
    authenticationType: 'API Key',
    passthroughHeaders: ['X-API-Key'],
  },
  {
    id: 5,
    name: 'Terraform',
    logoUrl: imgTerraform,
    url: 'https://terraform.io/mcp',
    description: 'MCP Server for HashiCorp Terraform, enabling infrastructure as code and automation',
    tags: ['infrastructure', 'automation', 'iac'],
    active: true,
    lastSeen: '5 min ago',
    team: 'HashiCorp',
    visibility: 'public',
    transportType: 'HTTP',
    authenticationType: 'API Key',
    passthroughHeaders: ['X-API-Key'],
  },
];

export function MCPServersPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [panelMode, setPanelMode] = useState<'add' | 'view'>('view');
  const [serversData, setServersData] = useState(sampleMCPServers);
  const [editedName, setEditedName] = useState('');
  const [editedUrl, setEditedUrl] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedVisibility, setEditedVisibility] = useState<'public' | 'team' | 'private'>('public');
  const [editedTransportType, setEditedTransportType] = useState('');
  const [editedAuthenticationType, setEditedAuthenticationType] = useState('');
  const [editedPassthroughHeaders, setEditedPassthroughHeaders] = useState<string[]>([]);
  const [isTransportDropdownOpen, setIsTransportDropdownOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [editedActive, setEditedActive] = useState(true);
  const [filters, setFilters] = useState<{
    names: string[];
    tags: string[];
    statuses: string[];
    transports: string[];
    authTypes: string[];
    visibilities: string[];
    teams: string[];
  }>({
    names: [],
    tags: [],
    statuses: [],
    transports: [],
    authTypes: [],
    visibilities: [],
    teams: []
  });
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [categorySearches, setCategorySearches] = useState<{[key: string]: string}>({});

  const { theme } = useTheme();

  // Extract unique values for each filter category
  const uniqueNames = [...new Set(serversData.map(s => s.name))];
  const uniqueTags = [...new Set(serversData.flatMap(s => s.tags))];
  const uniqueStatuses = ['Active', 'Inactive'];
  const uniqueTransports = [...new Set(serversData.map(s => s.transportType))];
  const uniqueAuthTypes = [...new Set(serversData.map(s => s.authenticationType))];
  const uniqueVisibilities = ['public', 'team', 'private'];
  const uniqueTeams = [...new Set(serversData.map(s => s.team))];

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const selectAllInCategory = (category: keyof typeof filters, items: string[]) => {
    setFilters(prev => ({
      ...prev,
      [category]: items
    }));
  };

  const deselectAllInCategory = (category: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [category]: []
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  // Filter data based on selected filters
  const filteredData = serversData.filter(server => {
    // Name filter
    if (filters.names.length > 0 && !filters.names.includes(server.name)) return false;
    
    // Tags filter
    if (filters.tags.length > 0 && !filters.tags.some(tag => server.tags.includes(tag))) return false;
    
    // Status filter
    if (filters.statuses.length > 0) {
      const isActive = server.active ? 'Active' : 'Inactive';
      if (!filters.statuses.includes(isActive)) return false;
    }
    
    // Transport filter
    if (filters.transports.length > 0 && !filters.transports.includes(server.transportType)) return false;
    
    // Auth Type filter
    if (filters.authTypes.length > 0 && !filters.authTypes.includes(server.authenticationType)) return false;
    
    // Visibility filter
    if (filters.visibilities.length > 0 && !filters.visibilities.includes(server.visibility)) return false;
    
    // Team filter
    if (filters.teams.length > 0 && !filters.teams.includes(server.team)) return false;
    
    return true;
  });

  const handleServerClick = (server: MCPServer) => {
    setSelectedServer(server);
    setPanelMode('view');
    setEditedName(server.name);
    setEditedUrl(server.url);
    setEditedDescription(server.description);
    setEditedTags([...server.tags]);
    setEditedVisibility(server.visibility);
    setEditedTransportType(server.transportType);
    setEditedAuthenticationType(server.authenticationType);
    setEditedPassthroughHeaders([...server.passthroughHeaders]);
    setEditedActive(server.active);
    setShowSidePanel(true);
  };

  const handleAddGatewayClick = () => {
    setEditedName('');
    setEditedUrl('');
    setEditedDescription('');
    setEditedTags([]);
    setEditedVisibility('public');
    setEditedTransportType('SSE');
    setEditedAuthenticationType('None');
    setEditedPassthroughHeaders([]);
    setPanelMode('add');
    setSelectedServer({} as MCPServer);
    setShowSidePanel(true);
  };

  const addTag = () => {
    setEditedTags([...editedTags, '']);
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...editedTags];
    newTags[index] = value;
    setEditedTags(newTags);
  };

  const removeTag = (index: number) => {
    setEditedTags(editedTags.filter((_, i) => i !== index));
  };

  const addHeader = () => {
    setEditedPassthroughHeaders([...editedPassthroughHeaders, '']);
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...editedPassthroughHeaders];
    newHeaders[index] = value;
    setEditedPassthroughHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setEditedPassthroughHeaders(editedPassthroughHeaders.filter((_, i) => i !== index));
  };

  const handleSaveGateway = () => {
    if (panelMode === 'add') {
      // Add new gateway
      const newGateway = {
        id: Math.max(...serversData.map(s => s.id)) + 1,
        name: editedName || 'New Gateway',
        logoUrl: imgAzure, // Default logo
        url: editedUrl || '',
        description: editedDescription || '',
        tags: editedTags,
        active: editedActive,
        lastSeen: 'Just now',
        team: 'My Team',
        visibility: editedVisibility,
        transportType: editedTransportType,
        authenticationType: editedAuthenticationType,
        passthroughHeaders: editedPassthroughHeaders
      };
      setServersData(prevData => [...prevData, newGateway]);
      toast.success(`"${newGateway.name}" added successfully`);
      setShowSidePanel(false);
    } else {
      // Save changes to existing gateway
      if (selectedServer) {
        setServersData(prevData =>
          prevData.map(server =>
            server.id === selectedServer.id
              ? {
                  ...server,
                  name: editedName,
                  url: editedUrl,
                  description: editedDescription,
                  tags: editedTags,
                  visibility: editedVisibility,
                  transportType: editedTransportType,
                  authenticationType: editedAuthenticationType,
                  passthroughHeaders: editedPassthroughHeaders,
                  active: editedActive
                }
              : server
          )
        );
        toast.success(`"${editedName}" updated successfully`);
        setShowSidePanel(false);
      }
    }
  };

  const toggleServerActive = (serverId: number) => {
    const server = serversData.find(s => s.id === serverId);
    if (!server) return;
    
    const wasActive = server.active;
    const previousData = [...serversData];
    
    setServersData(prevData => 
      prevData.map(s => 
        s.id === serverId 
          ? { ...s, active: !s.active }
          : s
      )
    );
    
    // Also update selectedServer if it's the one being toggled
    if (selectedServer?.id === serverId) {
      setSelectedServer({
        ...selectedServer,
        active: !selectedServer.active
      });
      setEditedActive(!selectedServer.active);
    }
    
    // Show confirmation toast with undo option only when deactivating
    if (wasActive) {
      toast.success(`"${server.name}" deactivated`, {
        description: 'The server has been deactivated',
        action: {
          label: 'Undo',
          onClick: () => {
            setServersData(previousData);
            if (selectedServer?.id === serverId) {
              setSelectedServer({ ...selectedServer, active: true });
              setEditedActive(true);
            }
            toast.info('Deactivation undone');
          },
        },
      });
    }
  };

  const duplicateServer = (serverId: number) => {
    const serverToDuplicate = serversData.find(s => s.id === serverId);
    if (serverToDuplicate) {
      const newServer = {
        ...serverToDuplicate,
        id: Math.max(...serversData.map(s => s.id)) + 1,
        name: `${serverToDuplicate.name} (Copy)`
      };
      setServersData(prevData => [...prevData, newServer]);
      toast.success(`"${newServer.name}" created successfully`);
    }
  };

  const deleteServer = (serverId: number) => {
    const serverToDelete = serversData.find(s => s.id === serverId);
    if (serverToDelete) {
      const deletedServerIndex = serversData.findIndex(s => s.id === serverId);
      
      // Remove the server
      setServersData(prevData => prevData.filter(s => s.id !== serverId));
      
      // Close side panel if the deleted server was selected
      if (selectedServer?.id === serverId) {
        setShowSidePanel(false);
        setSelectedServer(null);
      }
      
      // Show toast with undo option
      toast.success(`"${serverToDelete.name}" deleted`, {
        action: {
          label: 'Undo',
          onClick: () => {
            // Restore the server at its original position
            setServersData(prevData => {
              const newData = [...prevData];
              newData.splice(deletedServerIndex, 0, serverToDelete);
              return newData;
            });
            toast.success(`"${serverToDelete.name}" restored`);
          }
        },
        duration: 5000
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start p-[32px] pb-[24px] relative shrink-0 w-full">
          <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
            <p className={`basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[28px] min-h-px min-w-px not-italic relative shrink-0 text-[18px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              MCP Servers & Federated Gateways
            </p>
          </div>
          <p className={`font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            Register external MCP Servers (SSE/HTTP) to retrieve their tools/resources/prompts.
          </p>
        </div>

        <div className="p-[32px]">
          {/* Data Table */}
          <div className={`rounded-lg border-b border-l border-r overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
            {/* Table Toolbar */}
            <div className={`flex items-center justify-between gap-4 p-4 border-t border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                {/* View Toggle Buttons */}
                <div className={`flex items-center gap-1 p-1 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'table'
                        ? theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Table size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid'
                        ? theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>

                {/* Search Button */}
                <button className={`flex items-center justify-center size-[32px] border rounded-[6px] transition-colors ${theme === 'dark' ? 'bg-zinc-950 border-zinc-700 hover:bg-zinc-800' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}>
                  <Search size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                </button>

                {/* Filter Button */}
                <DropdownMenu>
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
                          {Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    className={`w-64 max-h-[500px] overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <DropdownMenuLabel className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Filter servers</DropdownMenuLabel>
                    <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
                    
                    {/* Name */}
                    <FilterCategory
                      label="Name"
                      items={uniqueNames}
                      selectedItems={filters.names}
                      onToggle={(name) => toggleFilter('names', name)}
                      theme={theme}
                      searchValue={categorySearches['names']}
                      onSearchChange={(value) => setCategorySearches(prev => ({ ...prev, names: value }))}
                      expanded={expandedCategories['names']}
                      onExpandChange={(expanded) => setExpandedCategories(prev => ({ ...prev, names: expanded }))}
                      onSelectAll={() => selectAllInCategory('names', uniqueNames)}
                      onDeselectAll={() => deselectAllInCategory('names')}
                    />
                    
                    {/* Tags */}
                    <FilterCategory
                      label="Tags"
                      items={uniqueTags}
                      selectedItems={filters.tags}
                      onToggle={(tag) => toggleFilter('tags', tag)}
                      theme={theme}
                      searchValue={categorySearches['tags']}
                      onSearchChange={(value) => setCategorySearches(prev => ({ ...prev, tags: value }))}
                      expanded={expandedCategories['tags']}
                      onExpandChange={(expanded) => setExpandedCategories(prev => ({ ...prev, tags: expanded }))}
                      onSelectAll={() => selectAllInCategory('tags', uniqueTags)}
                      onDeselectAll={() => deselectAllInCategory('tags')}
                    />
                    
                    {/* Status */}
                    <FilterCategory
                      label="Status"
                      items={uniqueStatuses}
                      selectedItems={filters.statuses}
                      onToggle={(status) => toggleFilter('statuses', status)}
                      theme={theme}
                      onSelectAll={() => selectAllInCategory('statuses', uniqueStatuses)}
                      onDeselectAll={() => deselectAllInCategory('statuses')}
                    />
                    
                    {/* Transport Type */}
                    <FilterCategory
                      label="Transport Type"
                      items={uniqueTransports}
                      selectedItems={filters.transports}
                      onToggle={(transport) => toggleFilter('transports', transport)}
                      theme={theme}
                      onSelectAll={() => selectAllInCategory('transports', uniqueTransports)}
                      onDeselectAll={() => deselectAllInCategory('transports')}
                    />
                    
                    {/* Authentication Type */}
                    <FilterCategory
                      label="Authentication Type"
                      items={uniqueAuthTypes}
                      selectedItems={filters.authTypes}
                      onToggle={(authType) => toggleFilter('authTypes', authType)}
                      theme={theme}
                      onSelectAll={() => selectAllInCategory('authTypes', uniqueAuthTypes)}
                      onDeselectAll={() => deselectAllInCategory('authTypes')}
                    />
                    
                    {/* Visibility */}
                    <FilterCategory
                      label="Visibility"
                      items={uniqueVisibilities}
                      selectedItems={filters.visibilities}
                      onToggle={(visibility) => toggleFilter('visibilities', visibility)}
                      theme={theme}
                      transformLabel={(item) => item.charAt(0).toUpperCase() + item.slice(1)}
                      onSelectAll={() => selectAllInCategory('visibilities', uniqueVisibilities)}
                      onDeselectAll={() => deselectAllInCategory('visibilities')}
                    />
                    
                    {/* Team */}
                    <FilterCategory
                      label="Team"
                      items={uniqueTeams}
                      selectedItems={filters.teams}
                      onToggle={(team) => toggleFilter('teams', team)}
                      theme={theme}
                      onSelectAll={() => selectAllInCategory('teams', uniqueTeams)}
                      onDeselectAll={() => deselectAllInCategory('teams')}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Add Gateway Button */}
              <button 
                onClick={handleAddGatewayClick}
                className="bg-gradient-to-r from-orange-500 to-orange-600 box-border content-stretch flex gap-[6px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[6px] shrink-0 hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
              >
                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[13px] text-white text-nowrap whitespace-pre">
                  Add Gateway
                </p>
              </button>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <table className="w-full">
                <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Name</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>URL</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Description</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Tags</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium w-12 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((server) => (
                    <tr
                      key={server.id}
                      onClick={() => handleServerClick(server)}
                      className={`border-b last:border-b-0 transition-colors cursor-pointer ${
                        selectedServer?.id === server.id
                          ? theme === 'dark'
                            ? 'bg-cyan-950/20 border-cyan-800/50'
                            : 'bg-cyan-50 border-cyan-200'
                          : theme === 'dark' 
                            ? 'border-zinc-800 hover:bg-zinc-800/50' 
                            : 'border-gray-200 hover:bg-gray-50'
                      } ${selectedServer?.id === server.id ? 'border-l-4 border-l-cyan-500' : ''}`}
                    >
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-3">
                          <div className="size-8 flex items-center justify-center shrink-0">
                            <ImageWithFallback
                              src={server.logoUrl}
                              alt={`${server.name} logo`}
                              className="max-w-8 max-h-8 w-auto h-auto object-contain"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{server.name}</span>
                            <div className={`size-2 rounded-full shrink-0 ${server.active ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-400'}`} title={server.active ? 'Active' : 'Inactive'}></div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                        {server.url}
                      </td>
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                        {server.description}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {server.tags.map((tag, idx) => {
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
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'}`}>
                              <MoreVertical size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleServerActive(server.id);
                              }}
                              className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                            >
                              <Power size={14} className="mr-2" />
                              {server.active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleServerClick(server);
                              }}
                              className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                            >
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateServer(server.id);
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
                                deleteServer(server.id);
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
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((server) => (
                  <div
                    key={server.id}
                    onClick={() => handleServerClick(server)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                      theme === 'dark'
                        ? 'bg-zinc-900/50 border-zinc-800 hover:border-cyan-500'
                        : 'bg-white border-gray-200 hover:border-cyan-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="size-8 flex items-center justify-center shrink-0">
                          <ImageWithFallback
                            src={server.logoUrl}
                            alt={`${server.name} logo`}
                            className="max-w-8 max-h-8 w-auto h-auto object-contain"
                          />
                        </div>
                        <h3 className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {server.name}
                        </h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className={`p-1 rounded hover:bg-zinc-800 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleServerActive(server.id);
                            }}
                            className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                          >
                            <Power size={14} className="mr-2" />
                            {server.active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleServerClick(server);
                            }}
                            className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                          >
                            <Pencil size={14} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateServer(server.id);
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
                              deleteServer(server.id);
                            }}
                            className={`cursor-pointer ${theme === 'dark' ? 'text-red-400 hover:bg-zinc-800' : 'text-red-600 hover:bg-gray-100'}`}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                      {server.url}
                    </p>
                    
                    <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      {server.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {server.tags.map((tag, idx) => {
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

                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${server.active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                        {server.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Panel */}
      {showSidePanel && (
        <div className={`w-[500px] border-l shadow-xl flex flex-col ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
          {/* Sticky Header */}
          <div className={`p-6 pb-4 border-b sticky top-0 z-10 ${theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {panelMode === 'add' ? 'Add New Gateway' : 'MCP Server Details'}
              </h2>
              <button 
                onClick={() => setShowSidePanel(false)}
                className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'}`}
              >
                <X size={20} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* Logo, Name and Toggle Header */}
              {panelMode === 'view' && selectedServer && (
                <div className="flex items-start gap-4 pb-4">
                  {/* Logo */}
                  <div className={`size-12 flex items-center justify-center shrink-0`}>
                    <ImageWithFallback
                      src={selectedServer.logoUrl}
                      alt={`${selectedServer.name} logo`}
                      className="max-w-10 max-h-10 w-auto h-auto object-contain"
                    />
                  </div>
                  
                  {/* Name, URL and Toggle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {editedName}
                      </h3>
                      <Switch
                        checked={editedActive}
                        onCheckedChange={setEditedActive}
                        className="data-[state=checked]:bg-cyan-500"
                      />
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                      {editedUrl}
                    </p>
                  </div>
                </div>
              )}

              {/* Add mode - show input fields for name and URL */}
              {panelMode === 'add' && (
                <>
                  {/* MCP Server Name */}
                  <div>
                    <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                      MCP Server Name
                    </label>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="e.g., Azure MCP Server"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                    />
                  </div>

                  {/* MCP Server URL */}
                  <div>
                    <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                      MCP Server URL
                    </label>
                    <input
                      type="text"
                      value={editedUrl}
                      onChange={(e) => setEditedUrl(e.target.value)}
                      placeholder="https://api.example.com/mcp"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                    />
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe this MCP server..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                />
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
                      onChange={(e) => setEditedVisibility(e.target.value as any)}
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
                      onChange={(e) => setEditedVisibility(e.target.value as any)}
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
                      onChange={(e) => setEditedVisibility(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Private</span>
                  </label>
                </div>
              </div>

              {/* Transport Type */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Transport Type
                </label>
                <div className="relative">
                  <div className={`relative rounded-md w-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setIsTransportDropdownOpen(!isTransportDropdownOpen)}
                      className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800/30' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                    >
                      <span className={`text-sm ${!editedTransportType && (theme === 'dark' ? 'text-zinc-500' : 'text-gray-400')}`}>
                        {editedTransportType || 'Select Transport Type'}
                      </span>
                      <ChevronDown size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                    </button>
                  </div>
                  
                  {isTransportDropdownOpen && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-md border shadow-lg z-50 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                      {['SSE', 'Streamable HTTP'].map((type) => (
                        <div
                          key={type}
                          className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                            editedTransportType === type 
                              ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                              : theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setEditedTransportType(type);
                            setIsTransportDropdownOpen(false);
                          }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Authentication Type */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Authentication Type
                </label>
                <div className="relative">
                  <div className={`relative rounded-md w-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                      className={`w-full px-3 py-2 border rounded-md text-left flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800/30' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                    >
                      <span className={`text-sm ${!editedAuthenticationType && (theme === 'dark' ? 'text-zinc-500' : 'text-gray-400')}`}>
                        {editedAuthenticationType || 'Select Authentication Type'}
                      </span>
                      <ChevronDown size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                    </button>
                  </div>
                  
                  {isAuthDropdownOpen && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-md border shadow-lg z-50 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                      {['Basic', 'Bearer Token', 'Custom Headers', 'OAuth 2.0'].map((type) => (
                        <div
                          key={type}
                          className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                            editedAuthenticationType === type 
                              ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                              : theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setEditedAuthenticationType(type);
                            setIsAuthDropdownOpen(false);
                          }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Passthrough Headers */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Passthrough Headers
                </label>
                <input
                  type="text"
                  value={editedPassthroughHeaders.join(', ')}
                  onChange={(e) => setEditedPassthroughHeaders(e.target.value.split(',').map(h => h.trim()).filter(h => h))}
                  placeholder="e.g., Authorization, X-Tenant-Id, X-Trace-Id"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  List of headers to pass through from client requests (comma-separated, e.g., "Authorization, X-Tenant-Id, X-Trace-Id"). Leave empty to use global defaults.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className={`p-6 pt-4 border-t sticky bottom-0 z-10 ${theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSidePanel(false)}
                className={`flex-1 px-4 py-2 rounded-md transition-colors border ${theme === 'dark' ? 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveGateway}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-md hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
              >
                {panelMode === 'add' ? 'Add Gateway' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}