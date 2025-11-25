import { useCallback } from 'react';
import { toast } from '../lib/toastWithTray';
import { MCPServer } from '../types/server';
import {
  findServerById,
  generateNextId,
  createNewServer,
  duplicateServer as duplicateServerUtil,
  updateServerProperties,
  showUndoToast,
  TOAST_CONFIG,
  EditedServerData
} from '../lib/serverUtils';
import * as api from '../lib/api/contextforge-api-ipc';
import {
  mapMCPServerToServerCreate,
  mapMCPServerToServerUpdate,
  mapMCPServerToGatewayCreate,
  mapMCPServerToGatewayUpdate,
  mapServerReadToMCPServer,
  mapGatewayReadToMCPServer
} from '../lib/api/server-mapper';

type ApiType = 'server' | 'gateway';

export function useServerActions(
  serversData: MCPServer[],
  setServersData: React.Dispatch<React.SetStateAction<MCPServer[]>>,
  selectedServer: MCPServer | null,
  setSelectedServer: React.Dispatch<React.SetStateAction<MCPServer | null>>,
  setEditedActive: (active: boolean) => void,
  apiType: ApiType = 'server'
) {
  const toggleStatus = apiType === 'gateway' ? api.toggleGatewayStatus : api.toggleServerStatus;
  const createEntity = apiType === 'gateway' ? api.createGateway : api.createServer;
  const updateEntity = apiType === 'gateway' ? api.updateGateway : api.updateServer;
  const deleteEntity = apiType === 'gateway' ? api.deleteGateway : api.deleteServer;
  const mapToCreate = apiType === 'gateway' ? mapMCPServerToGatewayCreate : mapMCPServerToServerCreate;
  const mapToUpdate = apiType === 'gateway' ? mapMCPServerToGatewayUpdate : mapMCPServerToServerUpdate;
  
  const toggleServerActive = useCallback(async (serverId: string) => {
    const server = findServerById(serversData, serverId);
    if (!server) return;
    
    const wasActive = server.active;
    const newActiveState = !wasActive;
    const previousData = [...serversData];
    
    setServersData(prevData =>
      prevData.map(s =>
        s.id === serverId
          ? { ...s, active: newActiveState }
          : s
      )
    );
    
    try {
      // Call API to explicitly set the active status (not just toggle)
      await toggleStatus(serverId, newActiveState);
      
      // Refresh server list to ensure UI stays in sync with backend
      let mappedServers: MCPServer[];
      if (apiType === 'gateway') {
        const gateways = await api.listGateways();
        mappedServers = gateways.map(mapGatewayReadToMCPServer);
      } else {
        const servers = await api.listServers();
        mappedServers = servers.map(mapServerReadToMCPServer);
      }
      setServersData(mappedServers);
      
      // Also update selectedServer if it's the one being toggled
      if (selectedServer?.id === serverId) {
        const updatedServer = mappedServers.find(s => s.id === serverId);
        if (updatedServer) {
          setSelectedServer(updatedServer);
          setEditedActive(updatedServer.active);
        }
      }
      
      // Show confirmation toast with undo option only when deactivating
      if (wasActive) {
        showUndoToast(
          TOAST_CONFIG.MESSAGES.DEACTIVATED(server.name),
          async () => {
            try {
              await toggleStatus(serverId, true);
              
              // Refresh server list
              let mappedServers: MCPServer[];
              if (apiType === 'gateway') {
                const gateways = await api.listGateways();
                mappedServers = gateways.map(mapGatewayReadToMCPServer);
              } else {
                const servers = await api.listServers();
                mappedServers = servers.map(mapServerReadToMCPServer);
              }
              setServersData(mappedServers);
              
              if (selectedServer?.id === serverId) {
                const updatedServer = mappedServers.find(s => s.id === serverId);
                if (updatedServer) {
                  setSelectedServer(updatedServer);
                  setEditedActive(true);
                }
              }
              toast.info(TOAST_CONFIG.MESSAGES.UNDO_INFO);
            } catch (error) {
              toast.error('Failed to undo: ' + (error as Error).message);
            }
          },
          { description: TOAST_CONFIG.MESSAGES.DEACTIVATION_DESC }
        );
      }
    } catch (error) {
      // Revert on error
      setServersData(previousData);
      toast.error('Failed to toggle server: ' + (error as Error).message);
    }
  }, [serversData, selectedServer, setServersData, setSelectedServer, setEditedActive, apiType]);

  const duplicateServer = useCallback(async (serverId: string) => {
    try {
      const serverToDuplicate = findServerById(serversData, serverId);
      if (serverToDuplicate) {
        // Create a new entity via API
        const entityCreate = mapToCreate(serverToDuplicate);
        const createdServer = await createEntity({
          ...entityCreate,
          name: `${serverToDuplicate.name} (Copy)`,
        } as any);
        
        // The API will return the new server, we'll need to refresh the list
        // For now, add it locally
        const nextId = generateNextId(serversData);
        const newServer = duplicateServerUtil(serverToDuplicate, nextId);
        setServersData(prevData => [...prevData, newServer]);
        toast.success(TOAST_CONFIG.MESSAGES.CREATED(newServer.name));
      }
    } catch (error) {
      toast.error('Failed to duplicate server: ' + (error as Error).message);
    }
  }, [serversData, setServersData]);

  const deleteServer = useCallback(async (serverId: string) => {
    try {
      const serverToDelete = findServerById(serversData, serverId);
      if (serverToDelete) {
        const deletedServerIndex = serversData.findIndex(s => s.id === serverId);
        
        // Remove the server from UI immediately
        setServersData(prevData => prevData.filter(s => s.id !== serverId));
        
        // Close side panel if the deleted server was selected
        if (selectedServer?.id === serverId) {
          setSelectedServer(null);
        }
        
        // Call API to delete
        await deleteEntity(serverId);
        
        // Show toast with undo option (note: undo would need to recreate via API)
        showUndoToast(
          TOAST_CONFIG.MESSAGES.DELETED(serverToDelete.name),
          async () => {
            try {
              // Would need to recreate the entity via API
              const entityCreate = mapToCreate(serverToDelete);
              await createEntity(entityCreate as any);
              
              // Restore in UI
              setServersData(prevData => {
                const newData = [...prevData];
                newData.splice(deletedServerIndex, 0, serverToDelete);
                return newData;
              });
              toast.success(TOAST_CONFIG.MESSAGES.RESTORED(serverToDelete.name));
            } catch (error) {
              toast.error('Failed to restore: ' + (error as Error).message);
            }
          }
        );
      }
    } catch (error) {
      toast.error('Failed to delete server: ' + (error as Error).message);
    }
  }, [serversData, selectedServer, setServersData, setSelectedServer]);

  const saveServer = useCallback(async (
    panelMode: 'add' | 'view',
    editedServer: EditedServerData
  ) => {
    try {
      if (panelMode === 'add') {
        // Add new entity via API
        const entityCreate = mapToCreate({
          id: editedServer.url || undefined, // For servers, url field is used as custom UUID
          name: editedServer.name,
          url: editedServer.url,
          description: editedServer.description,
          tags: editedServer.tags,
          visibility: editedServer.visibility,
          logoUrl: editedServer.iconUrl || '',
          active: editedServer.active,
          associatedTools: editedServer.associatedTools,
          associatedResources: editedServer.associatedResources,
          associatedPrompts: editedServer.associatedPrompts,
        } as Partial<MCPServer> & { associatedTools?: string[], associatedResources?: string[], associatedPrompts?: string[] });
        
        const createdServer = await createEntity(entityCreate as any);
        
        // Use the server data returned from API (has real ID and all fields)
        // Map it to MCPServer format if needed
        const newServer: MCPServer = {
          id: createdServer.id || createdServer.uuid || generateNextId(serversData),
          name: editedServer.name,
          logoUrl: editedServer.iconUrl || '',
          url: editedServer.url || '',
          description: editedServer.description,
          tags: editedServer.tags,
          active: editedServer.active,
          lastSeen: 'Just now',
          team: 'Unknown',
          visibility: editedServer.visibility,
          transportType: editedServer.transportType,
          authenticationType: editedServer.authenticationType,
          passthroughHeaders: editedServer.passthroughHeaders,
          associatedTools: editedServer.associatedTools,
          associatedResources: editedServer.associatedResources,
          associatedPrompts: editedServer.associatedPrompts,
        };
        
        setServersData(prevData => [...prevData, newServer]);
        toast.success(TOAST_CONFIG.MESSAGES.CREATED(newServer.name));
        return true;
      } else {
        // Save changes to existing entity
        if (selectedServer) {
          const entityUpdate = mapToUpdate({
            ...selectedServer,
            ...editedServer,
          });
          
          await updateEntity(selectedServer.id, entityUpdate);
          
          setServersData(prevData =>
            prevData.map(server =>
              server.id === selectedServer.id
                ? updateServerProperties(server, editedServer)
                : server
            )
          );
          toast.success(TOAST_CONFIG.MESSAGES.UPDATED(editedServer.name));
          return true;
        }
      }
      return false;
    } catch (error) {
      toast.error('Failed to save server: ' + (error as Error).message);
      return false;
    }
  }, [serversData, selectedServer, setServersData]);

  return {
    toggleServerActive,
    duplicateServer,
    deleteServer,
    saveServer,
  };
}


