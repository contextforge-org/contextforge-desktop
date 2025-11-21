import { useState, useCallback } from 'react';
import { Search, LayoutGrid, Table } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { MCPServer } from '../types/server';
import { useServerFilters } from '../hooks/useServerFilters';
import { useServerEditor } from '../hooks/useServerEditor';
import { useServerActions } from '../hooks/useServerActions';
import { ServerTableView } from './ServerTableView';
import { ServerGridView } from './ServerGridView';
import { ServerDetailsPanel } from './ServerDetailsPanel';
import { ServerFilterDropdown } from './ServerFilterDropdown';
import imgAzure from "../../assets/icons/brands/terraform.png";
import imgBox from "../../assets/icons/brands/box.png";
import imgGitHub from "../../assets/icons/brands/github.png";
import imgPostman from "../../assets/icons/brands/postman.png";
import imgTerraform from "../../assets/icons/brands/terraform.png";

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

  const { theme } = useTheme();

  // Use custom hooks for filters, editor, and actions
  const filterHook = useServerFilters(serversData);
  const editorHook = useServerEditor();
  const actionsHook = useServerActions(
    serversData,
    setServersData,
    selectedServer,
    setSelectedServer,
    editorHook.setEditedActive
  );

  // Memoized handlers
  const handleServerClick = useCallback((server: MCPServer) => {
    setSelectedServer(server);
    setPanelMode('view');
    editorHook.loadServerForEditing(server);
    setShowSidePanel(true);
  }, [editorHook]);

  const handleAddGatewayClick = useCallback(() => {
    editorHook.resetForNewServer();
    setPanelMode('add');
    setSelectedServer({} as MCPServer);
    setShowSidePanel(true);
  }, [editorHook]);

  const handleSaveGateway = useCallback(() => {
    const success = actionsHook.saveServer(panelMode, editorHook.getEditedServer());
    if (success) {
      setShowSidePanel(false);
    }
  }, [actionsHook, panelMode, editorHook]);

  const handleClosePanel = useCallback(() => {
    setShowSidePanel(false);
  }, []);

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

                {/* Filter Dropdown */}
                <ServerFilterDropdown
                  theme={theme}
                  filters={filterHook.filters}
                  hasActiveFilters={filterHook.hasActiveFilters}
                  uniqueNames={filterHook.uniqueValues.names}
                  uniqueTags={filterHook.uniqueValues.tags}
                  uniqueStatuses={filterHook.uniqueValues.statuses}
                  uniqueTransports={filterHook.uniqueValues.transports}
                  uniqueAuthTypes={filterHook.uniqueValues.authTypes}
                  uniqueVisibilities={filterHook.uniqueValues.visibilities}
                  uniqueTeams={filterHook.uniqueValues.teams}
                  categorySearches={filterHook.categorySearches}
                  expandedCategories={filterHook.expandedCategories}
                  onToggleFilter={filterHook.toggleFilter}
                  onSelectAll={filterHook.selectAllInCategory}
                  onDeselectAll={filterHook.deselectAllInCategory}
                  onSearchChange={(category, value) => 
                    filterHook.setCategorySearches(prev => ({ ...prev, [category]: value }))
                  }
                  onExpandChange={(category, expanded) => 
                    filterHook.setExpandedCategories(prev => ({ ...prev, [category]: expanded }))
                  }
                />
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

            {/* Table or Grid View */}
            {viewMode === 'table' ? (
              <ServerTableView
                servers={filterHook.filteredData}
                theme={theme}
                selectedServer={selectedServer}
                onServerClick={handleServerClick}
                onToggleActive={actionsHook.toggleServerActive}
                onDuplicate={actionsHook.duplicateServer}
                onDelete={actionsHook.deleteServer}
              />
            ) : (
              <ServerGridView
                servers={filterHook.filteredData}
                theme={theme}
                onServerClick={handleServerClick}
                onToggleActive={actionsHook.toggleServerActive}
                onDuplicate={actionsHook.duplicateServer}
                onDelete={actionsHook.deleteServer}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Side Panel */}
      {showSidePanel && (
        <ServerDetailsPanel
          server={selectedServer}
          panelMode={panelMode}
          theme={theme}
          editedName={editorHook.editedName}
          editedUrl={editorHook.editedUrl}
          editedDescription={editorHook.editedDescription}
          editedTags={editorHook.editedTags}
          editedVisibility={editorHook.editedVisibility}
          editedTransportType={editorHook.editedTransportType}
          editedAuthenticationType={editorHook.editedAuthenticationType}
          editedPassthroughHeaders={editorHook.editedPassthroughHeaders}
          editedActive={editorHook.editedActive}
          isTransportDropdownOpen={editorHook.isTransportDropdownOpen}
          isAuthDropdownOpen={editorHook.isAuthDropdownOpen}
          onClose={handleClosePanel}
          onSave={handleSaveGateway}
          onNameChange={editorHook.setEditedName}
          onUrlChange={editorHook.setEditedUrl}
          onDescriptionChange={editorHook.setEditedDescription}
          onTagsChange={editorHook.setEditedTags}
          onVisibilityChange={editorHook.setEditedVisibility}
          onTransportTypeChange={editorHook.setEditedTransportType}
          onAuthenticationTypeChange={editorHook.setEditedAuthenticationType}
          onPassthroughHeadersChange={editorHook.setEditedPassthroughHeaders}
          onActiveChange={editorHook.setEditedActive}
          onTransportDropdownToggle={editorHook.setIsTransportDropdownOpen}
          onAuthDropdownToggle={editorHook.setIsAuthDropdownOpen}
        />
      )}
    </div>
  );
}


