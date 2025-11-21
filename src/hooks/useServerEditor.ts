import { useState, useCallback } from 'react';

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

export function useServerEditor() {
  const [editedName, setEditedName] = useState('');
  const [editedUrl, setEditedUrl] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedVisibility, setEditedVisibility] = useState<'public' | 'team' | 'private'>('public');
  const [editedTransportType, setEditedTransportType] = useState('');
  const [editedAuthenticationType, setEditedAuthenticationType] = useState('');
  const [editedPassthroughHeaders, setEditedPassthroughHeaders] = useState<string[]>([]);
  const [editedActive, setEditedActive] = useState(true);
  const [isTransportDropdownOpen, setIsTransportDropdownOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);

  const loadServerForEditing = useCallback((server: MCPServer) => {
    setEditedName(server.name);
    setEditedUrl(server.url);
    setEditedDescription(server.description);
    setEditedTags([...server.tags]);
    setEditedVisibility(server.visibility);
    setEditedTransportType(server.transportType);
    setEditedAuthenticationType(server.authenticationType);
    setEditedPassthroughHeaders([...server.passthroughHeaders]);
    setEditedActive(server.active);
  }, []);

  const resetForNewServer = useCallback(() => {
    setEditedName('');
    setEditedUrl('');
    setEditedDescription('');
    setEditedTags([]);
    setEditedVisibility('public');
    setEditedTransportType('SSE');
    setEditedAuthenticationType('None');
    setEditedPassthroughHeaders([]);
    setEditedActive(true);
  }, []);

  const getEditedServer = useCallback(() => ({
    name: editedName,
    url: editedUrl,
    description: editedDescription,
    tags: editedTags,
    visibility: editedVisibility,
    transportType: editedTransportType,
    authenticationType: editedAuthenticationType,
    passthroughHeaders: editedPassthroughHeaders,
    active: editedActive,
  }), [
    editedName,
    editedUrl,
    editedDescription,
    editedTags,
    editedVisibility,
    editedTransportType,
    editedAuthenticationType,
    editedPassthroughHeaders,
    editedActive,
  ]);

  return {
    editedName,
    editedUrl,
    editedDescription,
    editedTags,
    editedVisibility,
    editedTransportType,
    editedAuthenticationType,
    editedPassthroughHeaders,
    editedActive,
    isTransportDropdownOpen,
    isAuthDropdownOpen,
    setEditedName,
    setEditedUrl,
    setEditedDescription,
    setEditedTags,
    setEditedVisibility,
    setEditedTransportType,
    setEditedAuthenticationType,
    setEditedPassthroughHeaders,
    setEditedActive,
    setIsTransportDropdownOpen,
    setIsAuthDropdownOpen,
    loadServerForEditing,
    resetForNewServer,
    getEditedServer,
  };
}


