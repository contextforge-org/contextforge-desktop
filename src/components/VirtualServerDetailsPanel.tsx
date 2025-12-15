import { X } from 'lucide-react';
import { Switch } from "./ui/switch";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RightSidePanel } from './RightSidePanel';
import { AssociatedItemsSelector } from './AssociatedItemsSelector';
import { MCPServer } from '../types/server';

interface VirtualServerDetailsPanelProps {
  server: MCPServer | null;
  panelMode: 'add' | 'view';
  theme: string;
  editedName: string;
  editedUrl: string;
  editedIconUrl: string;
  editedDescription: string;
  editedTags: string[];
  editedVisibility: 'public' | 'team' | 'private';
  editedActive: boolean;
  editedTools: string[];
  editedResources: string[];
  editedPrompts: string[];
  editedA2aAgents: string[];
  availableTools: Array<{id: string, name: string}>;
  availableResources: Array<{id: string, name: string}>;
  availablePrompts: Array<{id: string, name: string}>;
  availableA2aAgents: Array<{id: string, name: string}>;
  toolsSearch: string;
  resourcesSearch: string;
  promptsSearch: string;
  a2aAgentsSearch: string;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onIconUrlChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onVisibilityChange: (visibility: 'public' | 'team' | 'private') => void;
  onActiveChange: (active: boolean) => void;
  onToggleTool: (tool: string) => void;
  onRemoveTool: (tool: string) => void;
  onToggleResource: (resource: string) => void;
  onRemoveResource: (resource: string) => void;
  onTogglePrompt: (prompt: string) => void;
  onRemovePrompt: (prompt: string) => void;
  onToggleA2aAgent: (agent: string) => void;
  onRemoveA2aAgent: (agent: string) => void;
  onToolsSearchChange: (value: string) => void;
  onResourcesSearchChange: (value: string) => void;
  onPromptsSearchChange: (value: string) => void;
  onA2aAgentsSearchChange: (value: string) => void;
}

export function VirtualServerDetailsPanel({
  server,
  panelMode,
  theme,
  editedName,
  editedUrl,
  editedIconUrl,
  editedDescription,
  editedTags,
  editedVisibility,
  editedActive,
  editedTools,
  editedResources,
  editedPrompts,
  editedA2aAgents,
  availableTools,
  availableResources,
  availablePrompts,
  availableA2aAgents,
  toolsSearch,
  resourcesSearch,
  promptsSearch,
  a2aAgentsSearch,
  onClose,
  onSave,
  onNameChange,
  onUrlChange,
  onIconUrlChange,
  onDescriptionChange,
  onTagsChange,
  onVisibilityChange,
  onActiveChange,
  onToggleTool,
  onRemoveTool,
  onToggleResource,
  onRemoveResource,
  onTogglePrompt,
  onRemovePrompt,
  onToggleA2aAgent,
  onRemoveA2aAgent,
  onToolsSearchChange,
  onResourcesSearchChange,
  onPromptsSearchChange,
  onA2aAgentsSearchChange,
}: VirtualServerDetailsPanelProps) {
  const removeTag = (index: number) => {
    onTagsChange(editedTags.filter((_, i) => i !== index));
  };

  const footer = (
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
        {panelMode === 'add' ? 'Create Virtual Server' : 'Save Changes'}
      </button>
    </div>
  );

  return (
    <RightSidePanel
      isOpen={true}
      onClose={onClose}
      title={panelMode === 'add' ? 'Create Virtual Server' : 'Virtual Server Details'}
      theme={theme as 'light' | 'dark'}
      width="w-[500px]"
      footer={footer}
    >
      <div className="space-y-6">
          {/* Logo, Name and Toggle Header */}
          {panelMode === 'view' && server && (
            <div className="flex items-start gap-4 pb-4">
              {/* Logo */}
              <div className={`size-12 flex items-center justify-center shrink-0`}>
                <ImageWithFallback
                  src={server.logoUrl}
                  alt={`${server.name} logo`}
                  fallbackName={server.name}
                  className="max-w-10 max-h-10 w-auto h-auto object-contain"
                />
              </div>
              
              {/* Name, UUID and Toggle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {editedName}
                  </h3>
                  <Switch
                    checked={editedActive}
                    onCheckedChange={onActiveChange}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
                <p className={`text-sm font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  {editedUrl || server?.id || 'No UUID'}
                </p>
              </div>
            </div>
          )}

          {/* Add mode - show input fields for UUID and name */}
          {panelMode === 'add' && (
            <>
              {/* Custom UUID (optional) */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Custom UUID (optional)
                </label>
                <input
                  type="text"
                  value={editedUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="Leave blank to auto-generate"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Provide a custom UUID if you need to preserve an existing server ID
                </p>
              </div>

              {/* Virtual Server Name */}
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Name
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g., My Virtual Server"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                />
              </div>
            </>
          )}

          {/* Description */}
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={editedDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={4}
              placeholder="Describe this virtual server..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
            />
          </div>

          {/* Icon URL */}
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Icon URL
            </label>
            <input
              type="text"
              value={editedIconUrl}
              onChange={(e) => onIconUrlChange(e.target.value)}
              placeholder="https://example.com/icon.png"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
            />
          </div>

          {/* Tags */}
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Tags
            </label>
            <div className={`w-full px-3 py-2 border rounded-md focus-within:ring-2 focus-within:ring-cyan-500 flex flex-wrap gap-2 items-center ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
              {editedTags.map((tag, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className={`hover:opacity-70 transition-opacity`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder={editedTags.length === 0 ? "Enter tag" : ""}
                className={`flex-1 min-w-[120px] outline-none ${theme === 'dark' ? 'bg-zinc-900 text-white placeholder:text-zinc-500' : 'bg-white text-gray-900 placeholder:text-gray-400'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value && !editedTags.includes(value)) {
                      onTagsChange([...editedTags, value]);
                      e.currentTarget.value = '';
                    }
                  } else if (e.key === 'Backspace' && e.currentTarget.value === '' && editedTags.length > 0) {
                    onTagsChange(editedTags.slice(0, -1));
                  }
                }}
              />
            </div>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              Press Enter to submit a tag
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
              Visibility
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={editedVisibility === 'public'}
                  onChange={(e) => onVisibilityChange(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Public</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="team"
                  checked={editedVisibility === 'team'}
                  onChange={(e) => onVisibilityChange(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Team</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={editedVisibility === 'private'}
                  onChange={(e) => onVisibilityChange(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>Private</span>
              </label>
            </div>
          </div>

          {/* Associated Tools */}
          <AssociatedItemsSelector
            label="Associated Tools"
            items={editedTools}
            selectedItems={editedTools}
            availableItems={availableTools}
            searchValue={toolsSearch}
            theme={theme}
            onToggle={onToggleTool}
            onRemove={onRemoveTool}
            onSearchChange={onToolsSearchChange}
          />

          {/* Associated Resources */}
          <AssociatedItemsSelector
            label="Associated Resources"
            items={editedResources}
            selectedItems={editedResources}
            availableItems={availableResources}
            searchValue={resourcesSearch}
            theme={theme}
            onToggle={onToggleResource}
            onRemove={onRemoveResource}
            onSearchChange={onResourcesSearchChange}
          />

          {/* Associated Prompts */}
          <AssociatedItemsSelector
            label="Associated Prompts"
            items={editedPrompts}
            selectedItems={editedPrompts}
            availableItems={availablePrompts}
            searchValue={promptsSearch}
            theme={theme}
            onToggle={onTogglePrompt}
            onRemove={onRemovePrompt}
            onSearchChange={onPromptsSearchChange}
          />

          {/* Associated A2A Agents */}
          <AssociatedItemsSelector
            label="Associated A2A Agents"
            items={editedA2aAgents}
            selectedItems={editedA2aAgents}
            availableItems={availableA2aAgents}
            searchValue={a2aAgentsSearch}
            theme={theme}
            onToggle={onToggleA2aAgent}
            onRemove={onRemoveA2aAgent}
            onSearchChange={onA2aAgentsSearchChange}
          />
        </div>
    </RightSidePanel>
  );
}
