import { useState, useEffect, useMemo } from 'react';
import { Search, MoreVertical, X, Filter, Pencil, Power, Copy, Trash2, ChevronDown, Package, Loader2, AlertCircle, File, FileText, Image, Video, Music, Code } from 'lucide-react';
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
import { useTeam } from '../context/TeamContext';
import { FilterCategory } from './FilterCategory';
import { ResourceDetailsPanel } from './ResourceDetailsPanel';
import { toast } from '../lib/toastWithTray';
import { PageHeader, DataTableToolbar } from './common';
import * as api from '../lib/api/contextforge-api-ipc';
import type { ResourceRead, ResourceCreate, ResourceUpdate } from '../lib/contextforge-client-ts';

// Helper function to get consistent tag colors
const getTagColor = (tag: string, theme: string): { bg: string; text: string; border: string } => {
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
  const index = Math.abs(hash) % colors.length;
  return colors[index]!;
};

// Helper function to format bytes
const formatBytes = (bytes: number | null): string => {
  if (bytes === null || bytes === undefined) return 'Unknown';
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Helper function to get MIME type icon and color
const getMimeTypeInfo = (mimeType: string | null): { icon: any; color: string; label: string } => {
  if (!mimeType) {
    return { icon: File, color: 'gray', label: 'Unknown' };
  }
  
  if (mimeType.startsWith('text/')) {
    return { icon: FileText, color: 'blue', label: 'Text' };
  }
  if (mimeType === 'application/json' || mimeType.includes('json')) {
    return { icon: Code, color: 'green', label: 'JSON' };
  }
  if (mimeType.startsWith('image/')) {
    return { icon: Image, color: 'purple', label: 'Image' };
  }
  if (mimeType.startsWith('video/')) {
    return { icon: Video, color: 'red', label: 'Video' };
  }
  if (mimeType.startsWith('audio/')) {
    return { icon: Music, color: 'orange', label: 'Audio' };
  }
  if (mimeType === 'application/pdf') {
    return { icon: FileText, color: 'red', label: 'PDF' };
  }
  
  return { icon: File, color: 'gray', label: 'File' };
};

interface Resource {
  id: string;
  uri: string;
  name: string;
  title?: string | null;
  description: string | null;
  mimeType: string | null;
  size: number | null;
  tags?: string[];
  owner: string;
  team: string;
  teamId?: string | null;
  visibility: 'public' | 'team' | 'private';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ownerEmail?: string | null;
}

export function ResourcesPage() {
  const { theme } = useTheme();
  const [resourcesData, setResourcesData] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [panelMode, setPanelMode] = useState<'view' | 'add' | 'edit'>('view');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  // Editor state
  const [editedUri, setEditedUri] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedMimeType, setEditedMimeType] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedTemplate, setEditedTemplate] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedVisibility, setEditedVisibility] = useState<'public' | 'team' | 'private'>('private');
  const [editedActive, setEditedActive] = useState(true);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMimeTypes, setSelectedMimeTypes] = useState<string[]>([]);
  const [selectedVisibility, setSelectedVisibility] = useState<string[]>([]);

  const allMimeTypeCategories = ['Text', 'JSON', 'Image', 'Video', 'Audio', 'PDF', 'Other'];
  const allVisibilityOptions = ['Public', 'Team', 'Private'];

  const { selectedTeamId } = useTeam();

  // Filter resources by selected team first
  const teamFilteredResources = useMemo(() => {
    if (!selectedTeamId) {
      return resourcesData;
    }
    return resourcesData.filter(resource => resource.teamId === selectedTeamId);
  }, [resourcesData, selectedTeamId]);

  // Fetch resources on mount
  useEffect(() => {
    async function fetchResources() {
      try {
        setIsLoading(true);
        setError(null);
        
        const resources = await api.listResources(true); // include_inactive = true
        
        // Map API response to Resource interface
        const mappedResources = resources.map((resource: ResourceRead) => ({
          id: resource.id,
          uri: resource.uri,
          name: resource.name,
          title: resource.title,
          description: resource.description,
          mimeType: resource.mimeType,
          size: resource.size,
          tags: Array.isArray(resource.tags)
            ? resource.tags.map(tag => typeof tag === 'string' ? tag : Object.values(tag)[0] || '')
            : [],
          owner: resource.ownerEmail || 'Unknown',
          team: resource.team || 'Default Team',
          teamId: resource.teamId,
          visibility: (resource.visibility as 'public' | 'team' | 'private') || 'public',
          isActive: resource.enabled,
          createdAt: resource.createdAt,
          updatedAt: resource.updatedAt,
          ownerEmail: resource.ownerEmail,
        }));
        
        setResourcesData(mappedResources);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError((err as Error).message);
        toast.error('Failed to load resources');
      } finally {
        setIsLoading(false);
      }
    }

    fetchResources();
  }, []);

  // Apply filters
  const filteredResources = useMemo(() => {
    return teamFilteredResources.filter(resource => {
      // Search query filter
      const matchesSearch = !searchQuery || 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.uri.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // MIME type filter
      const mimeInfo = getMimeTypeInfo(resource.mimeType);
      const matchesMimeType = selectedMimeTypes.length === 0 ||
        selectedMimeTypes.includes(mimeInfo.label);
      
      // Visibility filter
      const matchesVisibility = selectedVisibility.length === 0 ||
        selectedVisibility.some(v => v.toLowerCase() === resource.visibility);
      
      return matchesSearch && matchesMimeType && matchesVisibility;
    });
  }, [teamFilteredResources, searchQuery, selectedMimeTypes, selectedVisibility]);

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    setPanelMode('view');
    setShowSidePanel(true);
  };

  const handleAddResourceClick = () => {
    resetEditorState();
    setSelectedResource(null);
    setPanelMode('add');
    setShowSidePanel(true);
  };

  const handleClosePanel = () => {
    setShowSidePanel(false);
    setSelectedResource(null);
    setPanelMode('view');
    resetEditorState();
  };

  const handleToggleStatus = async (resource: Resource) => {
    const newActiveState = !resource.isActive;
    
    // Optimistically update the UI immediately
    setResourcesData(prev => prev.map(r =>
      r.id === resource.id
        ? { ...r, isActive: newActiveState, updatedAt: new Date().toISOString() }
        : r
    ));
    
    // Update selected resource if it's the one being toggled
    if (selectedResource?.id === resource.id) {
      setSelectedResource(prev => prev ? {
        ...prev,
        isActive: newActiveState,
        updatedAt: new Date().toISOString(),
      } : null);
    }
    
    try {
      // Call the API to toggle the status
      await api.toggleResourceStatus(resource.id, newActiveState);
      
      toast.success(`Resource ${newActiveState ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Failed to toggle resource status:', err);
      
      // Revert the optimistic update on error
      setResourcesData(prev => prev.map(r =>
        r.id === resource.id
          ? { ...r, isActive: resource.isActive }
          : r
      ));
      
      if (selectedResource?.id === resource.id) {
        setSelectedResource(prev => prev ? {
          ...prev,
          isActive: resource.isActive,
        } : null);
      }
      
      toast.error('Failed to toggle resource status');
    }
  };

  const handleActiveToggleFromPanel = async (newActiveState: boolean) => {
    if (!selectedResource) return;
    
    // If in view mode, toggle via API
    if (panelMode === 'view') {
      await handleToggleStatus(selectedResource);
    } else {
      // If in edit mode, just update the editor state
      setEditedActive(newActiveState);
    }
  };

  const handleDeleteResource = async (resource: Resource) => {
    if (!confirm(`Are you sure you want to delete "${resource.name}"?`)) {
      return;
    }

    try {
      await api.deleteResource(resource.id);
      
      // Update local state
      setResourcesData(prev => prev.filter(r => r.id !== resource.id));
      
      toast.success('Resource deleted successfully');
      
      if (selectedResource?.id === resource.id) {
        handleClosePanel();
      }
    } catch (err) {
      console.error('Failed to delete resource:', err);
      toast.error('Failed to delete resource');
    }
  };

  const handleEditResource = () => {
    if (!selectedResource) return;
    
    // Populate editor state with current resource data
    setEditedUri(selectedResource.uri);
    setEditedName(selectedResource.name);
    setEditedDescription(selectedResource.description || '');
    setEditedMimeType(selectedResource.mimeType || '');
    setEditedContent(''); // Content would need to be fetched separately
    setEditedTemplate(''); // Template would need to be fetched separately
    setEditedTags(selectedResource.tags || []);
    setEditedVisibility(selectedResource.visibility);
    setEditedActive(selectedResource.isActive);
    
    setPanelMode('edit');
  };

  const handleSaveResource = async () => {
    try {
      if (panelMode === 'add') {
        // Create new resource
        const resourceData: ResourceCreate = {
          uri: editedUri,
          name: editedName,
          description: editedDescription || null,
          mimeType: editedMimeType || null,
          content: editedContent,
          uri_template: editedTemplate || null,
          tags: editedTags.length > 0 ? editedTags : null,
          visibility: editedVisibility || null,
        };
        
        const newResource = await api.createResource(resourceData);
        
        // Add to local state
        const mappedResource: Resource = {
          id: newResource.id,
          uri: newResource.uri,
          name: newResource.name,
          description: newResource.description,
          mimeType: newResource.mimeType,
          size: newResource.size,
          tags: Array.isArray(newResource.tags)
            ? newResource.tags.map((tag: any) => typeof tag === 'string' ? tag : Object.values(tag)[0] || '')
            : [],
          owner: newResource.ownerEmail || 'Unknown',
          team: 'Default Team',
          teamId: newResource.teamId,
          visibility: (newResource.visibility as 'public' | 'team' | 'private') || 'private',
          isActive: newResource.enabled,
          createdAt: newResource.createdAt,
          updatedAt: newResource.updatedAt,
          ownerEmail: newResource.ownerEmail,
        };
        
        setResourcesData(prev => [...prev, mappedResource]);
        toast.success('Resource created successfully');
      } else if (panelMode === 'edit' && selectedResource) {
        // Update existing resource
        const resourceData: ResourceUpdate = {
          uri: editedUri || null,
          name: editedName || null,
          description: editedDescription || null,
          mimeType: editedMimeType || null,
          content: editedContent || null,
          uriTemplate: editedTemplate || null,
          tags: editedTags.length > 0 ? editedTags : null,
          visibility: editedVisibility || null,
        };
        
        const updatedResource = await api.updateResource(selectedResource.id, resourceData);
        
        // Update local state
        setResourcesData(prev => prev.map(r =>
          r.id === selectedResource.id ? {
            ...r,
            uri: updatedResource.uri,
            name: updatedResource.name,
            description: updatedResource.description,
            mimeType: updatedResource.mimeType,
            size: updatedResource.size,
            tags: Array.isArray(updatedResource.tags)
              ? updatedResource.tags.map((tag: any) => typeof tag === 'string' ? tag : Object.values(tag)[0] || '')
              : [],
            visibility: (updatedResource.visibility as 'public' | 'team' | 'private') || 'private',
            updatedAt: updatedResource.updatedAt,
          } : r
        ));
        
        setSelectedResource(prev => prev ? {
          ...prev,
          uri: updatedResource.uri,
          name: updatedResource.name,
          description: updatedResource.description,
          mimeType: updatedResource.mimeType,
          size: updatedResource.size,
          tags: Array.isArray(updatedResource.tags)
            ? updatedResource.tags.map((tag: any) => typeof tag === 'string' ? tag : Object.values(tag)[0] || '')
            : [],
          visibility: (updatedResource.visibility as 'public' | 'team' | 'private') || 'private',
          updatedAt: updatedResource.updatedAt,
        } : null);
        
        toast.success('Resource updated successfully');
        setPanelMode('view');
      }
      
      handleClosePanel();
    } catch (err) {
      console.error('Failed to save resource:', err);
      toast.error('Failed to save resource');
    }
  };

  const resetEditorState = () => {
    setEditedUri('');
    setEditedName('');
    setEditedDescription('');
    setEditedMimeType('');
    setEditedContent('');
    setEditedTemplate('');
    setEditedTags([]);
    setEditedVisibility('private');
    setEditedActive(true);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-400'}`} />
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className={`w-12 h-12 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Failed to Load Resources
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              {error}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="flex-1 overflow-auto">
        {/* Page Header */}
        <PageHeader
          title="Resources"
          description="Manage your MCP resources and content"
          theme={theme}
        />

        <div className="p-[32px]">
          {/* Data Container */}
          <div className={`rounded-lg border-b border-l border-r overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
          {/* Toolbar */}
          <DataTableToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterComponent={
              <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                    theme === 'dark'
                      ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}>
                    <Filter size={16} />
                    <span className="text-sm font-medium">Filters</span>
                    {(selectedMimeTypes.length > 0 || selectedVisibility.length > 0) && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-orange-500 text-white">
                        {selectedMimeTypes.length + selectedVisibility.length}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`w-64 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                  <DropdownMenuLabel className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>
                    Filter Resources
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
                  <FilterCategory
                    label="MIME Type"
                    items={allMimeTypeCategories}
                    selectedItems={selectedMimeTypes}
                    onToggle={(item) => {
                      setSelectedMimeTypes(prev =>
                        prev.includes(item)
                          ? prev.filter(i => i !== item)
                          : [...prev, item]
                      );
                    }}
                    theme={theme}
                  />
                  <FilterCategory
                    label="Visibility"
                    items={allVisibilityOptions}
                    selectedItems={selectedVisibility}
                    onToggle={(item) => {
                      setSelectedVisibility(prev =>
                        prev.includes(item)
                          ? prev.filter(i => i !== item)
                          : [...prev, item]
                      );
                    }}
                    theme={theme}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            }
            secondaryActions={
              <div className="flex items-center gap-0 shadow-lg shadow-orange-500/20 rounded-[6px] overflow-hidden">
                <button
                  onClick={handleAddResourceClick}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 flex gap-[6px] items-center justify-center px-[12px] py-[8px] hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic text-[13px] text-white text-nowrap whitespace-pre">
                    Add Resource
                  </p>
                </button>
              </div>
            }
            theme={theme}
          />

          {/* Table View */}
          {viewMode === 'table' && (
            <table className="w-full">
              <thead className={`border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                <tr>
                  <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Name</th>
                  <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>URI</th>
                  <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Type</th>
                  <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Size</th>
                  <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Description</th>
                  <th className={`text-left px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Tags</th>
                  <th className={`text-left px-4 py-3 text-sm font-medium w-12 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}></th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => {
                  const mimeInfo = getMimeTypeInfo(resource.mimeType);
                  const MimeIcon = mimeInfo.icon;
                  
                  return (
                    <tr
                      key={resource.id}
                      onClick={() => handleViewResource(resource)}
                      className={`border-b last:border-b-0 transition-colors cursor-pointer ${
                        selectedResource?.id === resource.id
                          ? theme === 'dark'
                            ? 'bg-cyan-950/20 border-cyan-800/50'
                            : 'bg-cyan-50 border-cyan-200'
                          : theme === 'dark'
                            ? 'border-zinc-800 hover:bg-zinc-800/50'
                            : 'border-gray-200 hover:bg-gray-50'
                      } ${selectedResource?.id === resource.id ? 'border-l-4 border-l-cyan-500' : ''}`}
                    >
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center shrink-0">
                            <MimeIcon size={20} className={`text-${mimeInfo.color}-500`} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{resource.name}</span>
                            <div className={`size-2 rounded-full shrink-0 ${resource.isActive ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : theme === 'dark' ? 'bg-zinc-600' : 'bg-gray-400'}`} title={resource.isActive ? 'Active' : 'Inactive'}></div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                        <span className="font-mono text-xs">
                          {resource.uri}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          theme === 'dark'
                            ? `bg-${mimeInfo.color}-500/20 text-${mimeInfo.color}-300`
                            : `bg-${mimeInfo.color}-100 text-${mimeInfo.color}-700`
                        }`}>
                          {mimeInfo.label}
                        </span>
                      </td>
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                        <span>
                          {formatBytes(resource.size)}
                        </span>
                      </td>
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                        <span className="line-clamp-1">
                          {resource.description || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {resource.tags && resource.tags.slice(0, 2).map((tag) => {
                            const colors = getTagColor(tag, theme);
                            return (
                              <span
                                key={tag}
                                className={`px-2 py-0.5 rounded-full text-xs border ${colors.bg} ${colors.text} ${colors.border}`}
                              >
                                {tag}
                              </span>
                            );
                          })}
                          {resource.tags && resource.tags.length > 2 && (
                            <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                              +{resource.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className={`p-1 rounded hover:bg-opacity-10 ${
                                  theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'
                                }`}
                              >
                                <MoreVertical size={16} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewResource(resource);
                                }}
                                className={theme === 'dark' ? 'text-zinc-300 focus:bg-zinc-800 focus:text-white' : 'text-gray-700 focus:bg-gray-100'}
                              >
                                <Pencil size={16} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(resource);
                                }}
                                className={theme === 'dark' ? 'text-zinc-300 focus:bg-zinc-800 focus:text-white' : 'text-gray-700 focus:bg-gray-100'}
                              >
                                <Power size={16} className="mr-2" />
                                {resource.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteResource(resource);
                                }}
                                className={theme === 'dark' ? 'text-red-400 focus:bg-red-500/10 focus:text-red-300' : 'text-red-600 focus:bg-red-50'}
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => {
                const mimeInfo = getMimeTypeInfo(resource.mimeType);
                const MimeIcon = mimeInfo.icon;
                
                return (
                  <div
                    key={resource.id}
                    onClick={() => handleViewResource(resource)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700'
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MimeIcon size={20} className={`text-${mimeInfo.color}-500`} />
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {resource.name}
                        </h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className={`p-1 rounded hover:bg-opacity-10 ${
                              theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'
                            }`}
                          >
                            <MoreVertical size={16} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(resource);
                            }}
                            className={theme === 'dark' ? 'text-zinc-300 focus:bg-zinc-800 focus:text-white' : 'text-gray-700 focus:bg-gray-100'}
                          >
                            <Power size={16} className="mr-2" />
                            {resource.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className={theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResource(resource);
                            }}
                            className={theme === 'dark' ? 'text-red-400 focus:bg-red-500/10 focus:text-red-300' : 'text-red-600 focus:bg-red-50'}
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          theme === 'dark'
                            ? `bg-${mimeInfo.color}-500/20 text-${mimeInfo.color}-300`
                            : `bg-${mimeInfo.color}-100 text-${mimeInfo.color}-700`
                        }`}>
                          {mimeInfo.label}
                        </span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                          {formatBytes(resource.size)}
                        </span>
                      </div>
                      
                      <p className={`text-sm font-mono text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'} line-clamp-1`}>
                        {resource.uri}
                      </p>
                      
                      {resource.description && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} line-clamp-2`}>
                          {resource.description}
                        </p>
                      )}
                    </div>
                    
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {resource.tags.slice(0, 3).map((tag) => {
                          const colors = getTagColor(tag, theme);
                          return (
                            <span
                              key={tag}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                        {resource.tags.length > 3 && (
                          <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                            +{resource.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        resource.isActive
                          ? theme === 'dark'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-green-100 text-green-700'
                          : theme === 'dark'
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {resource.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                        {resource.visibility}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredResources.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Package size={48} className={theme === 'dark' ? 'text-zinc-700' : 'text-gray-300'} />
              <h3 className={`mt-4 text-lg font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                No resources found
              </h3>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                {searchQuery || selectedMimeTypes.length > 0 || selectedVisibility.length > 0
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first resource'}
              </p>
              {!searchQuery && selectedMimeTypes.length === 0 && selectedVisibility.length === 0 && (
                <button
                  onClick={handleAddResourceClick}
                  className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Add Resource
                </button>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Resource Details Panel */}
      {showSidePanel && (
        <ResourceDetailsPanel
          resource={selectedResource}
          panelMode={panelMode}
          theme={theme}
          editedUri={editedUri}
          editedName={editedName}
          editedDescription={editedDescription}
          editedMimeType={editedMimeType}
          editedContent={editedContent}
          editedTemplate={editedTemplate}
          editedTags={editedTags}
          editedVisibility={editedVisibility}
          editedActive={editedActive}
          onClose={handleClosePanel}
          onSave={handleSaveResource}
          onEdit={handleEditResource}
          onDelete={() => selectedResource && handleDeleteResource(selectedResource)}
          onUriChange={setEditedUri}
          onNameChange={setEditedName}
          onDescriptionChange={setEditedDescription}
          onMimeTypeChange={setEditedMimeType}
          onContentChange={setEditedContent}
          onTemplateChange={setEditedTemplate}
          onTagsChange={setEditedTags}
          onVisibilityChange={setEditedVisibility}
          onActiveChange={handleActiveToggleFromPanel}
        />
      )}
    </div>
  );
}
