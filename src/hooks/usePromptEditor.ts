import { useState, useCallback } from 'react';
import { Prompt, PromptArgument } from '../types/prompt';

export function usePromptEditor() {
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedTemplate, setEditedTemplate] = useState('');
  const [editedArguments, setEditedArguments] = useState<PromptArgument[]>([]);
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedVisibility, setEditedVisibility] = useState<'public' | 'team' | 'private'>('public');
  const [editedTeamId, setEditedTeamId] = useState<string | null>(null);
  const [editedActive, setEditedActive] = useState(true);

  const loadPromptForEditing = useCallback((prompt: Prompt) => {
    setEditedName(prompt.name);
    setEditedDescription(prompt.description || '');
    setEditedTemplate(prompt.template);
    setEditedArguments([...prompt.arguments]);
    setEditedTags([...(prompt.tags || [])]);
    setEditedVisibility((prompt.visibility as 'public' | 'team' | 'private') || 'public');
    setEditedTeamId(prompt.teamId || null);
    setEditedActive(prompt.isActive);
  }, []);

  const resetForNewPrompt = useCallback(() => {
    setEditedName('');
    setEditedDescription('');
    setEditedTemplate('');
    setEditedArguments([]);
    setEditedTags([]);
    setEditedVisibility('public');
    setEditedTeamId(null);
    setEditedActive(true);
  }, []);

  const getEditedPrompt = useCallback(() => ({
    name: editedName,
    description: editedDescription || null,
    template: editedTemplate,
    arguments: editedArguments,
    tags: editedTags.length > 0 ? editedTags : null,
    visibility: editedVisibility,
    team_id: editedTeamId,
  }), [
    editedName,
    editedDescription,
    editedTemplate,
    editedArguments,
    editedTags,
    editedVisibility,
    editedTeamId,
  ]);

  // Argument management
  const addArgument = useCallback(() => {
    setEditedArguments(prev => [
      ...prev,
      { name: '', description: null, required: false }
    ]);
  }, []);

  const updateArgument = useCallback((index: number, field: keyof PromptArgument, value: any) => {
    setEditedArguments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value } as PromptArgument;
      return updated;
    });
  }, []);

  const removeArgument = useCallback((index: number) => {
    setEditedArguments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const moveArgumentUp = useCallback((index: number) => {
    if (index === 0) return;
    setEditedArguments(prev => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index]!, updated[index - 1]!];
      return updated;
    });
  }, []);

  const moveArgumentDown = useCallback((index: number) => {
    setEditedArguments(prev => {
      if (index === prev.length - 1) return prev;
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1]!, updated[index]!];
      return updated;
    });
  }, []);

  return {
    editedName,
    editedDescription,
    editedTemplate,
    editedArguments,
    editedTags,
    editedVisibility,
    editedTeamId,
    editedActive,
    setEditedName,
    setEditedDescription,
    setEditedTemplate,
    setEditedArguments,
    setEditedTags,
    setEditedVisibility,
    setEditedTeamId,
    setEditedActive,
    addArgument,
    updateArgument,
    removeArgument,
    moveArgumentUp,
    moveArgumentDown,
    loadPromptForEditing,
    resetForNewPrompt,
    getEditedPrompt,
  };
}
