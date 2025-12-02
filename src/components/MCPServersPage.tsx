import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
import { OAuthFlowWizard, type OAuthConfig } from './OAuthFlowWizard';
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
  const [showOAuthWizard, setShowOAuthWizard] = useState(false);
  
  // OAuth authorization state for details panel
  const [isOAuthAuthorized, setIsOAuthAuthorized] = useState(false);
  const [isAuthorizingOAuth, setIsAuthorizingOAuth] = useState(false);
  const oauthPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
                import.meta.env['VITE_API_EMAIL'],
                import.meta.env['VITE_API_PASSWORD']
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

  // Check OAuth status when viewing a server with Authorization Code OAuth
  useEffect(() => {
    async function checkOAuthStatus() {
      if (
        panelMode === 'view' &&
        selectedServer?.id &&
        editorHook.editedAuthenticationType === 'OAuth 2.0' &&
        editorHook.editedOAuthConfig?.grant_type === 'authorization_code'
      ) {
        try {
          const status = await api.getOAuthStatus(selectedServer.id);
          setIsOAuthAuthorized(status.is_authorized || status.oauth_enabled || false);
        } catch (err) {
          console.warn('Failed to check OAuth status:', err);
          setIsOAuthAuthorized(false);
        }
      } else {
        setIsOAuthAuthorized(false);
      }
    }
    
    checkOAuthStatus();
    
    // Cleanup polling on unmount or when server changes
    return () => {
      if (oauthPollingRef.current) {
        clearInterval(oauthPollingRef.current);
        oauthPollingRef.current = null;
      }
    };
  }, [panelMode, selectedServer?.id, editorHook.editedAuthenticationType, editorHook.editedOAuthConfig?.grant_type]);

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

  const handleSaveGateway = useCallback(async () => {
    const editedServer = editorHook.getEditedServer();
    const success = await actionsHook.saveServer(panelMode, editedServer);
    if (success) {
      setShowSidePanel(false);
    }
  }, [actionsHook, panelMode, editorHook]);

  const handleClosePanel = useCallback(() => {
    setShowSidePanel(false);
  }, []);

  const handleOAuthComplete = useCallback((config: OAuthConfig) => {
    editorHook.setEditedOAuthConfig(config);
    setShowOAuthWizard(false);
    toast.success('OAuth configuration saved');
  }, [editorHook]);

  const handleOpenOAuthWizard = useCallback(() => {
    setShowOAuthWizard(true);
  }, []);

  // Handle OAuth authorization for existing servers with Authorization Code flow
  const handleAuthorizeOAuth = useCallback(async () => {
    if (!selectedServer?.id) {
      toast.error('No server selected');
      return;
    }

    try {
      setIsAuthorizingOAuth(true);
      
      // Open the backend OAuth flow in the user's browser
      await api.openBackendOAuthFlow(selectedServer.id);
      
      // Start polling for OAuth status
      oauthPollingRef.current = setInterval(async () => {
        try {
          const status = await api.getOAuthStatus(selectedServer.id);
          
          if (status.is_authorized || status.oauth_enabled) {
            // OAuth complete!
            if (oauthPollingRef.current) {
              clearInterval(oauthPollingRef.current);
              oauthPollingRef.current = null;
            }
            setIsAuthorizingOAuth(false);
            setIsOAuthAuthorized(true);
            
            // Try to fetch tools now that OAuth is complete
            try {
              const toolsResult = await api.fetchToolsAfterOAuth(selectedServer.id);
              toast.success(`OAuth complete! ${toolsResult.message || 'Tools fetched successfully.'}`);
            } catch (toolsErr) {
              toast.success('OAuth authorization successful!');
            }
          }
        } catch (err) {
          console.error('Error polling OAuth status:', err);
        }
      }, 2000); // Poll every 2 seconds
      
    } catch (err) {
      console.error('Failed to start OAuth flow:', err);
      setIsAuthorizingOAuth(false);
      toast.error('Failed to start OAuth flow: ' + (err as Error).message);
    }
  }, [selectedServer?.id]);

  // Handle fetch tools for a gateway
  const handleFetchTools = useCallback(async (serverId: string) => {
    try {
      toast.info('Fetching tools from gateway...');
      const result = await api.fetchToolsAfterOAuth(serverId);
      toast.success(result.message || 'Tools fetched successfully!');
    } catch (err) {
      console.error('Failed to fetch tools:', err);
      toast.error('Failed to fetch tools: ' + (err as Error).message);
    }
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
                onFetchTools={handleFetchTools}
              />
            ) : (
              <ServerGridView
                servers={filterHook.filteredData}
                theme={theme}
                onServerClick={handleServerClick}
                onToggleActive={actionsHook.toggleServerActive}
                onDuplicate={actionsHook.duplicateServer}
                onDelete={actionsHook.deleteServer}
                onFetchTools={handleFetchTools}
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
          editedOAuthConfig={editorHook.editedOAuthConfig}
          editedAuthToken={editorHook.editedAuthToken}
          editedAuthUsername={editorHook.editedAuthUsername}
          editedAuthPassword={editorHook.editedAuthPassword}
          editedAuthHeaders={editorHook.editedAuthHeaders}
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
          onAuthTokenChange={editorHook.setEditedAuthToken}
          onAuthUsernameChange={editorHook.setEditedAuthUsername}
          onAuthPasswordChange={editorHook.setEditedAuthPassword}
          onAuthHeadersChange={editorHook.setEditedAuthHeaders}
          onOpenOAuthWizard={handleOpenOAuthWizard}
          onAuthorizeOAuth={handleAuthorizeOAuth}
          isOAuthAuthorized={isOAuthAuthorized}
          isAuthorizingOAuth={isAuthorizingOAuth}
        />
      )}

      {/* OAuth Configuration Wizard */}
      {showOAuthWizard && (
        <OAuthFlowWizard
          isOpen={showOAuthWizard}
          onClose={() => setShowOAuthWizard(false)}
          onComplete={handleOAuthComplete}
          theme={theme as 'light' | 'dark'}
          entityType="gateway"
          entityId={selectedServer?.id}
          entityName={editorHook.editedName || 'Gateway'}
          initialConfig={editorHook.editedOAuthConfig ? {
            grant_type: editorHook.editedOAuthConfig.grant_type || 'client_credentials',
            client_id: editorHook.editedOAuthConfig.client_id || '',
            client_secret: editorHook.editedOAuthConfig.client_secret || '',
            token_url: editorHook.editedOAuthConfig.token_url || '',
            auth_url: editorHook.editedOAuthConfig.auth_url,
            scopes: editorHook.editedOAuthConfig.scopes,
          } : undefined}
        />
      )}
    </div>
  );
}


