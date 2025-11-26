import { useState, useCallback } from 'react';
import { A2AAgent, OAuthConfig } from '../types/agent';

export function useAgentEditor() {
  const [editedName, setEditedName] = useState('');
  const [editedEndpointUrl, setEditedEndpointUrl] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedAgentType, setEditedAgentType] = useState('custom');
  const [editedProtocolVersion, setEditedProtocolVersion] = useState('1.0');
  const [editedCapabilities, setEditedCapabilities] = useState<Record<string, unknown>>({});
  const [editedConfig, setEditedConfig] = useState<Record<string, unknown>>({});
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedVisibility, setEditedVisibility] = useState<'public' | 'team' | 'private'>('public');
  const [editedPassthroughHeaders, setEditedPassthroughHeaders] = useState<string[]>([]);
  const [editedEnabled, setEditedEnabled] = useState(true);
  
  // Authentication state
  const [editedAuthType, setEditedAuthType] = useState<string | null>(null);
  const [editedAuthUsername, setEditedAuthUsername] = useState('');
  const [editedAuthPassword, setEditedAuthPassword] = useState('');
  const [editedAuthToken, setEditedAuthToken] = useState('');
  const [editedAuthHeaderKey, setEditedAuthHeaderKey] = useState('');
  const [editedAuthHeaderValue, setEditedAuthHeaderValue] = useState('');
  const [editedAuthHeaders, setEditedAuthHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [editedOAuthConfig, setEditedOAuthConfig] = useState<OAuthConfig | null>(null);
  
  // Dropdown states
  const [isAgentTypeDropdownOpen, setIsAgentTypeDropdownOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [isGrantTypeDropdownOpen, setIsGrantTypeDropdownOpen] = useState(false);
  
  // JSON editor states
  const [capabilitiesJson, setCapabilitiesJson] = useState('{}');
  const [configJson, setConfigJson] = useState('{}');
  const [capabilitiesError, setCapabilitiesError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const loadAgentForEditing = useCallback((agent: A2AAgent) => {
    setEditedName(agent.name);
    setEditedEndpointUrl(agent.endpointUrl);
    setEditedDescription(agent.description);
    setEditedAgentType(agent.agentType);
    setEditedProtocolVersion(agent.protocolVersion);
    setEditedCapabilities(agent.capabilities);
    setEditedConfig(agent.config);
    setEditedTags([...agent.tags]);
    setEditedVisibility(agent.visibility);
    setEditedPassthroughHeaders([...agent.passthroughHeaders]);
    setEditedEnabled(agent.enabled);
    
    // Load authentication
    setEditedAuthType(agent.authType);
    setEditedAuthUsername(agent.authUsername || '');
    setEditedAuthPassword(agent.authPassword || '');
    setEditedAuthToken(agent.authToken || '');
    setEditedAuthHeaderKey(agent.authHeaderKey || '');
    setEditedAuthHeaderValue(agent.authHeaderValue || '');
    
    // Convert authHeaders to editable format
    if (agent.authHeaders && agent.authHeaders.length > 0) {
      const headers = agent.authHeaders.map(h => {
        const entry = Object.entries(h)[0];
        if (entry) {
          const [key, value] = entry;
          return { key, value };
        }
        return { key: '', value: '' };
      });
      setEditedAuthHeaders(headers);
    } else {
      setEditedAuthHeaders([]);
    }
    
    setEditedOAuthConfig(agent.oauthConfig || null);
    
    // Set JSON strings
    setCapabilitiesJson(JSON.stringify(agent.capabilities, null, 2));
    setConfigJson(JSON.stringify(agent.config, null, 2));
    setCapabilitiesError(null);
    setConfigError(null);
  }, []);

  const resetForNewAgent = useCallback(() => {
    setEditedName('');
    setEditedEndpointUrl('');
    setEditedDescription('');
    setEditedAgentType('custom');
    setEditedProtocolVersion('1.0');
    setEditedCapabilities({});
    setEditedConfig({});
    setEditedTags([]);
    setEditedVisibility('public');
    setEditedPassthroughHeaders([]);
    setEditedEnabled(true);
    
    setEditedAuthType(null);
    setEditedAuthUsername('');
    setEditedAuthPassword('');
    setEditedAuthToken('');
    setEditedAuthHeaderKey('');
    setEditedAuthHeaderValue('');
    setEditedAuthHeaders([]);
    setEditedOAuthConfig(null);
    
    setCapabilitiesJson('{}');
    setConfigJson('{}');
    setCapabilitiesError(null);
    setConfigError(null);
  }, []);

  const updateCapabilitiesFromJson = useCallback((json: string) => {
    setCapabilitiesJson(json);
    try {
      const parsed = JSON.parse(json);
      setEditedCapabilities(parsed);
      setCapabilitiesError(null);
    } catch (error) {
      setCapabilitiesError((error as Error).message);
    }
  }, []);

  const updateConfigFromJson = useCallback((json: string) => {
    setConfigJson(json);
    try {
      const parsed = JSON.parse(json);
      setEditedConfig(parsed);
      setConfigError(null);
    } catch (error) {
      setConfigError((error as Error).message);
    }
  }, []);

  const addAuthHeader = useCallback(() => {
    setEditedAuthHeaders(prev => [...prev, { key: '', value: '' }]);
  }, []);

  const updateAuthHeader = useCallback((index: number, field: 'key' | 'value', value: string) => {
    setEditedAuthHeaders(prev => {
      const updated = [...prev];
      const current = updated[index];
      if (current) {
        updated[index] = { ...current, [field]: value };
      }
      return updated;
    });
  }, []);

  const removeAuthHeader = useCallback((index: number) => {
    setEditedAuthHeaders(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getEditedAgent = useCallback(() => {
    // Convert auth headers to API format
    const authHeadersForApi = editedAuthHeaders.length > 0
      ? editedAuthHeaders.map(h => ({ [h.key]: h.value }))
      : null;

    return {
      name: editedName,
      endpointUrl: editedEndpointUrl,
      description: editedDescription,
      agentType: editedAgentType,
      protocolVersion: editedProtocolVersion,
      capabilities: editedCapabilities,
      config: editedConfig,
      tags: editedTags,
      visibility: editedVisibility,
      passthroughHeaders: editedPassthroughHeaders,
      enabled: editedEnabled,
      authType: editedAuthType,
      authUsername: editedAuthUsername,
      authPassword: editedAuthPassword,
      authToken: editedAuthToken,
      authHeaderKey: editedAuthHeaderKey,
      authHeaderValue: editedAuthHeaderValue,
      authHeaders: authHeadersForApi,
      oauthConfig: editedOAuthConfig,
    };
  }, [
    editedName,
    editedEndpointUrl,
    editedDescription,
    editedAgentType,
    editedProtocolVersion,
    editedCapabilities,
    editedConfig,
    editedTags,
    editedVisibility,
    editedPassthroughHeaders,
    editedEnabled,
    editedAuthType,
    editedAuthUsername,
    editedAuthPassword,
    editedAuthToken,
    editedAuthHeaderKey,
    editedAuthHeaderValue,
    editedAuthHeaders,
    editedOAuthConfig,
  ]);

  return {
    // Basic fields
    editedName,
    editedEndpointUrl,
    editedDescription,
    editedAgentType,
    editedProtocolVersion,
    editedCapabilities,
    editedConfig,
    editedTags,
    editedVisibility,
    editedPassthroughHeaders,
    editedEnabled,
    
    // Authentication fields
    editedAuthType,
    editedAuthUsername,
    editedAuthPassword,
    editedAuthToken,
    editedAuthHeaderKey,
    editedAuthHeaderValue,
    editedAuthHeaders,
    editedOAuthConfig,
    
    // Dropdown states
    isAgentTypeDropdownOpen,
    isAuthDropdownOpen,
    isGrantTypeDropdownOpen,
    
    // JSON editor states
    capabilitiesJson,
    configJson,
    capabilitiesError,
    configError,
    
    // Setters
    setEditedName,
    setEditedEndpointUrl,
    setEditedDescription,
    setEditedAgentType,
    setEditedProtocolVersion,
    setEditedCapabilities,
    setEditedConfig,
    setEditedTags,
    setEditedVisibility,
    setEditedPassthroughHeaders,
    setEditedEnabled,
    setEditedAuthType,
    setEditedAuthUsername,
    setEditedAuthPassword,
    setEditedAuthToken,
    setEditedAuthHeaderKey,
    setEditedAuthHeaderValue,
    setEditedAuthHeaders,
    setEditedOAuthConfig,
    setIsAgentTypeDropdownOpen,
    setIsAuthDropdownOpen,
    setIsGrantTypeDropdownOpen,
    
    // JSON methods
    updateCapabilitiesFromJson,
    updateConfigFromJson,
    
    // Auth header methods
    addAuthHeader,
    updateAuthHeader,
    removeAuthHeader,
    
    // Utility methods
    loadAgentForEditing,
    resetForNewAgent,
    getEditedAgent,
  };
}
