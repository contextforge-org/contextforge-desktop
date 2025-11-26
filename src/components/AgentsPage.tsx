import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { A2AAgent } from '../types/agent';
import { useAgentEditor } from '../hooks/useAgentEditor';
import { useAgentActions } from '../hooks/useAgentActions';
import { AgentTableView } from './AgentTableView';
import { AgentGridView } from './AgentGridView';
import { AgentDetailsPanel } from './AgentDetailsPanel';
import { AgentFilterDropdown } from './AgentFilterDropdown';
import { PageHeader, DataTableToolbar } from './common';
import * as api from '../lib/api/contextforge-api-ipc';
import { mapA2aAgentReadToA2AAgent } from '../lib/api/agent-mapper';
import { toast } from '../lib/toastWithTray';
import { Users } from 'lucide-react';

export function AgentsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<A2AAgent | null>(null);
  const [panelMode, setPanelMode] = useState<'add' | 'view'>('view');
  const [agentsData, setAgentsData] = useState<A2AAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    names: [] as string[],
    tags: [] as string[],
    statuses: [] as string[],
    authTypes: [] as string[],
    visibilities: [] as string[],
    teams: [] as string[],
  });
  const [categorySearches, setCategorySearches] = useState<{[key: string]: string}>({});
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [searchQuery, setSearchQuery] = useState('');

  const { theme } = useTheme();
  const { selectedTeamId } = useTeam();

  // Filter agents by selected team
  const filteredAgents = useMemo(() => {
    if (!selectedTeamId) {
      return agentsData;
    }
    return agentsData.filter(agent => agent.teamId === selectedTeamId);
  }, [agentsData, selectedTeamId]);

  // Fetch agents on mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        setIsLoading(true);
        setError(null);
        
        try {
          const agents = await api.listA2AAgents();
          const mappedAgents = agents.map(mapA2aAgentReadToA2AAgent);
          setAgentsData(mappedAgents);
        } catch (fetchError) {
          const errorMsg = (fetchError as Error).message;
          if (errorMsg.includes('Authorization') || errorMsg.includes('authenticated') || errorMsg.includes('401')) {
            console.log('Not authenticated, attempting login...');
            try {
              await api.login(
                import.meta.env['VITE_API_EMAIL'],
                import.meta.env['VITE_API_PASSWORD']
              );
              const agents = await api.listA2AAgents();
              const mappedAgents = agents.map(mapA2aAgentReadToA2AAgent);
              setAgentsData(mappedAgents);
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
        toast.error('Failed to load agents: ' + errorMessage);
        console.error('Failed to fetch agents:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgents();
  }, []);

  // Use custom hooks
  const editorHook = useAgentEditor();
  const actionsHook = useAgentActions(
    agentsData,
    setAgentsData,
    selectedAgent,
    setSelectedAgent,
    editorHook.setEditedEnabled
  );

  // Apply search filter
  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return filteredAgents;
    const query = searchQuery.toLowerCase();
    return filteredAgents.filter(agent =>
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.endpointUrl.toLowerCase().includes(query)
    );
  }, [filteredAgents, searchQuery]);

  // Apply category filters
  const filteredByFilters = useMemo(() => {
    return filteredBySearch.filter(agent => {
      if (filters.names.length > 0 && !filters.names.includes(agent.name)) return false;
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(tag => agent.tags.includes(tag));
        if (!hasAllTags) return false;
      }
      if (filters.statuses.length > 0) {
        const status = agent.enabled ? 'Enabled' : 'Disabled';
        if (!filters.statuses.includes(status)) return false;
      }
      if (filters.authTypes.length > 0) {
        const authType = agent.authType || 'none';
        if (!filters.authTypes.includes(authType)) return false;
      }
      if (filters.visibilities.length > 0 && !filters.visibilities.includes(agent.visibility)) return false;
      if (filters.teams.length > 0 && !filters.teams.includes(agent.team)) return false;
      return true;
    });
  }, [filteredBySearch, filters]);

  // Get unique values for filters
  const uniqueValues = useMemo(() => {
    return {
      names: Array.from(new Set(filteredAgents.map(a => a.name))).sort(),
      tags: Array.from(new Set(filteredAgents.flatMap(a => a.tags))).sort(),
      statuses: ['Enabled', 'Disabled'],
      authTypes: Array.from(new Set(filteredAgents.map(a => a.authType || 'none'))).sort(),
      visibilities: Array.from(new Set(filteredAgents.map(a => a.visibility))).sort(),
      teams: Array.from(new Set(filteredAgents.map(a => a.team))).sort(),
    };
  }, [filteredAgents]);

  // Filter handlers
  const toggleFilter = useCallback((category: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  }, []);

  const selectAllInCategory = useCallback((category: keyof typeof filters, items: string[]) => {
    setFilters(prev => ({ ...prev, [category]: items }));
  }, []);

  const deselectAllInCategory = useCallback((category: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [category]: [] }));
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(arr => arr.length > 0);
  }, [filters]);

  // Handlers
  const handleAgentClick = useCallback((agent: A2AAgent) => {
    setSelectedAgent(agent);
    setPanelMode('view');
    editorHook.loadAgentForEditing(agent);
    setShowSidePanel(true);
  }, [editorHook]);

  const handleAddAgentClick = useCallback(() => {
    editorHook.resetForNewAgent();
    setPanelMode('add');
    setSelectedAgent({} as A2AAgent);
    setShowSidePanel(true);
  }, [editorHook]);

  const handleSaveAgent = useCallback(async () => {
    const success = await actionsHook.saveAgent(panelMode, editorHook.getEditedAgent());
    if (success) {
      setShowSidePanel(false);
    }
  }, [actionsHook, panelMode, editorHook]);

  const handleClosePanel = useCallback(() => {
    setShowSidePanel(false);
  }, []);

  // Extract OAuth fields from config
  const oauthConfig = editorHook.editedOAuthConfig;
  const editedOAuthClientId = oauthConfig?.client_id || '';
  const editedOAuthClientSecret = oauthConfig?.client_secret || '';
  const editedOAuthAuthorizationUrl = oauthConfig?.auth_url || '';
  const editedOAuthTokenUrl = oauthConfig?.token_url || '';
  const editedOAuthScopes = oauthConfig?.scopes || [];
  const editedOAuthGrantType = oauthConfig?.grant_type || '';

  // OAuth config setters
  const setOAuthField = useCallback((field: string, value: any) => {
    editorHook.setEditedOAuthConfig(prev => {
      if (!prev) {
        return {
          grant_type: field === 'grant_type' ? value : '',
          client_id: field === 'client_id' ? value : '',
          client_secret: field === 'client_secret' ? value : '',
          token_url: field === 'token_url' ? value : '',
          auth_url: field === 'auth_url' ? value : '',
          scopes: field === 'scopes' ? value : [],
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  }, [editorHook]);

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto">
        <PageHeader
          title="A2A Agents"
          description="Register Agent-to-Agent (A2A) protocol agents to enable autonomous agent communication and collaboration."
          theme={theme}
        />

        <div className="p-[32px]">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading agents...</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
                Failed to load agents
              </h3>
              <p className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className={`mt-4 px-4 py-2 rounded ${theme === 'dark' ? 'bg-red-800 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && filteredAgents.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <Users className={`mx-auto h-16 w-16 mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  No A2A Agents Yet
                </h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get started by adding your first A2A agent to enable autonomous agent-to-agent communication.
                </p>
                <button
                  onClick={handleAddAgentClick}
                  className="h-[36px] px-[12px] bg-cyan-500 hover:bg-cyan-600 rounded-[6px] transition-colors shadow-sm shadow-cyan-500/20 text-white font-medium text-[13px]"
                >
                  Add Your First Agent
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && filteredAgents.length > 0 && (
            <div className={`rounded-lg border-b border-l border-r overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
              <DataTableToolbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showSearch={true}
                onSearchChange={setSearchQuery}
                filterComponent={
                  <AgentFilterDropdown
                    theme={theme}
                    filters={filters}
                    hasActiveFilters={hasActiveFilters}
                    uniqueNames={uniqueValues.names}
                    uniqueTags={uniqueValues.tags}
                    uniqueStatuses={uniqueValues.statuses}
                    uniqueAuthTypes={uniqueValues.authTypes}
                    uniqueVisibilities={uniqueValues.visibilities}
                    uniqueTeams={uniqueValues.teams}
                    categorySearches={categorySearches}
                    expandedCategories={expandedCategories}
                    onToggleFilter={toggleFilter}
                    onSelectAll={selectAllInCategory}
                    onDeselectAll={deselectAllInCategory}
                    onSearchChange={(category, value) =>
                      setCategorySearches(prev => ({ ...prev, [category]: value }))
                    }
                    onExpandChange={(category, expanded) =>
                      setExpandedCategories(prev => ({ ...prev, [category]: expanded }))
                    }
                  />
                }
                primaryAction={{
                  label: 'Add Agent',
                  onClick: handleAddAgentClick,
                }}
                theme={theme}
              />

              {viewMode === 'table' ? (
                <AgentTableView
                  agents={filteredByFilters}
                  theme={theme}
                  selectedAgent={selectedAgent}
                  onAgentClick={handleAgentClick}
                  onToggleEnabled={actionsHook.toggleAgentEnabled}
                  onDuplicate={actionsHook.duplicateAgent}
                  onDelete={actionsHook.deleteAgent}
                />
              ) : (
                <AgentGridView
                  agents={filteredByFilters}
                  theme={theme}
                  onAgentClick={handleAgentClick}
                  onToggleEnabled={actionsHook.toggleAgentEnabled}
                  onDuplicate={actionsHook.duplicateAgent}
                  onDelete={actionsHook.deleteAgent}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {showSidePanel && (
        <AgentDetailsPanel
          agent={selectedAgent}
          panelMode={panelMode}
          theme={theme}
          editedName={editorHook.editedName}
          editedEndpointUrl={editorHook.editedEndpointUrl}
          editedDescription={editorHook.editedDescription}
          editedTags={editorHook.editedTags}
          editedAuthType={editorHook.editedAuthType || 'none'}
          editedAuthUsername={editorHook.editedAuthUsername || ''}
          editedAuthPassword={editorHook.editedAuthPassword || ''}
          editedAuthToken={editorHook.editedAuthToken || ''}
          editedAuthHeaders={editorHook.editedAuthHeaders || []}
          editedOAuthClientId={editedOAuthClientId}
          editedOAuthClientSecret={editedOAuthClientSecret}
          editedOAuthAuthorizationUrl={editedOAuthAuthorizationUrl}
          editedOAuthTokenUrl={editedOAuthTokenUrl}
          editedOAuthScopes={editedOAuthScopes}
          editedOAuthGrantType={editedOAuthGrantType}
          editedCapabilitiesJson={editorHook.capabilitiesJson}
          editedConfigJson={editorHook.configJson}
          editedEnabled={editorHook.editedEnabled}
          isAuthTypeDropdownOpen={editorHook.isAuthDropdownOpen}
          isGrantTypeDropdownOpen={editorHook.isGrantTypeDropdownOpen}
          onClose={handleClosePanel}
          onSave={handleSaveAgent}
          onNameChange={editorHook.setEditedName}
          onEndpointUrlChange={editorHook.setEditedEndpointUrl}
          onDescriptionChange={editorHook.setEditedDescription}
          onTagsChange={editorHook.setEditedTags}
          onAuthTypeChange={editorHook.setEditedAuthType}
          onAuthUsernameChange={editorHook.setEditedAuthUsername}
          onAuthPasswordChange={editorHook.setEditedAuthPassword}
          onAuthTokenChange={editorHook.setEditedAuthToken}
          onAuthHeadersChange={editorHook.setEditedAuthHeaders}
          onOAuthClientIdChange={(value) => setOAuthField('client_id', value)}
          onOAuthClientSecretChange={(value) => setOAuthField('client_secret', value)}
          onOAuthAuthorizationUrlChange={(value) => setOAuthField('auth_url', value)}
          onOAuthTokenUrlChange={(value) => setOAuthField('token_url', value)}
          onOAuthScopesChange={(value) => setOAuthField('scopes', value)}
          onOAuthGrantTypeChange={(value) => setOAuthField('grant_type', value)}
          onCapabilitiesJsonChange={editorHook.updateCapabilitiesFromJson}
          onConfigJsonChange={editorHook.updateConfigFromJson}
          onEnabledChange={editorHook.setEditedEnabled}
          onAuthTypeDropdownToggle={editorHook.setIsAuthDropdownOpen}
          onGrantTypeDropdownToggle={editorHook.setIsGrantTypeDropdownOpen}
        />
      )}
    </div>
  );
}
