import { useCallback } from 'react';
import { toast } from '../lib/toastWithTray';
import { Prompt, PromptCreate, PromptUpdate } from '../types/prompt';
import * as api from '../lib/api/contextforge-api-ipc';

export function usePromptActions(
  promptsData: Prompt[],
  setPromptsData: React.Dispatch<React.SetStateAction<Prompt[]>>,
  selectedPrompt: Prompt | null,
  setSelectedPrompt: React.Dispatch<React.SetStateAction<Prompt | null>>,
  setEditedActive: (active: boolean) => void
) {
  const togglePromptActive = useCallback(async (promptId: string) => {
    const prompt = promptsData.find(p => p.id.toString() === promptId);
    if (!prompt) return;
    
    const wasActive = prompt.isActive;
    const newActiveState = !wasActive;
    const previousData = [...promptsData];
    
    // Optimistic update
    setPromptsData(prevData =>
      prevData.map(p =>
        p.id.toString() === promptId
          ? { ...p, isActive: newActiveState }
          : p
      )
    );
    
    try {
      await api.togglePromptStatus(promptId, newActiveState);
      
      // Refresh prompt list
      const prompts = await api.listPrompts();
      setPromptsData(prompts);
      
      // Update selected prompt if it's the one being toggled
      if (selectedPrompt?.id.toString() === promptId) {
        const updatedPrompt = prompts.find(p => p.id.toString() === promptId);
        if (updatedPrompt) {
          setSelectedPrompt(updatedPrompt);
          setEditedActive(updatedPrompt.isActive);
        }
      }
      
      toast.success(
        wasActive 
          ? `Deactivated prompt: ${prompt.name}` 
          : `Activated prompt: ${prompt.name}`
      );
    } catch (error) {
      // Revert on error
      setPromptsData(previousData);
      toast.error('Failed to toggle prompt: ' + (error as Error).message);
    }
  }, [promptsData, selectedPrompt, setPromptsData, setSelectedPrompt, setEditedActive]);

  const duplicatePrompt = useCallback(async (promptId: string) => {
    try {
      const promptToDuplicate = promptsData.find(p => p.id.toString() === promptId);
      if (promptToDuplicate) {
        const promptCreate: PromptCreate = {
          name: `${promptToDuplicate.name} (Copy)`,
          description: promptToDuplicate.description,
          template: promptToDuplicate.template,
          arguments: promptToDuplicate.arguments,
          tags: promptToDuplicate.tags || null,
          team_id: promptToDuplicate.teamId,
          visibility: promptToDuplicate.visibility,
        };
        
        await api.createPrompt(promptCreate);
        
        // Refresh prompt list
        const prompts = await api.listPrompts();
        setPromptsData(prompts);
        
        toast.success(`Created duplicate: ${promptCreate.name}`);
      }
    } catch (error) {
      toast.error('Failed to duplicate prompt: ' + (error as Error).message);
    }
  }, [promptsData, setPromptsData]);

  const deletePrompt = useCallback(async (promptId: string) => {
    try {
      const promptToDelete = promptsData.find(p => p.id.toString() === promptId);
      if (promptToDelete) {
        // Remove from UI immediately
        setPromptsData(prevData => prevData.filter(p => p.id.toString() !== promptId));
        
        // Close side panel if the deleted prompt was selected
        if (selectedPrompt?.id.toString() === promptId) {
          setSelectedPrompt(null);
        }
        
        // Call API to delete
        await api.deletePrompt(promptId);
        
        toast.success(`Deleted prompt: ${promptToDelete.name}`);
      }
    } catch (error) {
      // Refresh on error to restore
      const prompts = await api.listPrompts();
      setPromptsData(prompts);
      toast.error('Failed to delete prompt: ' + (error as Error).message);
    }
  }, [promptsData, selectedPrompt, setPromptsData, setSelectedPrompt]);

  const savePrompt = useCallback(async (
    panelMode: 'add' | 'view',
    editedPrompt: PromptCreate | PromptUpdate
  ) => {
    try {
      if (panelMode === 'add') {
        // Create new prompt
        await api.createPrompt(editedPrompt as PromptCreate);
        
        // Refresh prompt list
        const prompts = await api.listPrompts();
        setPromptsData(prompts);
        
        toast.success(`Created prompt: ${editedPrompt.name}`);
        return true;
      } else {
        // Update existing prompt
        if (selectedPrompt) {
          await api.updatePrompt(selectedPrompt.id.toString(), editedPrompt as PromptUpdate);
          
          // Refresh prompt list
          const prompts = await api.listPrompts();
          setPromptsData(prompts);
          
          // Update selected prompt
          const updatedPrompt = prompts.find(p => p.id === selectedPrompt.id);
          if (updatedPrompt) {
            setSelectedPrompt(updatedPrompt);
          }
          
          toast.success(`Updated prompt: ${editedPrompt.name || selectedPrompt.name}`);
          return true;
        }
      }
      return false;
    } catch (error) {
      toast.error('Failed to save prompt: ' + (error as Error).message);
      return false;
    }
  }, [selectedPrompt, setPromptsData, setSelectedPrompt]);

  const executePrompt = useCallback(async (
    promptId: string,
    args: Record<string, any>
  ): Promise<any> => {
    try {
      const result = await api.executePrompt(promptId, args);
      toast.success('Prompt executed successfully');
      return result;
    } catch (error) {
      toast.error('Failed to execute prompt: ' + (error as Error).message);
      throw error;
    }
  }, []);

  return {
    togglePromptActive,
    duplicatePrompt,
    deletePrompt,
    savePrompt,
    executePrompt,
  };
}
