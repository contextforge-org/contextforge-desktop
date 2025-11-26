import { useState, useCallback } from 'react';
import { MCPServer, OAuthConfig } from '../types/server';

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
  
  // Associated items state
  const [editedTools, setEditedTools] = useState<string[]>([]);
  const [editedResources, setEditedResources] = useState<string[]>([]);
  const [editedPrompts, setEditedPrompts] = useState<string[]>([]);
  
  // Search state for dropdowns
  const [toolsSearch, setToolsSearch] = useState('');
  const [resourcesSearch, setResourcesSearch] = useState('');
  const [promptsSearch, setPromptsSearch] = useState('');

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
    setEditedTools((server as any).associatedTools || []);
    setEditedResources((server as any).associatedResources || []);
    setEditedPrompts((server as any).associatedPrompts || []);
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
    setEditedTools([]);
    setEditedResources([]);
    setEditedPrompts([]);
    setToolsSearch('');
    setResourcesSearch('');
    setPromptsSearch('');
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
    associatedTools: editedTools,
    associatedResources: editedResources,
    associatedPrompts: editedPrompts,
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
    editedTools,
    editedResources,
    editedPrompts,
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
    editedTools,
    editedResources,
    editedPrompts,
    toolsSearch,
    resourcesSearch,
    promptsSearch,
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
    setEditedTools,
    setEditedResources,
    setEditedPrompts,
    setToolsSearch,
    setResourcesSearch,
    setPromptsSearch,
    setEditedOAuthConfig,
    toggleTool,
    removeTool,
    toggleResource,
    removeResource,
    togglePrompt,
    removePrompt,
    loadServerForEditing,
    resetForNewServer,
    getEditedServer,
  };
}


