import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { MCPServer } from '../types/server';
import { useServerFilters } from '../hooks/useServerFilters';
import { useServerEditor } from '../hooks/useServerEditor';
import { useServerActions } from '../hooks/useServerActions';
import { ServerTableView } from './ServerTableView';
import { ServerGridView } from './ServerGridView';
import { ServerDetailsPanel } from './ServerDetailsPanel';
import { ServerFilterDropdown } from './ServerFilterDropdown';
import { PageHeader, DataTableToolbar, MCPIcon } from './common';
import * as api from '../lib/api/contextforge-api-ipc';
import { mapGatewayReadToMCPServer } from '../lib/api/server-mapper';
import { toast } from '../lib/toastWithTray';

export function MCPServersPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [panelMode, setPanelMode] = useState<'add' | 'view'>('view');
  const [serversData, setServersData] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Try to fetch gateways
        try {
          const gateways = await api.listGateways();
          const mappedGateways = gateways.map(mapGatewayReadToMCPServer);
          setServersData(mappedGateways);
        } catch (fetchError) {
          // If fetch fails due to auth, try to login
          const errorMsg = (fetchError as Error).message;
          if (errorMsg.includes('Authorization') || errorMsg.includes('authenticated') || errorMsg.includes('401')) {
            console.log('Not authenticated, attempting login...');
            try {
              await api.login(
                import.meta.env.VITE_API_EMAIL,
                import.meta.env.VITE_API_PASSWORD
              );
              // Retry fetching gateways
              const gateways = await api.listGateways();
              const mappedGateways = gateways.map(mapGatewayReadToMCPServer);
              setServersData(mappedGateways);
              toast.success('Connected to ContextForge backend');
            } catch (loginError) {
              throw new Error('Failed to authenticate: ' + (loginError as Error).message);
            }
          } else {
            throw fetchError;
          }
        }
      } catch (err) {
        console.log(err)
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        toast.error('Failed to load gateways: ' + errorMessage);
        console.error('Failed to fetch gateways:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchServers();
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
    'gateway'
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
        <PageHeader
          title="MCP Servers & Federated Gateways"
          description="Register external MCP Servers (SSE/HTTP) to retrieve their tools/resources/prompts."
          theme={theme}
        />

        <div className="p-[32px]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Loading gateways...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
                Failed to load gateways
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
                <MCPIcon
                  className={`mx-auto h-16 w-16 mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
                />
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  No MCP Servers Yet
                </h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get started by adding your first MCP server or federated gateway to connect external tools and resources.
                </p>
                <button
                  onClick={handleAddGatewayClick}
                  className="h-[36px] px-[12px] bg-cyan-500 hover:bg-cyan-600 rounded-[6px] transition-colors shadow-sm shadow-cyan-500/20 text-white font-medium text-[13px]"
                >
                  Add Your First Gateway
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
                label: 'Add Gateway',
                onClick: handleAddGatewayClick,
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
          )}
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


