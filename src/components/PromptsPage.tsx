import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { Prompt } from '../types/prompt';
import { usePromptFilters } from '../hooks/usePromptFilters';
import { usePromptEditor } from '../hooks/usePromptEditor';
import { usePromptActions } from '../hooks/usePromptActions';
import { PromptTableView } from './PromptTableView';
import { PromptDetailsPanel } from './PromptDetailsPanel';
import { PageHeader, DataTableToolbar } from './common';
import * as api from '../lib/api/contextforge-api-ipc';
import { withAuth } from '../lib/api/auth-helper';
import { toast } from '../lib/toastWithTray';
import { FileText } from 'lucide-react';

export function PromptsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [panelMode, setPanelMode] = useState<'add' | 'view' | 'edit' | 'test'>('view');
  const [promptsData, setPromptsData] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();
  const { selectedTeamId } = useTeam();

  // Filter prompts by selected team
  const filteredPrompts = useMemo(() => {
    if (!selectedTeamId) {
      return promptsData;
    }
    return promptsData.filter(prompt => prompt.teamId === selectedTeamId);
  }, [promptsData, selectedTeamId]);

  // Fetch prompts on mount
  useEffect(() => {
    async function fetchPrompts() {
      try {
        setIsLoading(true);
        setError(null);
        
        const prompts = await withAuth(
          () => api.listPrompts(),
          'Failed to load prompts'
        );
        setPromptsData(prompts);
        toast.success('Connected to ContextForge backend');
      } catch (err) {
        console.log(err);
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        toast.error('Failed to load prompts: ' + errorMessage);
        console.error('Failed to fetch prompts:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrompts();
  }, []);

  // Use custom hooks for filters, editor, and actions
  const filterHook = usePromptFilters(filteredPrompts);
  const editorHook = usePromptEditor();
  const actionsHook = usePromptActions(
    promptsData,
    setPromptsData,
    selectedPrompt,
    setSelectedPrompt,
    editorHook.setEditedActive
  );

  // Memoized handlers
  const handlePromptClick = useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPanelMode('view');
    editorHook.loadPromptForEditing(prompt);
    setShowSidePanel(true);
  }, [editorHook]);

  const handleAddPromptClick = useCallback(() => {
    editorHook.resetForNewPrompt();
    setPanelMode('add');
    setSelectedPrompt({} as Prompt);
    setShowSidePanel(true);
  }, [editorHook]);

  const handleSavePrompt = useCallback(async () => {
    const editedPrompt = editorHook.getEditedPrompt();
    const success = await actionsHook.savePrompt(panelMode === 'add' ? 'add' : 'view', editedPrompt);
    if (success) {
      setShowSidePanel(false);
      setPanelMode('view');
    }
  }, [actionsHook, panelMode, editorHook]);

  const handleClosePanel = useCallback(() => {
    setShowSidePanel(false);
    setPanelMode('view');
  }, []);

  const handleModeChange = useCallback((mode: 'view' | 'edit' | 'test') => {
    setPanelMode(mode);
  }, []);

  const handleExecutePrompt = useCallback(async (args: Record<string, any>) => {
    if (!selectedPrompt) return;
    try {
      const result = await api.executePrompt(selectedPrompt.id.toString(), args);
      toast.success('Prompt executed successfully');
      return result;
    } catch (error) {
      toast.error('Failed to execute prompt: ' + (error as Error).message);
      throw error;
    }
  }, [selectedPrompt]);

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <PageHeader
          title="Prompts"
          description="Manage and test your prompt templates with dynamic arguments."
          theme={theme}
        />

        <div className="p-[32px]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Loading prompts...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
                Failed to load prompts
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
          {!isLoading && !error && filteredPrompts.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <FileText
                  className={`mx-auto h-16 w-16 mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
                />
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  No Prompts Yet
                </h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get started by creating your first prompt template with dynamic arguments.
                </p>
                <button
                  onClick={handleAddPromptClick}
                  className="h-[36px] px-[12px] bg-cyan-500 hover:bg-cyan-600 rounded-[6px] transition-colors shadow-sm shadow-cyan-500/20 text-white font-medium text-[13px]"
                >
                  Create Your First Prompt
                </button>
              </div>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !error && filteredPrompts.length > 0 && (
            <div className={`rounded-lg border-b border-l border-r overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
              {/* Table Toolbar */}
              <DataTableToolbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showSearch={true}
                primaryAction={{
                  label: 'Add Prompt',
                  onClick: handleAddPromptClick,
                }}
                theme={theme}
              />

              {/* Table View */}
              {viewMode === 'table' && (
                <PromptTableView
                  prompts={filterHook.filteredData}
                  theme={theme}
                  selectedPrompt={selectedPrompt}
                  onPromptClick={handlePromptClick}
                  onToggleActive={actionsHook.togglePromptActive}
                  onDuplicate={actionsHook.duplicatePrompt}
                  onDelete={actionsHook.deletePrompt}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side Panel */}
      {showSidePanel && (
        <PromptDetailsPanel
          prompt={selectedPrompt}
          panelMode={panelMode}
          theme={theme}
          editedName={editorHook.editedName}
          editedDescription={editorHook.editedDescription}
          editedTemplate={editorHook.editedTemplate}
          editedArguments={editorHook.editedArguments}
          editedTags={editorHook.editedTags}
          editedVisibility={editorHook.editedVisibility}
          editedActive={editorHook.editedActive}
          onClose={handleClosePanel}
          onSave={handleSavePrompt}
          onModeChange={handleModeChange}
          onNameChange={editorHook.setEditedName}
          onDescriptionChange={editorHook.setEditedDescription}
          onTemplateChange={editorHook.setEditedTemplate}
          onArgumentAdd={editorHook.addArgument}
          onArgumentUpdate={editorHook.updateArgument}
          onArgumentRemove={editorHook.removeArgument}
          onArgumentMoveUp={editorHook.moveArgumentUp}
          onArgumentMoveDown={editorHook.moveArgumentDown}
          onTagsChange={editorHook.setEditedTags}
          onVisibilityChange={editorHook.setEditedVisibility}
          onActiveChange={editorHook.setEditedActive}
          onExecute={handleExecutePrompt}
        />
      )}
    </div>
  );
}
