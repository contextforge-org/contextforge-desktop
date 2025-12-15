import { useState, useEffect, useMemo } from 'react';
import { X, ChevronUp, ChevronDown, Play, FileText, AlertCircle } from 'lucide-react';
import { Switch } from "./ui/switch";
import { RightSidePanel } from './RightSidePanel';
import { Prompt, PromptArgument } from '../types/prompt';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface PromptDetailsPanelProps {
  prompt: Prompt | null;
  panelMode: 'add' | 'view' | 'edit' | 'test';
  theme: string;
  
  // Editor state
  editedName: string;
  editedDescription: string;
  editedTemplate: string;
  editedArguments: PromptArgument[];
  editedTags: string[];
  editedVisibility: 'public' | 'team' | 'private';
  editedActive: boolean;
  
  // Handlers
  onClose: () => void;
  onSave: () => void;
  onModeChange: (mode: 'view' | 'edit' | 'test') => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTemplateChange: (value: string) => void;
  onArgumentAdd: () => void;
  onArgumentUpdate: (index: number, field: keyof PromptArgument, value: any) => void;
  onArgumentRemove: (index: number) => void;
  onArgumentMoveUp: (index: number) => void;
  onArgumentMoveDown: (index: number) => void;
  onTagsChange: (tags: string[]) => void;
  onVisibilityChange: (visibility: 'public' | 'team' | 'private') => void;
  onActiveChange: (active: boolean) => void;
  onToggleActive?: (promptId: string) => void;
  onExecute?: (args: Record<string, any>) => Promise<any>;
}

export function PromptDetailsPanel({
  prompt,
  panelMode,
  theme,
  editedName,
  editedDescription,
  editedTemplate,
  editedArguments,
  editedTags,
  editedVisibility,
  editedActive,
  onClose,
  onSave,
  onModeChange,
  onNameChange,
  onDescriptionChange,
  onTemplateChange,
  onArgumentAdd,
  onArgumentUpdate,
  onArgumentRemove,
  onArgumentMoveUp,
  onArgumentMoveDown,
  onTagsChange,
  onVisibilityChange,
  onActiveChange,
  onToggleActive,
  onExecute,
}: PromptDetailsPanelProps) {
  const [testArguments, setTestArguments] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; output?: any; executionTime?: number } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Extract variables from template using {{ }} syntax
  const templateVariables = useMemo(() => {
    const regex = /\{\{\s*(\w+)\s*\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(editedTemplate)) !== null) {
      if (match[1]) {
        matches.add(match[1]);
      }
    }
    return Array.from(matches);
  }, [editedTemplate]);

  // Find missing arguments (variables in template but not in arguments list)
  const missingArguments = useMemo(() => {
    const existingArgNames = new Set(editedArguments.map(arg => arg.name));
    return templateVariables.filter(varName => !existingArgNames.has(varName));
  }, [templateVariables, editedArguments]);

  // Auto-add missing arguments when template changes in edit mode
  useEffect(() => {
    if ((panelMode === 'edit' || panelMode === 'add') && missingArguments.length > 0) {
      // Only auto-add if we're in edit/add mode
      // This prevents auto-adding when just viewing
    }
  }, [missingArguments, panelMode]);

  const removeTag = (index: number) => {
    onTagsChange(editedTags.filter((_, i) => i !== index));
  };

  const handleExecute = async () => {
    if (!onExecute) return;
    setIsExecuting(true);
    const startTime = Date.now();
    try {
      const result = await onExecute(testArguments);
      const executionTime = (Date.now() - startTime) / 1000;
      
      // Debug: log the result
      console.log('Prompt execution result:', result);
      
      setTestResult({
        success: true,
        message: 'Prompt rendered successfully',
        output: result,
        executionTime
      });
    } catch (error) {
      const executionTime = (Date.now() - startTime) / 1000;
      console.error('Prompt execution error:', error);
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Execution failed',
        output: null,
        executionTime
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const footer = panelMode !== 'view' && panelMode !== 'test' ? (
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
        {panelMode === 'add' ? 'Create Prompt' : 'Save Changes'}
      </button>
    </div>
  ) : null;

  return (
    <RightSidePanel
      isOpen={true}
      onClose={onClose}
      title={panelMode === 'add' ? 'Create New Prompt' : 'Prompt Details'}
      theme={theme as 'light' | 'dark'}
      width="w-[600px]"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Mode Tabs */}
        {panelMode !== 'add' && prompt && (
          <div className="flex gap-2 border-b pb-2" style={{ borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb' }}>
            <button
              onClick={() => onModeChange('view')}
              className={`px-4 py-2 rounded-t-md transition-colors ${
                panelMode === 'view'
                  ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                  : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              View
            </button>
            <button
              onClick={() => onModeChange('edit')}
              className={`px-4 py-2 rounded-t-md transition-colors ${
                panelMode === 'edit'
                  ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                  : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => onModeChange('test')}
              className={`px-4 py-2 rounded-t-md transition-colors ${
                panelMode === 'test'
                  ? theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'
                  : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Test
            </button>
          </div>
        )}

        {/* Header with Name and Toggle */}
        {panelMode === 'view' && prompt && prompt.id && (
          <div className="flex items-start gap-4 pb-4 border-b" style={{ borderColor: theme === 'dark' ? '#27272a' : '#e5e7eb' }}>
            <div className={`size-12 flex items-center justify-center shrink-0 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
              <FileText size={24} className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editedName}
                </h3>
                <Switch
                  checked={editedActive}
                  onCheckedChange={() => onToggleActive?.(prompt.id)}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                {editedArguments.length} argument{editedArguments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* VIEW MODE */}
        {panelMode === 'view' && prompt && (
          <>
            {/* Description */}
            {editedDescription && (
              <div>
                <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  {editedDescription}
                </p>
              </div>
            )}

            {/* Template */}
            <div>
              <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Template
              </label>
              <div className={`p-4 rounded-md font-mono text-sm whitespace-pre-wrap ${theme === 'dark' ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-50 text-gray-800'}`}>
                {editedTemplate}
              </div>
            </div>

            {/* Arguments */}
            {editedArguments.length > 0 && (
              <div>
                <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Arguments ({editedArguments.length})
                </label>
                <div className="space-y-3">
                  {editedArguments.map((arg, index) => (
                    <div key={index} className={`p-3 rounded-md ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {arg.name}
                        </span>
                        {arg.required && (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        )}
                      </div>
                      {arg.description && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                          {arg.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {editedTags.length > 0 && (
              <div>
                <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {editedTags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            <div>
              <label className={`block mb-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Metrics
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Total Executions</p>
                  <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {prompt.metrics.totalExecutions}
                  </p>
                </div>
                <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Success Rate</p>
                  <p className={`text-xl font-semibold ${getSuccessRateColor(100 - prompt.metrics.failureRate)}`}>
                    {(100 - prompt.metrics.failureRate).toFixed(1)}%
                  </p>
                </div>
                {prompt.metrics.avgResponseTime && (
                  <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>Avg Response Time</p>
                    <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {prompt.metrics.avgResponseTime.toFixed(2)}s
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className={`pt-4 border-t space-y-2 ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
              <div className="flex justify-between text-sm">
                <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Created</span>
                <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                  {formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Updated</span>
                <span className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>
                  {formatDistanceToNow(new Date(prompt.updatedAt), { addSuffix: true })}
                </span>
              </div>
              {prompt.visibility && (
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}>Visibility</span>
                  <Badge variant="outline">{prompt.visibility}</Badge>
                </div>
              )}
            </div>
          </>
        )}

        {/* EDIT MODE */}
        {(panelMode === 'edit' || panelMode === 'add') && (
          <>
            {/* Name */}
            <div>
              <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g., Code Review Assistant"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={editedDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
                rows={3}
                placeholder="Describe this prompt..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
              />
            </div>

            {/* Template */}
            <div>
              <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Template <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editedTemplate}
                onChange={(e) => onTemplateChange(e.target.value)}
                rows={6}
                placeholder="Enter your prompt template with {{ variables }}..."
                className={`w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                Use {'{{variable_name}}'} for template variables
              </p>
            </div>

            {/* Arguments */}
            <div>
              <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Arguments
              </label>
              <div className="space-y-3">
                {editedArguments.map((arg, index) => (
                  <div key={index} className={`p-3 rounded-md border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onArgumentMoveUp(index)}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-800'}`}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => onArgumentMoveDown(index)}
                          disabled={index === editedArguments.length - 1}
                          className={`p-1 rounded ${index === editedArguments.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-800'}`}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={arg.name}
                        onChange={(e) => onArgumentUpdate(index, 'name', e.target.value)}
                        placeholder="argument_name"
                        className={`flex-1 px-2 py-1 border rounded text-sm ${theme === 'dark' ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={arg.required || false}
                          onChange={(e) => onArgumentUpdate(index, 'required', e.target.checked)}
                          className="rounded"
                        />
                        Required
                      </label>
                      <button
                        onClick={() => onArgumentRemove(index)}
                        className={`p-1 rounded hover:bg-red-500/20 text-red-500`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={arg.description || ''}
                      onChange={(e) => onArgumentUpdate(index, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      className={`w-full px-2 py-1 border rounded text-sm ${theme === 'dark' ? 'bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'}`}
                    />
                  </div>
                ))}
              </div>
              {/* Missing Arguments Warning */}
              {missingArguments.length > 0 && (
                <div className={`p-3 rounded-md border ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                        Missing Arguments Detected
                      </p>
                      <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        Found {missingArguments.length} variable{missingArguments.length !== 1 ? 's' : ''} in template without matching argument{missingArguments.length !== 1 ? 's' : ''}: {missingArguments.join(', ')}
                      </p>
                      <button
                        onClick={() => {
                          missingArguments.forEach(varName => {
                            onArgumentAdd();
                            // Update the last added argument with the variable name
                            const newIndex = editedArguments.length;
                            setTimeout(() => {
                              onArgumentUpdate(newIndex, 'name', varName);
                              onArgumentUpdate(newIndex, 'required', true);
                            }, 0);
                          });
                        }}
                        className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-yellow-700 hover:bg-yellow-600 text-white' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}
                      >
                        Add All Missing Arguments
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={onArgumentAdd}
                className={`mt-2 w-full px-3 py-2 border-2 border-dashed rounded-md transition-colors ${theme === 'dark' ? 'border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-300' : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700'}`}
              >
                + Add Argument Manually
              </button>
            </div>

            {/* Tags */}
            <div>
              <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
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
                Press Enter to add a tag
              </p>
            </div>

            {/* Visibility */}
            <div>
              <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
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
          </>
        )}

        {/* TEST MODE */}
        {panelMode === 'test' && prompt && (
          <>
            {/* Template Preview */}
            <div>
              <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                Template Preview
              </label>
              <div className={`p-4 rounded-md font-mono text-sm whitespace-pre-wrap ${theme === 'dark' ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-50 text-gray-800'}`}>
                {editedTemplate}
              </div>
            </div>

            {/* Argument Inputs */}
            {editedArguments.length > 0 && (
              <div>
                <label className={`block mb-3 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Input Arguments
                </label>
                <div className="space-y-3">
                  {editedArguments.map((arg, index) => (
                    <div key={index}>
                      <label className={`block mb-1 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                        {arg.name} {arg.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={testArguments[arg.name] || ''}
                        onChange={(e) => setTestArguments({ ...testArguments, [arg.name]: e.target.value })}
                        placeholder={arg.description || `Enter ${arg.name}`}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 py-3 rounded-md hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={18} />
              {isExecuting ? 'Executing...' : 'Execute Prompt'}
            </button>

            {/* Results */}
            {testResult && (
              <div>
                <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Results
                </label>
                <div className={`rounded-md border ${testResult.success ? (theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200') : (theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')}`}>
                  {/* Status Header */}
                  <div className="p-4 border-b" style={{ borderColor: testResult.success ? (theme === 'dark' ? '#15803d' : '#86efac') : (theme === 'dark' ? '#991b1b' : '#fca5a5') }}>
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${testResult.success ? 'text-green-500' : 'text-red-500'}`}>
                        {testResult.success ? '✓ Success' : '✗ Failed'}
                      </span>
                      {testResult.executionTime !== undefined && (
                        <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                          {testResult.executionTime.toFixed(2)}s
                        </span>
                      )}
                    </div>
                    {testResult.message && (
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                        {testResult.message}
                      </p>
                    )}
                  </div>
                  
                  {/* Output - Display messages array */}
                  {testResult.output && (
                    <div className="p-4 space-y-3">
                      {testResult.output.messages && Array.isArray(testResult.output.messages) ? (
                        testResult.output.messages.map((message: any, index: number) => (
                          <div key={index} className={`p-3 rounded border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
                            <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                              Message {index + 1} ({message.role || 'unknown'})
                            </div>
                            <div className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}`}>
                              {message.content?.text || JSON.stringify(message.content) || ''}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`p-3 rounded font-mono text-sm whitespace-pre-wrap ${theme === 'dark' ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-50 text-gray-800'}`}>
                          {typeof testResult.output === 'string' ? testResult.output : JSON.stringify(testResult.output, null, 2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RightSidePanel>
  );
}
