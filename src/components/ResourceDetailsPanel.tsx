import { X, FileText, Image, Video, Music, FileJson, File, Copy, ExternalLink } from 'lucide-react';
import { Switch } from "./ui/switch";
import { RightSidePanel } from './RightSidePanel';
import { useTeam } from '../context/TeamContext';
import { useState } from 'react';

interface Resource {
  id: number;
  uri: string;
  name: string;
  description: string | null;
  mimeType: string | null;
  size: number | null;
  content?: string;
  template?: string | null;
  tags?: string[];
  visibility: 'public' | 'team' | 'private';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  modifiedBy?: string | null;
  metrics?: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    failureRate: number;
  };
}

interface ResourceDetailsPanelProps {
  resource: Resource | null;
  panelMode: 'add' | 'view' | 'edit';
  theme: string;
  editedUri: string;
  editedName: string;
  editedDescription: string;
  editedMimeType: string;
  editedContent: string;
  editedTemplate: string;
  editedTags: string[];
  editedVisibility: 'public' | 'team' | 'private';
  editedActive: boolean;
  onClose: () => void;
  onSave: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUriChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMimeTypeChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTemplateChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onVisibilityChange: (visibility: 'public' | 'team' | 'private') => void;
  onActiveChange: (active: boolean) => void;
}

// Helper function to get MIME type icon and color
const getMimeTypeInfo = (mimeType: string | null) => {
  if (!mimeType) return { icon: File, color: 'text-gray-400', bg: 'bg-gray-500/20' };
  
  if (mimeType.startsWith('text/')) return { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/20' };
  if (mimeType.includes('json')) return { icon: FileJson, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  if (mimeType.startsWith('image/')) return { icon: Image, color: 'text-green-400', bg: 'bg-green-500/20' };
  if (mimeType.startsWith('video/')) return { icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/20' };
  if (mimeType.startsWith('audio/')) return { icon: Music, color: 'text-pink-400', bg: 'bg-pink-500/20' };
  
  return { icon: File, color: 'text-gray-400', bg: 'bg-gray-500/20' };
};

// Helper function to format bytes
const formatBytes = (bytes: number | null): string => {
  if (bytes === null || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Helper function to get tag colors
const getTagColor = (tag: string, theme: string): { bg: string; text: string; border: string } => {
  const darkColors = [
    { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
    { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
    { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/40' },
    { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/40' },
    { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
  ] as const;
  
  const lightColors = [
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
    { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  ] as const;
  
  const colors = theme === 'dark' ? darkColors : lightColors;
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % colors.length;
  // Safe to use non-null assertion since colors array is never empty and modulo ensures valid index
  return colors[index]!;
};

export function ResourceDetailsPanel({
  resource,
  panelMode,
  theme,
  editedUri,
  editedName,
  editedDescription,
  editedMimeType,
  editedContent,
  editedTemplate,
  editedTags,
  editedVisibility,
  editedActive,
  onClose,
  onSave,
  onEdit,
  onDelete,
  onUriChange,
  onNameChange,
  onDescriptionChange,
  onMimeTypeChange,
  onContentChange,
  onTemplateChange,
  onTagsChange,
  onVisibilityChange,
  onActiveChange,
}: ResourceDetailsPanelProps) {
  const [newTag, setNewTag] = useState('');
  const [showContentPreview, setShowContentPreview] = useState(true);

  const isEditing = panelMode === 'edit' || panelMode === 'add';
  const mimeInfo = getMimeTypeInfo(isEditing ? editedMimeType : resource?.mimeType || null);
  const MimeIcon = mimeInfo.icon;

  const removeTag = (index: number) => {
    onTagsChange(editedTags.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      onTagsChange([...editedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const footer = isEditing ? (
    <div className="flex gap-3">
      <button
        onClick={onClose}
        className={`flex-1 px-4 py-2 rounded-md transition-colors border ${theme === 'dark' ? 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-md hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
      >
        {panelMode === 'add' ? 'Create Resource' : 'Save Changes'}
      </button>
    </div>
  ) : (
    <div className="flex gap-3">
      <button
        onClick={onDelete}
        className={`flex-1 px-4 py-2 rounded-md transition-colors border ${theme === 'dark' ? 'bg-red-900/20 text-red-400 border-red-800 hover:bg-red-900/30' : 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100'}`}
      >
        Delete
      </button>
      <button
        onClick={onEdit}
        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-md hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
      >
        Edit Resource
      </button>
    </div>
  );

  return (
    <RightSidePanel
      isOpen={true}
      onClose={onClose}
      title={panelMode === 'add' ? 'Add New Resource' : isEditing ? 'Edit Resource' : 'Resource Details'}
      theme={theme as 'light' | 'dark'}
      width="w-[600px]"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Header with Icon and Status Toggle */}
        {panelMode === 'view' && resource && (
          <div className="flex items-start gap-4 pb-4 border-b" style={{ borderColor: theme === 'dark' ? '#3f3f46' : '#e5e7eb' }}>
            <div className={`w-16 h-16 rounded-lg ${mimeInfo.bg} flex items-center justify-center`}>
              <MimeIcon size={32} className={mimeInfo.color} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {resource.name}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                {resource.mimeType || 'Unknown type'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                {resource.isActive ? 'Active' : 'Inactive'}
              </span>
              <Switch
                checked={resource.isActive}
                onCheckedChange={onActiveChange}
              />
            </div>
          </div>
        )}

        {/* URI Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            URI {isEditing && <span className="text-red-500">*</span>}
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedUri}
              onChange={(e) => onUriChange(e.target.value)}
              placeholder="resource://example/path"
              className={`w-full px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
            />
          ) : (
            <div className="flex items-center gap-2">
              <code className={`flex-1 px-3 py-2 rounded-md font-mono text-sm ${theme === 'dark' ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-100 text-gray-700'}`}>
                {resource?.uri}
              </code>
              <button
                onClick={() => copyToClipboard(resource?.uri || '')}
                className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'}`}
                title="Copy URI"
              >
                <Copy size={16} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
              </button>
            </div>
          )}
        </div>

        {/* Name Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            Name {isEditing && <span className="text-red-500">*</span>}
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="My Resource"
              className={`w-full px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
            />
          ) : (
            <p className={`px-3 py-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              {resource?.name}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            Description
          </label>
          {isEditing ? (
            <textarea
              value={editedDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe this resource..."
              rows={3}
              className={`w-full px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
            />
          ) : (
            <p className={`px-3 py-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
              {resource?.description || 'No description provided'}
            </p>
          )}
        </div>

        {/* MIME Type Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            MIME Type
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedMimeType}
              onChange={(e) => onMimeTypeChange(e.target.value)}
              placeholder="text/plain, application/json, image/png, etc."
              className={`w-full px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
            />
          ) : (
            <p className={`px-3 py-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              {resource?.mimeType || 'Not specified'}
            </p>
          )}
        </div>

        {/* Template Field (optional) */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            URI Template <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>(optional)</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedTemplate}
              onChange={(e) => onTemplateChange(e.target.value)}
              placeholder="resource://example/{param}"
              className={`w-full px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
            />
          ) : resource?.template ? (
            <code className={`block px-3 py-2 rounded-md font-mono text-sm ${theme === 'dark' ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-100 text-gray-700'}`}>
              {resource.template}
            </code>
          ) : (
            <p className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              No template defined
            </p>
          )}
        </div>

        {/* Content Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Content {isEditing && <span className="text-red-500">*</span>}
            </label>
            {!isEditing && (
              <button
                onClick={() => setShowContentPreview(!showContentPreview)}
                className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {showContentPreview ? 'Hide' : 'Show'} Preview
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Resource content..."
              rows={10}
              className={`w-full px-3 py-2 rounded-md border font-mono text-sm ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
            />
          ) : showContentPreview && resource?.content ? (
            <pre className={`px-3 py-2 rounded-md overflow-auto max-h-96 text-sm font-mono ${theme === 'dark' ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-100 text-gray-700'}`}>
              {resource.content}
            </pre>
          ) : (
            <p className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              Content hidden
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {editedTags.map((tag, index) => {
              const colors = getTagColor(tag, theme);
              return (
                <span
                  key={index}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${colors.bg} ${colors.text} ${colors.border}`}
                >
                  {tag}
                  {isEditing && (
                    <button
                      onClick={() => removeTag(index)}
                      className="hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className={`flex-1 px-3 py-2 rounded-md border text-sm ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
              />
              <button
                onClick={addTag}
                className={`px-4 py-2 rounded-md text-sm ${theme === 'dark' ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Visibility */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            Visibility
          </label>
          {isEditing ? (
            <select
              value={editedVisibility}
              onChange={(e) => onVisibilityChange(e.target.value as 'public' | 'team' | 'private')}
              className={`w-full px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="private">Private</option>
              <option value="team">Team</option>
              <option value="public">Public</option>
            </select>
          ) : (
            <span className={`inline-block px-3 py-1 rounded-md text-sm ${
              resource?.visibility === 'public' 
                ? theme === 'dark' ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                : resource?.visibility === 'team'
                ? theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                : theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {resource?.visibility ? resource.visibility.charAt(0).toUpperCase() + resource.visibility.slice(1) : 'Private'}
            </span>
          )}
        </div>

        {/* Metadata (View mode only) */}
        {panelMode === 'view' && resource && (
          <>
            <div className={`pt-4 border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
              <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Metadata
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Size:</span>
                  <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>{formatBytes(resource.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Created:</span>
                  <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Updated:</span>
                  <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>
                    {new Date(resource.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {resource.createdBy && (
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Created by:</span>
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>{resource.createdBy}</span>
                  </div>
                )}
                {resource.modifiedBy && (
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Modified by:</span>
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>{resource.modifiedBy}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics (if available) */}
            {resource.metrics && (
              <div className={`pt-4 border-t ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
                <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Usage Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {resource.metrics.totalExecutions}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Total Executions
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {resource.metrics.successfulExecutions}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Successful
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {resource.metrics.failedExecutions}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Failed
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {(resource.metrics.failureRate * 100).toFixed(1)}%
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Failure Rate
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RightSidePanel>
  );
}
