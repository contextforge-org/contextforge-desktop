import { useCallback } from 'react';
import { toast } from '../lib/toastWithTray';
import { A2AAgent } from '../types/agent';
import * as api from '../lib/api/contextforge-api-ipc';
import {
  mapA2AAgentToA2aAgentCreate,
  mapA2AAgentToA2aAgentUpdate,
  mapA2aAgentReadToA2AAgent
} from '../lib/api/agent-mapper';

export function useAgentActions(
  agentsData: A2AAgent[],
  setAgentsData: React.Dispatch<React.SetStateAction<A2AAgent[]>>,
  selectedAgent: A2AAgent | null,
  setSelectedAgent: React.Dispatch<React.SetStateAction<A2AAgent | null>>,
  setEditedEnabled: (enabled: boolean) => void
) {
  const toggleAgentEnabled = useCallback(async (agentId: string) => {
    const agent = agentsData.find(a => a.id === agentId);
    if (!agent) return;
    
    const wasEnabled = agent.enabled;
    const newEnabledState = !wasEnabled;
    const previousData = [...agentsData];
    
    // Optimistic update
    setAgentsData(prevData =>
      prevData.map(a =>
        a.id === agentId
          ? { ...a, enabled: newEnabledState }
          : a
      )
    );
    
    try {
      // Call API to toggle status
      await api.toggleA2AAgentStatus(agentId, newEnabledState);
      
      // Refresh agent list to ensure UI stays in sync with backend
      const agents = await api.listA2AAgents();
      const mappedAgents = agents.map(mapA2aAgentReadToA2AAgent);
      setAgentsData(mappedAgents);
      
      // Update selectedAgent if it's the one being toggled
      if (selectedAgent?.id === agentId) {
        const updatedAgent = mappedAgents.find(a => a.id === agentId);
        if (updatedAgent) {
          setSelectedAgent(updatedAgent);
          setEditedEnabled(updatedAgent.enabled);
        }
      }
      
      // Show confirmation toast with undo option only when disabling
      if (wasEnabled) {
        toast.success(`Agent "${agent.name}" disabled`, {
          description: 'The agent will no longer accept requests',
          action: {
            label: 'Undo',
            onClick: async () => {
              try {
                await api.toggleA2AAgentStatus(agentId, true);
                
                // Refresh agent list
                const agents = await api.listA2AAgents();
                const mappedAgents = agents.map(mapA2aAgentReadToA2AAgent);
                setAgentsData(mappedAgents);
                
                if (selectedAgent?.id === agentId) {
                  const updatedAgent = mappedAgents.find(a => a.id === agentId);
                  if (updatedAgent) {
                    setSelectedAgent(updatedAgent);
                    setEditedEnabled(true);
                  }
                }
                toast.info('Agent re-enabled');
              } catch (error) {
                toast.error('Failed to undo: ' + (error as Error).message);
              }
            },
          },
        });
      }
    } catch (error) {
      // Revert on error
      setAgentsData(previousData);
      toast.error('Failed to toggle agent: ' + (error as Error).message);
    }
  }, [agentsData, selectedAgent, setAgentsData, setSelectedAgent, setEditedEnabled]);

  const duplicateAgent = useCallback(async (agentId: string) => {
    try {
      const agentToDuplicate = agentsData.find(a => a.id === agentId);
      if (agentToDuplicate) {
        // Create a new agent via API
        const agentCreate = mapA2AAgentToA2aAgentCreate({
          ...agentToDuplicate,
          name: `${agentToDuplicate.name} (Copy)`,
        });
        
        const createdAgent = await api.createA2AAgent(agentCreate);
        const newAgent = mapA2aAgentReadToA2AAgent(createdAgent);
        
        setAgentsData(prevData => [...prevData, newAgent]);
        toast.success(`Agent "${newAgent.name}" created`);
      }
    } catch (error) {
      toast.error('Failed to duplicate agent: ' + (error as Error).message);
    }
  }, [agentsData, setAgentsData]);

  const deleteAgent = useCallback(async (agentId: string) => {
    try {
      const agentToDelete = agentsData.find(a => a.id === agentId);
      if (agentToDelete) {
        const deletedAgentIndex = agentsData.findIndex(a => a.id === agentId);
        
        // Remove the agent from UI immediately
        setAgentsData(prevData => prevData.filter(a => a.id !== agentId));
        
        // Close side panel if the deleted agent was selected
        if (selectedAgent?.id === agentId) {
          setSelectedAgent(null);
        }
        
        // Call API to delete
        await api.deleteA2AAgent(agentId);
        
        // Show toast with undo option
        toast.success(`Agent "${agentToDelete.name}" deleted`, {
          action: {
            label: 'Undo',
            onClick: async () => {
              try {
                // Recreate the agent via API
                const agentCreate = mapA2AAgentToA2aAgentCreate(agentToDelete);
                const recreatedAgent = await api.createA2AAgent(agentCreate);
                const restoredAgent = mapA2aAgentReadToA2AAgent(recreatedAgent);
                
                // Restore in UI
                setAgentsData(prevData => {
                  const newData = [...prevData];
                  newData.splice(deletedAgentIndex, 0, restoredAgent);
                  return newData;
                });
                toast.success(`Agent "${agentToDelete.name}" restored`);
              } catch (error) {
                toast.error('Failed to restore: ' + (error as Error).message);
              }
            },
          },
        });
      }
    } catch (error) {
      toast.error('Failed to delete agent: ' + (error as Error).message);
    }
  }, [agentsData, selectedAgent, setAgentsData, setSelectedAgent]);

  const saveAgent = useCallback(async (
    panelMode: 'add' | 'view',
    editedAgent: Partial<A2AAgent>
  ) => {
    try {
      if (panelMode === 'add') {
        // Add new agent via API
        const agentCreate = mapA2AAgentToA2aAgentCreate(editedAgent);
        const createdAgent = await api.createA2AAgent(agentCreate);
        const newAgent = mapA2aAgentReadToA2AAgent(createdAgent);
        
        setAgentsData(prevData => [...prevData, newAgent]);
        toast.success(`Agent "${newAgent.name}" created`);
        return true;
      } else {
        // Save changes to existing agent
        if (selectedAgent) {
          const agentUpdate = mapA2AAgentToA2aAgentUpdate({
            ...selectedAgent,
            ...editedAgent,
          });
          
          const updatedAgent = await api.updateA2AAgent(selectedAgent.id, agentUpdate);
          const mappedAgent = mapA2aAgentReadToA2AAgent(updatedAgent);
          
          setAgentsData(prevData =>
            prevData.map(agent =>
              agent.id === selectedAgent.id ? mappedAgent : agent
            )
          );
          
          setSelectedAgent(mappedAgent);
          toast.success(`Agent "${mappedAgent.name}" updated`);
          return true;
        }
      }
      return false;
    } catch (error) {
      toast.error('Failed to save agent: ' + (error as Error).message);
      return false;
    }
  }, [selectedAgent, setAgentsData, setSelectedAgent]);

  return {
    toggleAgentEnabled,
    duplicateAgent,
    deleteAgent,
    saveAgent,
  };
}
