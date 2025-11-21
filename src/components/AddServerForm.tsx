import { useState } from 'react';
import { Search, MoreVertical, X, Filter, LayoutGrid, Table, Pencil, Power, Copy, Trash2, ChevronDown, Check } from 'lucide-react';
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
import { toast } from 'sonner';

// Available options for multi-select dropdowns
const AVAILABLE_TOOLS = [
  'Gmail API',
  'Email Parser',
  'Calendar Sync',
  'Discord API',
  'Message Handler',
  'Role Manager',
  'Build Pipeline',
  'Asset Optimizer',
  'Deploy Manager',
  'Data Collector',
  'Chart Generator',
  'Report Builder',
  'File Uploader',
  'Image Processor',
  'Text Analyzer',
  'Code Formatter',
  'Database Manager',
  'Cache Handler'
];

const AVAILABLE_RESOURCES = [
  'Email Templates',
  'Contact List',
  'Signature Database',
  'Server Config',
  'Welcome Messages',
  'Command List',
  'Site Templates',
  'Component Library',
  'Style Guide',
  'Dashboard Templates',
  'Metric Definitions',
  'Query Library',
  'API Documentation',
  'User Manual',
  'Training Videos',
  'FAQ Database'
];

const AVAILABLE_PROMPTS = [
  'Draft Email',
  'Schedule Meeting',
  'Search Contacts',
  'Moderate Chat',
  'Send Announcement',
  'User Stats',
  'Build Site',
  'Deploy to Production',
  'Run Tests',
  'Generate Report',
  'Analyze Trends',
  'Export Data',
  'Create Backup',
  'Restore Data',
  'Send Notification',
  'Update Settings'
];

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

const sampleData = [
  {
    uuid: 'a1b2c3d4-e5f6-4789',
    name: 'Gmail Server',
    description: 'Access Gmail API for email management',
    tags: ['Communication', 'Productivity'],
    logo: '📧',
    logoColor: 'bg-red-500',
    active: true,
    owner: 'john.doe@example.com',
    team: 'Engineering',
    visibility: 'team' as const,
    associatedTools: ['Gmail API', 'Email Parser', 'Calendar Sync'],
    associatedResources: ['Email Templates', 'Contact List', 'Signature Database'],
    associatedPrompts: ['Draft Email', 'Schedule Meeting', 'Search Contacts']
  },
  {
    uuid: 'f7g8h9i0-j1k2-3456',
    name: 'Discord Bot',
    description: 'Discord bot for community management',
    tags: ['Communication'],
    logo: '💬',
    logoColor: 'bg-indigo-500',
    active: true,
    owner: 'jane.smith@example.com',
    team: 'Community',
    visibility: 'public' as const,
    associatedTools: ['Discord API', 'Message Handler', 'Role Manager'],
    associatedResources: ['Server Config', 'Welcome Messages', 'Command List'],
    associatedPrompts: ['Moderate Chat', 'Send Announcement', 'User Stats']
  },
  {
    uuid: 'm3n4o5p6-q7r8-9012',
    name: 'Astro Server',
    description: 'Static site generation and deployment',
    tags: ['Development', 'Web'],
    logo: '🚀',
    logoColor: 'bg-purple-500',
    active: false,
    owner: 'dev.user@example.com',
    team: 'Frontend',
    visibility: 'private' as const,
    associatedTools: ['Build Pipeline', 'Asset Optimizer', 'Deploy Manager'],
    associatedResources: ['Site Templates', 'Component Library', 'Style Guide'],
    associatedPrompts: ['Build Site', 'Deploy to Production', 'Run Tests']
  },
  {
    uuid: 's9t0u1v2-w3x4-5678',
    name: 'Analytics API',
    description: 'Real-time analytics and metrics tracking',
    tags: ['Analytics', 'Monitoring'],
    logo: '📊',
    logoColor: 'bg-blue-500',
    active: true,
    owner: 'analytics@example.com',
    team: 'Data',
    visibility: 'team' as const,
    associatedTools: ['Data Collector', 'Chart Generator', 'Report Builder'],
    associatedResources: ['Dashboard Templates', 'Metric Definitions', 'Query Library'],
    associatedPrompts: ['Generate Report', 'Analyze Trends', 'Export Data']
  }
];

export function AddServerForm() {
  const [uuid, setUuid] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [panelMode, setPanelMode] = useState<'add' | 'view'>('add');
  const [selectedServer, setSelectedServer] = useState<typeof sampleData[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState<string[]>(['name', 'uuid', 'description', 'tags']);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [serversData, setServersData] = useState(sampleData);
  const [editedTools, setEditedTools] = useState<string[]>([]);
  const [editedResources, setEditedResources] = useState<string[]>([]);
  const [editedPrompts, setEditedPrompts] = useState<string[]>([]);
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedVisibility, setEditedVisibility] = useState<'public' | 'team' | 'private'>('public');
  const [editedActive, setEditedActive] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingUuid, setEditingUuid] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedUuid, setEditedUuid] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [filters, setFilters] = useState<{
    names: string[];
    tags: string[];
    statuses: string[];
    tools: string[];
    resources: string[];
    prompts: string[];
    visibilities: string[];
    owners: string[];
    teams: string[];
  }>({
    names: [],
    tags: [],
    statuses: [],
    tools: [],
    resources: [],
    prompts: [],
    visibilities: [],
    owners: [],
    teams: []
  });
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [categorySearches, setCategorySearches] = useState<{[key: string]: string}>({});
  const [toolsSearch, setToolsSearch] = useState('');
  const [resourcesSearch, setResourcesSearch] = useState('');
  const [promptsSearch, setPromptsSearch] = useState('');

  const { theme } = useTheme();

  // Extract unique values for each filter category
  const uniqueNames = [...new Set(serversData.map(s => s.name))];
  const uniqueTags = [...new Set(serversData.flatMap(s => s.tags))];
  const uniqueStatuses = ['Active', 'Inactive'];
  const uniqueTools = [...new Set(serversData.flatMap(s => s.associatedTools))];
  const uniqueResources = [...new Set(serversData.flatMap(s => s.associatedResources))];
  const uniquePrompts = [...new Set(serversData.flatMap(s => s.associatedPrompts))];
  const uniqueVisibilities = ['public', 'team', 'private'];
  const uniqueOwners = [...new Set(serversData.map(s => s.owner))];
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
    
    // Tools filter
    if (filters.tools.length > 0 && !filters.tools.some(tool => server.associatedTools.includes(tool))) return false;
    
    // Resources filter
    if (filters.resources.length > 0 && !filters.resources.some(resource => server.associatedResources.includes(resource))) return false;
    
    // Prompts filter
    if (filters.prompts.length > 0 && !filters.prompts.some(prompt => server.associatedPrompts.includes(prompt))) return false;
    
    // Visibility filter
    if (filters.visibilities.length > 0 && !filters.visibilities.includes(server.visibility)) return false;
    
    // Owner filter
    if (filters.owners.length > 0 && !filters.owners.includes(server.owner)) return false;
    
    // Team filter
    if (filters.teams.length > 0 && !filters.teams.includes(server.team)) return false;
    
    return true;
  });

  const handleServerClick = (server: typeof sampleData[0]) => {
    setSelectedServer(server);
    setEditedTools([...server.associatedTools]);
    setEditedResources([...server.associatedResources]);
    setEditedPrompts([...server.associatedPrompts]);
    setEditedTags([...server.tags]);
    setEditedVisibility(server.visibility);
    setEditedActive(server.active);
    setEditedName(server.name);
    setEditedUuid(server.uuid);
    setEditedDescription(server.description);
    setEditingName(false);
    setEditingUuid(false);
    setEditingDescription(false);
    setPanelMode('view');
    setShowSidePanel(true);
  };

  const handleAddServerClick = () => {
    setSelectedServer(null);
    setEditedName('');
    setEditedUuid('');
    setEditedDescription('');
    setEditedTools([]);
    setEditedResources([]);
    setEditedPrompts([]);
    setEditedTags([]);
    setEditedVisibility('public');
    setPanelMode('add');
    setShowSidePanel(true);
  };

  const handleSaveServer = () => {
    if (panelMode === 'add') {
      // Add new server
      const newServer = {
        uuid: editedUuid || `server-${Date.now()}`,
        name: editedName || 'New Server',
        description: editedDescription || '',
        tags: editedTags,
        logo: '🔧',
        logoColor: 'bg-blue-500',
        active: true,
        owner: 'current.user@example.com',
        team: 'My Team',
        visibility: editedVisibility,
        associatedTools: editedTools,
        associatedResources: editedResources,
        associatedPrompts: editedPrompts
      };
      setServersData(prevData => [...prevData, newServer]);
      toast.success(`"${newServer.name}" added successfully`);
      setShowSidePanel(false);
    } else {
      // Save changes to existing server
      if (selectedServer) {
        setServersData(prevData =>
          prevData.map(server =>
            server.uuid === selectedServer.uuid
              ? {
                  ...server,
                  name: editedName,
                  uuid: editedUuid,
                  description: editedDescription,
                  tags: editedTags,
                  visibility: editedVisibility,
                  associatedTools: editedTools,
                  associatedResources: editedResources,
                  associatedPrompts: editedPrompts
                }
              : server
          )
        );
        toast.success(`"${editedName}" updated successfully`);
        setShowSidePanel(false);
      }
    }
  };

  const toggleTool = (tool: string) => {
    if (editedTools.includes(tool)) {
      setEditedTools(editedTools.filter(t => t !== tool));
    } else {
      setEditedTools([...editedTools, tool]);
    }
  };

  const removeTool = (tool: string) => {
    setEditedTools(editedTools.filter(t => t !== tool));
  };

  const toggleResource = (resource: string) => {
    if (editedResources.includes(resource)) {
      setEditedResources(editedResources.filter(r => r !== resource));
    } else {
      setEditedResources([...editedResources, resource]);
    }
  };

  const removeResource = (resource: string) => {
    setEditedResources(editedResources.filter(r => r !== resource));
  };

  const togglePrompt = (prompt: string) => {
    if (editedPrompts.includes(prompt)) {
      setEditedPrompts(editedPrompts.filter(p => p !== prompt));
    } else {
      setEditedPrompts([...editedPrompts, prompt]);
    }
  };

  const removePrompt = (prompt: string) => {
    setEditedPrompts(editedPrompts.filter(p => p !== prompt));
  };

  const removeTag = (index: number) => {
    setEditedTags(editedTags.filter((_, i) => i !== index));
  };

  const toggleServerActive = (serverUuid: string) => {
    const server = serversData.find(s => s.uuid === serverUuid);
    if (!server) return;
    
    const wasActive = server.active;
    const previousData = [...serversData];
    
    setServersData(prevData => 
      prevData.map(s => 
        s.uuid === serverUuid 
          ? { ...s, active: !s.active }
          : s
      )
    );
    
    // Also update selectedServer if it's the one being toggled
    if (selectedServer?.uuid === serverUuid) {
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
            if (selectedServer?.uuid === serverUuid) {
              setSelectedServer({ ...selectedServer, active: true });
              setEditedActive(true);
            }
            toast.info('Deactivation undone');
          },
        },
      });
    }
  };

  const duplicateServer = (serverUuid: string) => {
    const serverToDuplicate = serversData.find(s => s.uuid === serverUuid);
    if (serverToDuplicate) {
      const newServer = {
        ...serverToDuplicate,
        uuid: `${serverToDuplicate.uuid}-copy-${Date.now()}`,
        name: `${serverToDuplicate.name} (Copy)`
      };
      setServersData(prevData => [...prevData, newServer]);
      toast.success(`"${newServer.name}" created successfully`);
    }
  };

  const deleteServer = (serverUuid: string) => {
    const serverToDelete = serversData.find(s => s.uuid === serverUuid);
    if (serverToDelete) {
      const deletedServerIndex = serversData.findIndex(s => s.uuid === serverUuid);
      
      // Remove the server
      setServersData(prevData => prevData.filter(s => s.uuid !== serverUuid));
      
      // Close side panel if the deleted server was selected
      if (selectedServer?.uuid === serverUuid) {
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
              Virtual MCP Servers
            </p>
          </div>
          <p className={`font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
            Virtual Servers let you combine Tools, Resources, and Prompts into an MCP Server with its own API key (see API Tokens).
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
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'card'
                        ? theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-white text-gray-900 shadow-sm'
                        : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>

                {/* Search Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center justify-center size-[32px] border rounded-[6px] transition-colors ${theme === 'dark' ? 'bg-zinc-950 border-zinc-700 hover:bg-zinc-800' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}>
                      <Search size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className={`w-80 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                    <div className="p-2">
                      <div className={`flex items-center gap-2 px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-950 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                        <Search size={14} className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'} strokeWidth={1.5} />
                        <input 
                          type="text"
                          placeholder="Search servers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`flex-1 font-['JetBrains_Mono:Regular',sans-serif] font-normal text-[14px] bg-transparent border-none outline-none ${theme === 'dark' ? 'text-white placeholder:text-zinc-500' : 'text-gray-900 placeholder:text-gray-400'}`}
                        />
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

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
                    
                    {/* Tools */}
                    <FilterCategory
                      label="Tools"
                      items={uniqueTools}
                      selectedItems={filters.tools}
                      onToggle={(tool) => toggleFilter('tools', tool)}
                      theme={theme}
                      searchValue={categorySearches['tools']}
                      onSearchChange={(value) => setCategorySearches(prev => ({ ...prev, tools: value }))}
                      expanded={expandedCategories['tools']}
                      onExpandChange={(expanded) => setExpandedCategories(prev => ({ ...prev, tools: expanded }))}
                      onSelectAll={() => selectAllInCategory('tools', uniqueTools)}
                      onDeselectAll={() => deselectAllInCategory('tools')}
                    />
                    
                    {/* Resources */}
                    <FilterCategory
                      label="Resources"
                      items={uniqueResources}
                      selectedItems={filters.resources}
                      onToggle={(resource) => toggleFilter('resources', resource)}
                      theme={theme}
                      searchValue={categorySearches['resources']}
                      onSearchChange={(value) => setCategorySearches(prev => ({ ...prev, resources: value }))}
                      expanded={expandedCategories['resources']}
                      onExpandChange={(expanded) => setExpandedCategories(prev => ({ ...prev, resources: expanded }))}
                      onSelectAll={() => selectAllInCategory('resources', uniqueResources)}
                      onDeselectAll={() => deselectAllInCategory('resources')}
                    />
                    
                    {/* Prompts */}
                    <FilterCategory
                      label="Prompts"
                      items={uniquePrompts}
                      selectedItems={filters.prompts}
                      onToggle={(prompt) => toggleFilter('prompts', prompt)}
                      theme={theme}
                      searchValue={categorySearches['prompts']}
                      onSearchChange={(value) => setCategorySearches(prev => ({ ...prev, prompts: value }))}
                      expanded={expandedCategories['prompts']}
                      onExpandChange={(expanded) => setExpandedCategories(prev => ({ ...prev, prompts: expanded }))}
                      onSelectAll={() => selectAllInCategory('prompts', uniquePrompts)}
                      onDeselectAll={() => deselectAllInCategory('prompts')}
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
                    
                    {/* Owner */}
                    <FilterCategory
                      label="Owner"
                      items={uniqueOwners}
                      selectedItems={filters.owners}
                      onToggle={(owner) => toggleFilter('owners', owner)}
                      theme={theme}
                      searchValue={categorySearches['owners']}
                      onSearchChange={(value) => setCategorySearches(prev => ({ ...prev, owners: value }))}
                      expanded={expandedCategories['owners']}
                      onExpandChange={(expanded) => setExpandedCategories(prev => ({ ...prev, owners: expanded }))}
                      onSelectAll={() => selectAllInCategory('owners', uniqueOwners)}
                      onDeselectAll={() => deselectAllInCategory('owners')}
                    />
                    
                    {/* Team */}
                    <FilterCategory
                      label="Team"
                      items={uniqueTeams}
                      selectedItems={filters.teams}
                      onToggle={(team) => toggleFilter('teams', team)}
                      theme={theme}
                      searchValue={categorySearches['teams']}
                      onSearchChange={(value) => setCategorySearches(prev => ({ ...prev, teams: value }))}
                      expanded={expandedCategories['teams']}
                      onExpandChange={(expanded) => setExpandedCategories(prev => ({ ...prev, teams: expanded }))}
                      onSelectAll={() => selectAllInCategory('teams', uniqueTeams)}
                      onDeselectAll={() => deselectAllInCategory('teams')}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Add Server Button */}
              <button 
                onClick={handleAddServerClick}
                className="bg-gradient-to-r from-orange-500 to-orange-600 box-border content-stretch flex gap-[6px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[6px] shrink-0 hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
              >
                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[13px] text-white text-nowrap whitespace-pre">
                  Add Server
                </p>
              </button>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <table className="w-full">
                <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Name</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>UUID</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Description</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Tags</th>
                    <th className={`text-left px-4 py-3 text-sm font-medium w-12 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr 
                      key={row.uuid} 
                      className={`border-b last:border-b-0 transition-colors cursor-pointer relative ${
                        selectedServer?.uuid === row.uuid
                          ? theme === 'dark'
                            ? 'bg-cyan-950/20 border-cyan-800/50'
                            : 'bg-cyan-50 border-cyan-200'
                          : theme === 'dark' 
                            ? 'border-zinc-800 hover:bg-zinc-800/50' 
                            : 'border-gray-200 hover:bg-gray-50'
                      } ${selectedServer?.uuid === row.uuid ? 'border-l-4 border-l-cyan-500' : ''}`}
                      onClick={() => handleServerClick(row)}
                    >
                      <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`${row.logoColor} rounded-md size-8 flex items-center justify-center text-lg shrink-0`}>
                            {row.logo}
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{row.name}</span>
                            <div className={`size-2 rounded-full shrink-0 ${row.active ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-400'}`} title={row.active ? 'Active' : 'Inactive'}></div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-5 text-sm font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>{row.uuid}</td>
                      <td className={`px-4 py-5 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>{row.description}</td>
                      <td className="px-4 py-5">
                        <div className="flex gap-2 flex-wrap">
                          {row.tags.map((tag) => {
                            const colors = getTagColor(tag, theme);
                            return (
                              <span 
                                key={tag}
                                className={`${colors.bg} ${colors.text} ${colors.border} border px-3 py-1 rounded-full text-xs font-medium`}
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
                            <button className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'}`} onClick={(e) => e.stopPropagation()}>
                              <MoreVertical size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleServerActive(row.uuid);
                              }}
                              className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                            >
                              <Power size={14} className="mr-2" />
                              {row.active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleServerClick(row);
                              }}
                              className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                            >
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateServer(row.uuid);
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
                                deleteServer(row.uuid);
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

            {/* Card View */}
            {viewMode === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredData.map((item) => (
                  <div 
                    key={item.uuid}
                    className={`border rounded-lg p-4 transition-all cursor-pointer relative ${
                      selectedServer?.uuid === item.uuid
                        ? theme === 'dark'
                          ? 'bg-cyan-950/20 border-cyan-500'
                          : 'bg-cyan-50 border-cyan-500'
                        : theme === 'dark' 
                          ? 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800/30' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } ${selectedServer?.uuid === item.uuid ? 'border-l-4 border-l-cyan-500' : ''}`}
                    onClick={() => handleServerClick(item)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`${item.logoColor} rounded-md size-10 flex items-center justify-center text-xl shrink-0`}>
                          {item.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                            <div className={`size-2 rounded-full shrink-0 ${item.active ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-400'}`} title={item.active ? 'Active' : 'Inactive'}></div>
                          </div>
                          <p className={`text-xs font-mono mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>{item.uuid}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'}`} onClick={(e) => e.stopPropagation()}>
                            <MoreVertical size={18} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleServerActive(item.uuid);
                            }}
                            className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                          >
                            <Power size={14} className="mr-2" />
                            {item.active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleServerClick(item);
                            }}
                            className={`cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-zinc-800' : 'text-gray-900 hover:bg-gray-100'}`}
                          >
                            <Pencil size={14} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateServer(item.uuid);
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
                              deleteServer(item.uuid);
                            }}
                            className={`cursor-pointer ${theme === 'dark' ? 'text-red-400 hover:bg-zinc-800' : 'text-red-600 hover:bg-gray-100'}`}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                    
                    <div className="flex gap-2 flex-wrap">
                      {item.tags.map((tag) => {
                        const colors = getTagColor(tag, theme);
                        return (
                          <span 
                            key={tag}
                            className={`${colors.bg} ${colors.text} ${colors.border} border px-3 py-1 rounded-full text-xs font-medium`}
                          >
                            {tag}
                          </span>
                        );
                      })}
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
              <h2 className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{panelMode === 'add' ? 'Add New Server' : 'View Server'}</h2>
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
            {panelMode === 'view' && selectedServer ? (
              /* View Mode */
              <div className="space-y-6">
                {/* Server Icon and Name */}
                <div className={`flex items-center gap-4 pb-6 border-b ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                  <div className={`${selectedServer.logoColor} rounded-lg size-16 flex items-center justify-center text-3xl shrink-0 relative cursor-pointer group transition-all hover:brightness-90`}>
                    {selectedServer.logo}
                    <div className={`absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'bg-black/50' : 'bg-white/50'}`}>
                      <Pencil size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {editingName ? (
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          onBlur={() => {
                            setEditingName(false);
                            if (selectedServer) {
                              setSelectedServer({ ...selectedServer, name: editedName });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingName(false);
                              if (selectedServer) {
                                setSelectedServer({ ...selectedServer, name: editedName });
                              }
                            }
                          }}
                          autoFocus
                          className={`text-2xl px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        />
                      ) : (
                        <h3
                          onClick={() => setEditingName(true)}
                          className={`text-2xl cursor-pointer hover:opacity-70 transition-opacity ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                        >
                          {selectedServer.name}
                        </h3>
                      )}
                      <Switch
                        checked={selectedServer.active}
                        onCheckedChange={() => toggleServerActive(selectedServer.uuid)}
                        className="scale-75 data-[state=checked]:bg-cyan-500"
                      />
                    </div>
                    {editingUuid ? (
                      <input
                        type="text"
                        value={editedUuid}
                        onChange={(e) => setEditedUuid(e.target.value)}
                        onBlur={() => {
                          setEditingUuid(false);
                          if (selectedServer) {
                            setSelectedServer({ ...selectedServer, uuid: editedUuid });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingUuid(false);
                            if (selectedServer) {
                              setSelectedServer({ ...selectedServer, uuid: editedUuid });
                            }
                          }
                        }}
                        autoFocus
                        className={`text-sm font-mono px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-zinc-500' : 'bg-white border-gray-200 text-gray-500'}`}
                      />
                    ) : (
                      <p
                        onClick={() => setEditingUuid(true)}
                        className={`text-sm font-mono cursor-pointer hover:opacity-70 transition-opacity ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}
                      >
                        {selectedServer.uuid}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Description</label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Describe this server..."
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                  />
                </div>

                {/* Associated Tools */}
                <div>
                  <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Associated Tools ({editedTools.length})</label>
                  <div className={`border rounded-md p-4 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex flex-wrap gap-2 items-start">
                      {editedTools.map((tool) => (
                        <div key={tool} className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                          <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tool}</span>
                          <button
                            type="button"
                            onClick={() => removeTool(tool)}
                            className={`rounded transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-400 hover:text-gray-700'}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={`flex items-center gap-1 px-2.5 py-1 border rounded-md text-sm transition-colors ${
                              theme === 'dark' 
                                ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300' 
                                : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                          >
                            Add tool
                            <ChevronDown size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="start" 
                          className={`w-64 max-h-80 overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
                        >
                          <div className="px-2 py-2 sticky top-0 bg-inherit">
                            <input
                              type="text"
                              placeholder="Search tools..."
                              value={toolsSearch}
                              onChange={(e) => {
                                e.stopPropagation();
                                setToolsSearch(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`w-full px-2 py-1 text-xs rounded border ${
                                theme === 'dark' 
                                  ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                              }`}
                            />
                          </div>
                          {AVAILABLE_TOOLS.filter(tool => 
                            tool.toLowerCase().includes(toolsSearch.toLowerCase())
                          ).map((tool) => {
                            const isSelected = editedTools.includes(tool);
                            return (
                              <div
                                key={tool}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTool(tool);
                                }}
                                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${
                                  theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
                                }`}
                              >
                                <div className={`flex items-center justify-center w-4 h-4 rounded border ${
                                  isSelected
                                    ? theme === 'dark' 
                                      ? 'bg-cyan-500 border-cyan-500' 
                                      : 'bg-cyan-600 border-cyan-600'
                                    : theme === 'dark'
                                      ? 'border-zinc-600'
                                      : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {tool}
                                </span>
                              </div>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Associated Resources */}
                <div>
                  <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Associated Resources ({editedResources.length})</label>
                  <div className={`border rounded-md p-4 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex flex-wrap gap-2 items-start">
                      {editedResources.map((resource) => (
                        <div key={resource} className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                          <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{resource}</span>
                          <button
                            type="button"
                            onClick={() => removeResource(resource)}
                            className={`rounded transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-400 hover:text-gray-700'}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={`flex items-center gap-1 px-2.5 py-1 border rounded-md text-sm transition-colors ${
                              theme === 'dark' 
                                ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300' 
                                : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                          >
                            Add resource
                            <ChevronDown size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="start" 
                          className={`w-64 max-h-80 overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
                        >
                          <div className="px-2 py-2 sticky top-0 bg-inherit">
                            <input
                              type="text"
                              placeholder="Search resources..."
                              value={resourcesSearch}
                              onChange={(e) => {
                                e.stopPropagation();
                                setResourcesSearch(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`w-full px-2 py-1 text-xs rounded border ${
                                theme === 'dark' 
                                  ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                              }`}
                            />
                          </div>
                          {AVAILABLE_RESOURCES.filter(resource => 
                            resource.toLowerCase().includes(resourcesSearch.toLowerCase())
                          ).map((resource) => {
                            const isSelected = editedResources.includes(resource);
                            return (
                              <div
                                key={resource}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleResource(resource);
                                }}
                                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${
                                  theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
                                }`}
                              >
                                <div className={`flex items-center justify-center w-4 h-4 rounded border ${
                                  isSelected
                                    ? theme === 'dark' 
                                      ? 'bg-cyan-500 border-cyan-500' 
                                      : 'bg-cyan-600 border-cyan-600'
                                    : theme === 'dark'
                                      ? 'border-zinc-600'
                                      : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {resource}
                                </span>
                              </div>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Associated Prompts */}
                <div>
                  <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Associated Prompts ({editedPrompts.length})</label>
                  <div className={`border rounded-md p-4 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex flex-wrap gap-2 items-start">
                      {editedPrompts.map((prompt) => (
                        <div key={prompt} className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                          <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{prompt}</span>
                          <button
                            type="button"
                            onClick={() => removePrompt(prompt)}
                            className={`rounded transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-400 hover:text-gray-700'}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={`flex items-center gap-1 px-2.5 py-1 border rounded-md text-sm transition-colors ${
                              theme === 'dark' 
                                ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300' 
                                : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                          >
                            Add prompt
                            <ChevronDown size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="start" 
                          className={`w-64 max-h-80 overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
                        >
                          <div className="px-2 py-2 sticky top-0 bg-inherit">
                            <input
                              type="text"
                              placeholder="Search prompts..."
                              value={promptsSearch}
                              onChange={(e) => {
                                e.stopPropagation();
                                setPromptsSearch(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`w-full px-2 py-1 text-xs rounded border ${
                                theme === 'dark' 
                                  ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                              }`}
                            />
                          </div>
                          {AVAILABLE_PROMPTS.filter(prompt => 
                            prompt.toLowerCase().includes(promptsSearch.toLowerCase())
                          ).map((prompt) => {
                            const isSelected = editedPrompts.includes(prompt);
                            return (
                              <div
                                key={prompt}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePrompt(prompt);
                                }}
                                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${
                                  theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
                                }`}
                              >
                                <div className={`flex items-center justify-center w-4 h-4 rounded border ${
                                  isSelected
                                    ? theme === 'dark' 
                                      ? 'bg-cyan-500 border-cyan-500' 
                                      : 'bg-cyan-600 border-cyan-600'
                                    : theme === 'dark'
                                      ? 'border-zinc-600'
                                      : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {prompt}
                                </span>
                              </div>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Tags</label>
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
                  <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Visibility</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editedVisibility"
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
                        name="editedVisibility"
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
                        name="editedVisibility"
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
                  <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedServer.owner}</p>
                </div>

                {/* Team */}
                <div>
                  <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Team</label>
                  <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedServer.team}</p>
                </div>
              </div>
            ) : (
              /* Add Mode */
            <div className="space-y-6">
              {/* Custom UUID */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Custom UUID (optional)
                </label>
                <input
                  type="text"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  placeholder="Leave blank to auto-generate"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Provide a custom UUID if you need to preserve an existing server ID
                </p>
              </div>

              {/* Name */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              {/* Icon URL */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Icon URL
                </label>
                <input
                  type="text"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              {/* Associated Tools */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Associated Tools ({editedTools.length})</label>
                <div className={`border rounded-md p-4 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex flex-wrap gap-2 items-start">
                    {editedTools.map((tool) => (
                      <div key={tool} className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tool}</span>
                        <button
                          type="button"
                          onClick={() => removeTool(tool)}
                          className={`rounded transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={`flex items-center gap-1 px-2.5 py-1 border rounded-md text-sm transition-colors ${
                            theme === 'dark' 
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300' 
                              : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                        >
                          Add tool
                          <ChevronDown size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="start" 
                        className={`w-64 max-h-80 overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
                      >
                        <div className="px-2 py-2 sticky top-0 bg-inherit">
                          <input
                            type="text"
                            placeholder="Search tools..."
                            value={toolsSearch}
                            onChange={(e) => {
                              e.stopPropagation();
                              setToolsSearch(e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full px-2 py-1 text-xs rounded border ${
                              theme === 'dark' 
                                ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                            }`}
                          />
                        </div>
                        {AVAILABLE_TOOLS.filter(tool => 
                          tool.toLowerCase().includes(toolsSearch.toLowerCase())
                        ).map((tool) => {
                          const isSelected = editedTools.includes(tool);
                          return (
                            <div
                              key={tool}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTool(tool);
                              }}
                              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${
                                theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
                              }`}
                            >
                              <div className={`flex items-center justify-center w-4 h-4 rounded border ${
                                isSelected
                                  ? theme === 'dark' 
                                    ? 'bg-cyan-500 border-cyan-500' 
                                    : 'bg-cyan-600 border-cyan-600'
                                  : theme === 'dark'
                                    ? 'border-zinc-600'
                                    : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {tool}
                              </span>
                            </div>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Associated Resources */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Associated Resources ({editedResources.length})</label>
                <div className={`border rounded-md p-4 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex flex-wrap gap-2 items-start">
                    {editedResources.map((resource) => (
                      <div key={resource} className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{resource}</span>
                        <button
                          type="button"
                          onClick={() => removeResource(resource)}
                          className={`rounded transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={`flex items-center gap-1 px-2.5 py-1 border rounded-md text-sm transition-colors ${
                            theme === 'dark' 
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300' 
                              : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                        >
                          Add resource
                          <ChevronDown size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="start" 
                        className={`w-64 max-h-80 overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
                      >
                        <div className="px-2 py-2 sticky top-0 bg-inherit">
                          <input
                            type="text"
                            placeholder="Search resources..."
                            value={resourcesSearch}
                            onChange={(e) => {
                              e.stopPropagation();
                              setResourcesSearch(e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full px-2 py-1 text-xs rounded border ${
                              theme === 'dark' 
                                ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                            }`}
                          />
                        </div>
                        {AVAILABLE_RESOURCES.filter(resource => 
                          resource.toLowerCase().includes(resourcesSearch.toLowerCase())
                        ).map((resource) => {
                          const isSelected = editedResources.includes(resource);
                          return (
                            <div
                              key={resource}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleResource(resource);
                              }}
                              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${
                                theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
                              }`}
                            >
                              <div className={`flex items-center justify-center w-4 h-4 rounded border ${
                                isSelected
                                  ? theme === 'dark' 
                                    ? 'bg-cyan-500 border-cyan-500' 
                                    : 'bg-cyan-600 border-cyan-600'
                                  : theme === 'dark'
                                    ? 'border-zinc-600'
                                    : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {resource}
                              </span>
                            </div>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Associated Prompts */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Associated Prompts ({editedPrompts.length})</label>
                <div className={`border rounded-md p-4 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex flex-wrap gap-2 items-start">
                    {editedPrompts.map((prompt) => (
                      <div key={prompt} className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{prompt}</span>
                        <button
                          type="button"
                          onClick={() => removePrompt(prompt)}
                          className={`rounded transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={`flex items-center gap-1 px-2.5 py-1 border rounded-md text-sm transition-colors ${
                            theme === 'dark' 
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300' 
                              : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                        >
                          Add prompt
                          <ChevronDown size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="start" 
                        className={`w-64 max-h-80 overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
                      >
                        <div className="px-2 py-2 sticky top-0 bg-inherit">
                          <input
                            type="text"
                            placeholder="Search prompts..."
                            value={promptsSearch}
                            onChange={(e) => {
                              e.stopPropagation();
                              setPromptsSearch(e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full px-2 py-1 text-xs rounded border ${
                              theme === 'dark' 
                                ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                            }`}
                          />
                        </div>
                        {AVAILABLE_PROMPTS.filter(prompt => 
                          prompt.toLowerCase().includes(promptsSearch.toLowerCase())
                        ).map((prompt) => {
                          const isSelected = editedPrompts.includes(prompt);
                          return (
                            <div
                              key={prompt}
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePrompt(prompt);
                              }}
                              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${
                                theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
                              }`}
                            >
                              <div className={`flex items-center justify-center w-4 h-4 rounded border ${
                                isSelected
                                  ? theme === 'dark' 
                                    ? 'bg-cyan-500 border-cyan-500' 
                                    : 'bg-cyan-600 border-cyan-600'
                                  : theme === 'dark'
                                    ? 'border-zinc-600'
                                    : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {prompt}
                              </span>
                            </div>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Tags ({editedTags.length})</label>
                <div className={`border rounded-md p-4 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex flex-wrap gap-2 items-center">
                    {editedTags.map((tag, index) => (
                      <div key={index} className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-md ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className={`rounded transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder={editedTags.length === 0 ? "Enter tag" : ""}
                      className={`flex-1 min-w-[120px] outline-none bg-transparent text-sm ${theme === 'dark' ? 'text-white placeholder:text-zinc-500' : 'text-gray-900 placeholder:text-gray-400'}`}
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
                      checked={visibility === 'public'}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Public</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="team"
                      checked={visibility === 'team'}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Team</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === 'private'}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Private</span>
                  </label>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className={`p-6 pt-4 border-t sticky bottom-0 z-10 ${theme === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSidePanel(false)}
                className={`flex-1 box-border content-stretch flex items-center justify-center overflow-clip px-[12px] py-[8px] rounded-[6px] transition-colors border ${theme === 'dark' ? 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
              >
                <span className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic text-[13px] text-nowrap whitespace-pre">
                  Cancel
                </span>
              </button>
              <button 
                onClick={handleSaveServer}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 box-border content-stretch flex items-center justify-center overflow-clip px-[12px] py-[8px] rounded-[6px] hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
              >
                <span className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic text-[13px] text-white text-nowrap whitespace-pre">
                  {panelMode === 'add' ? 'Add Server' : 'Save Changes'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}