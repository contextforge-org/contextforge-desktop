import { useState, useCallback } from 'react';
import { MCPServer, OAuthConfig, AuthHeader } from '../types/server';

export function useServerEditor() {
  const [editedName, setEditedName] = useState('');
  const [editedUrl, setEditedUrl] = useState('');
  const [editedIconUrl, setEditedIconUrl] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedVisibility, setEditedVisibility] = useState<'public' | 'team' | 'private'>('public');
  const [editedTransportType, setEditedTransportType] = useState('');
  const [editedAuthenticationType, setEditedAuthenticationType] = useState('');
  const [editedPassthroughHeaders, setEditedPassthroughHeaders] = useState<string[]>([]);
  const [editedActive, setEditedActive] = useState(true);
  const [isTransportDropdownOpen, setIsTransportDropdownOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [editedOAuthConfig, setEditedOAuthConfig] = useState<OAuthConfig | null>(null);
  
  // Authentication credentials state
  const [editedAuthToken, setEditedAuthToken] = useState('');
  const [editedAuthUsername, setEditedAuthUsername] = useState('');
  const [editedAuthPassword, setEditedAuthPassword] = useState('');
  const [editedAuthHeaders, setEditedAuthHeaders] = useState<AuthHeader[]>([]);
  
  // Associated items state
  const [editedTools, setEditedTools] = useState<string[]>([]);
  const [editedResources, setEditedResources] = useState<string[]>([]);
  const [editedPrompts, setEditedPrompts] = useState<string[]>([]);
  const [editedA2aAgents, setEditedA2aAgents] = useState<string[]>([]);
  
  // Search state for dropdowns
  const [toolsSearch, setToolsSearch] = useState('');
  const [resourcesSearch, setResourcesSearch] = useState('');
  const [promptsSearch, setPromptsSearch] = useState('');
  const [a2aAgentsSearch, setA2aAgentsSearch] = useState('');

  const loadServerForEditing = useCallback((server: MCPServer) => {
    setEditedName(server.name);
    setEditedUrl(server.url);
    setEditedIconUrl(server.logoUrl || '');
    setEditedDescription(server.description);
    setEditedTags([...server.tags]);
    setEditedVisibility(server.visibility);
    setEditedTransportType(server.transportType);
    setEditedAuthenticationType(server.authenticationType);
    setEditedPassthroughHeaders([...server.passthroughHeaders]);
    setEditedActive(server.active);
    setEditedAuthToken(server.authToken || '');
    setEditedAuthUsername(server.authUsername || '');
    setEditedAuthPassword(server.authPassword || '');
    setEditedAuthHeaders(server.authHeaders || []);
    setEditedTools(server.associatedTools || []);
    setEditedResources(server.associatedResources || []);
    setEditedPrompts(server.associatedPrompts || []);
    setEditedA2aAgents(server.associatedA2aAgents || []);
    setEditedOAuthConfig((server as any).oauthConfig || null);
  }, []);

  const resetForNewServer = useCallback(() => {
    setEditedName('');
    setEditedUrl('');
    setEditedIconUrl('');
    setEditedDescription('');
    setEditedTags([]);
    setEditedVisibility('public');
    setEditedTransportType('SSE');
    setEditedAuthenticationType('None');
    setEditedPassthroughHeaders([]);
    setEditedActive(true);
    setEditedAuthToken('');
    setEditedAuthUsername('');
    setEditedAuthPassword('');
    setEditedAuthHeaders([]);
    setEditedTools([]);
    setEditedResources([]);
    setEditedPrompts([]);
    setEditedA2aAgents([]);
    setToolsSearch('');
    setResourcesSearch('');
    setPromptsSearch('');
    setA2aAgentsSearch('');
    setEditedOAuthConfig(null);
  }, []);

  const getEditedServer = useCallback(() => ({
    name: editedName,
    url: editedUrl,
    logoUrl: editedIconUrl,
    description: editedDescription,
    tags: editedTags,
    visibility: editedVisibility,
    transportType: editedTransportType,
    authenticationType: editedAuthenticationType,
    passthroughHeaders: editedPassthroughHeaders,
    active: editedActive,
    authToken: editedAuthToken,
    authUsername: editedAuthUsername,
    authPassword: editedAuthPassword,
    authHeaders: editedAuthHeaders,
    associatedTools: editedTools,
    associatedResources: editedResources,
    associatedPrompts: editedPrompts,
    associatedA2aAgents: editedA2aAgents,
    oauthConfig: editedOAuthConfig,
  }), [
    editedName,
    editedUrl,
    editedIconUrl,
    editedDescription,
    editedTags,
    editedVisibility,
    editedTransportType,
    editedAuthenticationType,
    editedPassthroughHeaders,
    editedActive,
    editedAuthToken,
    editedAuthUsername,
    editedAuthPassword,
    editedAuthHeaders,
    editedTools,
    editedResources,
    editedPrompts,
    editedA2aAgents,
    editedOAuthConfig,
  ]);

  const toggleTool = useCallback((tool: string) => {
    setEditedTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  }, []);

  const removeTool = useCallback((tool: string) => {
    setEditedTools(prev => prev.filter(t => t !== tool));
  }, []);

  const toggleResource = useCallback((resource: string) => {
    setEditedResources(prev =>
      prev.includes(resource) ? prev.filter(r => r !== resource) : [...prev, resource]
    );
  }, []);

  const removeResource = useCallback((resource: string) => {
    setEditedResources(prev => prev.filter(r => r !== resource));
  }, []);

  const togglePrompt = useCallback((prompt: string) => {
    setEditedPrompts(prev =>
      prev.includes(prompt) ? prev.filter(p => p !== prompt) : [...prev, prompt]
    );
  }, []);

  const removePrompt = useCallback((prompt: string) => {
    setEditedPrompts(prev => prev.filter(p => p !== prompt));
  }, []);

  const toggleA2aAgent = useCallback((agent: string) => {
    setEditedA2aAgents(prev =>
      prev.includes(agent) ? prev.filter(a => a !== agent) : [...prev, agent]
    );
  }, []);

  const removeA2aAgent = useCallback((agent: string) => {
    setEditedA2aAgents(prev => prev.filter(a => a !== agent));
  }, []);

  return {
    editedName,
    editedUrl,
    editedIconUrl,
    editedDescription,
    editedTags,
    editedVisibility,
    editedTransportType,
    editedAuthenticationType,
    editedPassthroughHeaders,
    editedActive,
    isTransportDropdownOpen,
    isAuthDropdownOpen,
    editedAuthToken,
    editedAuthUsername,
    editedAuthPassword,
    editedAuthHeaders,
    editedTools,
    editedResources,
    editedPrompts,
    editedA2aAgents,
    toolsSearch,
    resourcesSearch,
    promptsSearch,
    a2aAgentsSearch,
    editedOAuthConfig,
    setEditedName,
    setEditedUrl,
    setEditedIconUrl,
    setEditedDescription,
    setEditedTags,
    setEditedVisibility,
    setEditedTransportType,
    setEditedAuthenticationType,
    setEditedPassthroughHeaders,
    setEditedActive,
    setIsTransportDropdownOpen,
    setIsAuthDropdownOpen,
    setEditedAuthToken,
    setEditedAuthUsername,
    setEditedAuthPassword,
    setEditedAuthHeaders,
    setEditedTools,
    setEditedResources,
    setEditedPrompts,
    setEditedA2aAgents,
    setToolsSearch,
    setResourcesSearch,
    setPromptsSearch,
    setA2aAgentsSearch,
    setEditedOAuthConfig,
    toggleTool,
    removeTool,
    toggleResource,
    removeResource,
    togglePrompt,
    removePrompt,
    toggleA2aAgent,
    removeA2aAgent,
    loadServerForEditing,
    resetForNewServer,
    getEditedServer,
  };
}


