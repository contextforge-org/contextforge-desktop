import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { MCPServer } from '../types/server';
import { useServerFilters } from '../hooks/useServerFilters';
import { useServerEditor } from '../hooks/useServerEditor';
import { useServerActions } from '../hooks/useServerActions';
import { ServerTableView } from './ServerTableView';
import { ServerGridView } from './ServerGridView';
import { VirtualServerDetailsPanel } from './VirtualServerDetailsPanel';
import { ConfigPreviewModal } from './ConfigPreviewModal';
import { ServerFilterDropdown } from './ServerFilterDropdown';
import { PageHeader, DataTableToolbar } from './common';
import { Server } from 'lucide-react';
import * as api from '../lib/api/contextforge-api-ipc';
import { withAuth } from '../lib/api/auth-helper';
import { mapServerReadToMCPServer } from '../lib/api/server-mapper';
import { toast } from '../lib/toastWithTray';
import { ConfigType } from '../lib/serverUtils';

export function VirtualServersPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [panelMode, setPanelMode] = useState<'add' | 'view'>('view');
  const [serversData, setServersData] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTools, setAvailableTools] = useState<Array<{id: string, name: string}>>([]);
  const [availableResources, setAvailableResources] = useState<Array<{id: string, name: string}>>([]);
  const [availablePrompts, setAvailablePrompts] = useState<Array<{id: string, name: string}>>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configModalServer, setConfigModalServer] = useState<MCPServer | null>(null);
  const [configModalType, setConfigModalType] = useState<ConfigType | null>(null);

  const { theme } = useTheme();
  const { selectedTeamId } = useTeam();

  // Filter servers by selected team
  const filteredServers = useMemo(() => {
    if (!selectedTeamId) {
      return serversData;
    }
    return serversData.filter(server => server.teamId === selectedTeamId);
  }, [serversData, selectedTeamId]);

  // Fetch servers on mount and when team changes
  useEffect(() => {
    async function fetchServers() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch servers
        const servers = await withAuth(
          () => api.listServers(),
          'Failed to load virtual servers'
        );
        const mappedServers = servers.map(mapServerReadToMCPServer);
        setServersData(mappedServers);
      } catch (err) {
        console.log(err)
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        toast.error('Failed to load virtual servers: ' + errorMessage);
        console.error('Failed to fetch virtual servers:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchServers();
  }, []);

  // Fetch available tools, resources, and prompts
  useEffect(() => {
    async function fetchAvailableItems() {
      try {
        // Fetch tools with auth retry
        try {
          const tools = await withAuth(
            () => api.listTools(),
            'Failed to load tools'
          );
          console.log('Fetched tools:', tools);
          if (Array.isArray(tools) && tools.length > 0) {
            const toolObjects = tools.map((t: any) => ({
              id: t.id || t.name || String(t),
              name: t.name || t.display_name || t.displayName || t.id || String(t)
            }));
            console.log('Mapped tool objects:', toolObjects);
            setAvailableTools(toolObjects);
          } else {
            console.warn('No tools returned from API');
            setAvailableTools([]);
          }
        } catch (fetchError) {
          console.error('Failed to fetch tools:', fetchError);
          setAvailableTools([]);
        }

        // Fetch resources with auth retry
        try {
          const resources = await api.listResources();
          console.log('Fetched resources:', resources);
          if (Array.isArray(resources) && resources.length > 0) {
            const resourceObjects = resources.map((r: any) => ({
              id: String(r.id ?? r.name ?? r),
              name: r.name || r.display_name || r.displayName || String(r.id) || String(r)
            }));
            setAvailableResources(resourceObjects);
          } else {
            console.warn('No resources returned from API');
            setAvailableResources([]);
          }
        } catch (fetchError) {
          const errorMsg = (fetchError as Error).message;
          if (errorMsg.includes('Authorization') || errorMsg.includes('authenticated') || errorMsg.includes('401')) {
            try {
              // Already logged in from tools fetch, just retry
              const resources = await api.listResources();
              if (Array.isArray(resources) && resources.length > 0) {
                const resourceObjects = resources.map((r: any) => ({
                  id: String(r.id ?? r.name ?? r),
                  name: r.name || r.display_name || r.displayName || String(r.id) || String(r)
                }));
                setAvailableResources(resourceObjects);
              }
            } catch (err) {
              console.error('Failed to fetch resources after auth:', err);
              setAvailableResources([]);
            }
          } else {
            console.error('Failed to fetch resources:', fetchError);
            setAvailableResources([]);
          }
        }

        // Fetch prompts with auth retry
        try {
          const prompts = await api.listPrompts();
          console.log('Fetched prompts:', prompts);
          if (Array.isArray(prompts) && prompts.length > 0) {
            const promptObjects = prompts.map((p: any) => ({
              id: String(p.id ?? p.name ?? p),
              name: p.name || p.display_name || p.displayName || String(p.id) || String(p)
            }));
            setAvailablePrompts(promptObjects);
          } else {
            console.warn('No prompts returned from API');
            setAvailablePrompts([]);
          }
        } catch (fetchError) {
          const errorMsg = (fetchError as Error).message;
          if (errorMsg.includes('Authorization') || errorMsg.includes('authenticated') || errorMsg.includes('401')) {
            try {
              // Already logged in from tools fetch, just retry
              const prompts = await api.listPrompts();
              if (Array.isArray(prompts) && prompts.length > 0) {
                const promptObjects = prompts.map((p: any) => ({
                  id: String(p.id ?? p.name ?? p),
                  name: p.name || p.display_name || p.displayName || String(p.id) || String(p)
                }));
                setAvailablePrompts(promptObjects);
              }
            } catch (err) {
              console.error('Failed to fetch prompts after auth:', err);
              setAvailablePrompts([]);
            }
          } else {
            console.error('Failed to fetch prompts:', fetchError);
            setAvailablePrompts([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch available items:', err);
      }
    }

    fetchAvailableItems();
  }, []);

  // Refresh function to fetch fresh server data from backend
  const refreshServers = useCallback(async () => {
    try {
      const servers = await api.listServers();
      const mappedServers = servers.map(mapServerReadToMCPServer);
      setServersData(mappedServers);
    } catch (err) {
      console.error('Failed to refresh servers:', err);
    }
  }, []);

  // Use custom hooks for filters, editor, and actions
  const filterHook = useServerFilters(filteredServers);
  const editorHook = useServerEditor();
  const actionsHook = useServerActions(
    serversData,
    setServersData,
    selectedServer,
    setSelectedServer,
    editorHook.setEditedActive,
    'server',
    refreshServers  // Pass refresh callback to get real IDs after creation
  );

  // Helper to convert tool names to IDs (backend returns names but expects IDs when saving)
  const mapToolNamesToIds = useCallback((toolNames: string[]): string[] => {
    return toolNames.map(nameOrId => {
      // First check if it's already an ID
      const foundById = availableTools.find(t => t.id === nameOrId);
      if (foundById) return nameOrId;
      // Otherwise, look up by name
      const foundByName = availableTools.find(t => t.name === nameOrId);
      return foundByName ? foundByName.id : nameOrId;
    });
  }, [availableTools]);

  // Helper to convert resource names to IDs
  const mapResourceNamesToIds = useCallback((resourceNames: string[]): string[] => {
    return resourceNames.map(nameOrId => {
      const foundById = availableResources.find(r => r.id === nameOrId);
      if (foundById) return nameOrId;
      const foundByName = availableResources.find(r => r.name === nameOrId);
      return foundByName ? foundByName.id : nameOrId;
    });
  }, [availableResources]);

  // Helper to convert prompt names to IDs
  const mapPromptNamesToIds = useCallback((promptNames: string[]): string[] => {
    return promptNames.map(nameOrId => {
      const foundById = availablePrompts.find(p => p.id === nameOrId);
      if (foundById) return nameOrId;
      const foundByName = availablePrompts.find(p => p.name === nameOrId);
      return foundByName ? foundByName.id : nameOrId;
    });
  }, [availablePrompts]);

  // Memoized handlers
  const handleServerClick = useCallback((server: MCPServer) => {
    setSelectedServer(server);
    setPanelMode('view');
    
    // Convert tool/resource/prompt names to IDs before loading for editing
    // The backend returns names but expects IDs when saving
    const serverWithMappedIds = {
      ...server,
      associatedTools: mapToolNamesToIds((server as any).associatedTools || []),
      associatedResources: mapResourceNamesToIds((server as any).associatedResources || []),
      associatedPrompts: mapPromptNamesToIds((server as any).associatedPrompts || []),
    };
    
    editorHook.loadServerForEditing(serverWithMappedIds);
    setShowSidePanel(true);
  }, [editorHook, mapToolNamesToIds, mapResourceNamesToIds, mapPromptNamesToIds]);

  const handleActiveToggleInPanel = useCallback(async (active: boolean) => {
    if (!selectedServer) return;
    
    // Only toggle if the state is actually changing
    if (selectedServer.active === active) return;
    
    const previousData = [...serversData];
    
    console.log('Toggle server status:', { serverId: selectedServer.id, active, currentActive: selectedServer.active });
    
    // Update local editor state
    editorHook.setEditedActive(active);
    
    // Update UI optimistically
    setServersData(prevData =>
      prevData.map(s =>
        s.id === selectedServer.id
          ? { ...s, active }
          : s
      )
    );
    setSelectedServer({ ...selectedServer, active });
    
    // Immediately persist to backend using toggle API with explicit activate parameter
    try {
      const response = await api.toggleServerStatus(selectedServer.id, active);
      console.log('Toggle response:', response);
      
      // Refresh the server list to ensure we have the latest data
      const servers = await api.listServers();
      const mappedServers = servers.map(mapServerReadToMCPServer);
      setServersData(mappedServers);
      
      // Update selected server with fresh data
      const updatedServer = mappedServers.find(s => s.id === selectedServer.id);
      if (updatedServer) {
        setSelectedServer(updatedServer);
        editorHook.loadServerForEditing(updatedServer);
      }
      
      // Show toast notification
      if (!active) {
        toast.success(`${selectedServer.name} deactivated`);
      } else {
        toast.success(`${selectedServer.name} activated`);
      }
    } catch (error) {
      console.error('Toggle error:', error);
      // Revert on error
      editorHook.setEditedActive(!active);
      setServersData(previousData);
      setSelectedServer({ ...selectedServer, active: !active });
      toast.error('Failed to toggle server status: ' + (error as Error).message);
    }
  }, [selectedServer, editorHook, setServersData, setSelectedServer, serversData]);

  const handleAddServerClick = useCallback(() => {
    editorHook.resetForNewServer();
    setPanelMode('add');
    setSelectedServer({} as MCPServer);
    setShowSidePanel(true);
  }, [editorHook]);

  const handleSaveServer = useCallback(async () => {
    const success = await actionsHook.saveServer(panelMode, editorHook.getEditedServer());
    if (success) {
      setShowSidePanel(false);
    }
  }, [actionsHook, panelMode, editorHook]);

  const handleClosePanel = useCallback(() => {
    setShowSidePanel(false);
  }, []);

  const handleDownloadConfig = useCallback((serverId: string, configType: ConfigType) => {
    const server = serversData.find(s => s.id === serverId);
    if (server) {
      setConfigModalServer(server);
      setConfigModalType(configType);
      setShowConfigModal(true);
    }
  }, [serversData]);

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <PageHeader
          title="Virtual MCP Servers"
          description="Virtual Servers let you combine Tools, Resources, and Prompts into an MCP Server with its own API key (see API Tokens)."
          theme={theme}
        />

        <div className="p-[32px]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Loading virtual servers...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
                Failed to load virtual servers
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
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredServers.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <Server
                  size={64}
                  strokeWidth={1.5}
                  className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
                />
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  No Virtual Servers Yet
                </h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get started by creating your first virtual server to combine tools, resources, and prompts.
                </p>
                <button
                  onClick={handleAddServerClick}
                  className="h-[36px] px-[12px] bg-cyan-500 hover:bg-cyan-600 rounded-[6px] transition-colors shadow-sm shadow-cyan-500/20 text-white font-medium text-[13px]"
                >
                  Create Your First Virtual Server
                </button>
              </div>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !error && filteredServers.length > 0 && (
            <div className={`rounded-lg border-b border-l border-r overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
            {/* Table Toolbar */}
            <DataTableToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showSearch={true}
              filterComponent={
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
              }
              primaryAction={{
                label: 'Create Virtual Server',
                onClick: handleAddServerClick,
              }}
              theme={theme}
            />

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
                onDownloadConfig={handleDownloadConfig}
              />
            ) : (
              <ServerGridView
                servers={filterHook.filteredData}
                theme={theme}
                onServerClick={handleServerClick}
                onToggleActive={actionsHook.toggleServerActive}
                onDuplicate={actionsHook.duplicateServer}
                onDelete={actionsHook.deleteServer}
                onDownloadConfig={handleDownloadConfig}
              />
            )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side Panel */}
      {showSidePanel && (
        <VirtualServerDetailsPanel
          server={selectedServer}
          panelMode={panelMode}
          theme={theme}
          editedName={editorHook.editedName}
          editedUrl={editorHook.editedUrl}
          editedIconUrl={editorHook.editedIconUrl}
          editedDescription={editorHook.editedDescription}
          editedTags={editorHook.editedTags}
          editedVisibility={editorHook.editedVisibility}
          editedActive={editorHook.editedActive}
          editedTools={editorHook.editedTools}
          editedResources={editorHook.editedResources}
          editedPrompts={editorHook.editedPrompts}
          availableTools={availableTools}
          availableResources={availableResources}
          availablePrompts={availablePrompts}
          toolsSearch={editorHook.toolsSearch}
          resourcesSearch={editorHook.resourcesSearch}
          promptsSearch={editorHook.promptsSearch}
          onClose={handleClosePanel}
          onSave={handleSaveServer}
          onNameChange={editorHook.setEditedName}
          onUrlChange={editorHook.setEditedUrl}
          onIconUrlChange={editorHook.setEditedIconUrl}
          onDescriptionChange={editorHook.setEditedDescription}
          onTagsChange={editorHook.setEditedTags}
          onVisibilityChange={editorHook.setEditedVisibility}
          onActiveChange={handleActiveToggleInPanel}
          onToggleTool={editorHook.toggleTool}
          onRemoveTool={editorHook.removeTool}
          onToggleResource={editorHook.toggleResource}
          onRemoveResource={editorHook.removeResource}
          onTogglePrompt={editorHook.togglePrompt}
          onRemovePrompt={editorHook.removePrompt}
          onToolsSearchChange={editorHook.setToolsSearch}
          onResourcesSearchChange={editorHook.setResourcesSearch}
          onPromptsSearchChange={editorHook.setPromptsSearch}
        />
      )}

      {/* Config Preview Modal */}
      <ConfigPreviewModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        server={configModalServer}
        configType={configModalType}
        theme={theme}
      />
    </div>
  );
}
