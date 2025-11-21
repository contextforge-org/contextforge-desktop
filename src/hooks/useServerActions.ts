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

export function useServerActions(
  serversData: MCPServer[],
  setServersData: React.Dispatch<React.SetStateAction<MCPServer[]>>,
  selectedServer: MCPServer | null,
  setSelectedServer: React.Dispatch<React.SetStateAction<MCPServer | null>>,
  setEditedActive: (active: boolean) => void
) {
  const toggleServerActive = useCallback((serverId: number) => {
    const server = findServerById(serversData, serverId);
    if (!server) return;
    
    const wasActive = server.active;
    const previousData = [...serversData];
    
    setServersData(prevData => 
      prevData.map(s => 
        s.id === serverId 
          ? { ...s, active: !s.active }
          : s
      )
    );
    
    // Also update selectedServer if it's the one being toggled
    if (selectedServer?.id === serverId) {
      setSelectedServer({
        ...selectedServer,
        active: !selectedServer.active
      });
      setEditedActive(!selectedServer.active);
    }
    
    // Show confirmation toast with undo option only when deactivating
    if (wasActive) {
      showUndoToast(
        TOAST_CONFIG.MESSAGES.DEACTIVATED(server.name),
        () => {
          setServersData(previousData);
          if (selectedServer?.id === serverId) {
            setSelectedServer({ ...selectedServer, active: true });
            setEditedActive(true);
          }
          toast.info(TOAST_CONFIG.MESSAGES.UNDO_INFO);
        },
        { description: TOAST_CONFIG.MESSAGES.DEACTIVATION_DESC }
      );
    }
  }, [serversData, selectedServer, setServersData, setSelectedServer, setEditedActive]);

  const duplicateServer = useCallback((serverId: number) => {
    const serverToDuplicate = findServerById(serversData, serverId);
    if (serverToDuplicate) {
      const nextId = generateNextId(serversData);
      const newServer = duplicateServerUtil(serverToDuplicate, nextId);
      setServersData(prevData => [...prevData, newServer]);
      toast.success(TOAST_CONFIG.MESSAGES.CREATED(newServer.name));
    }
  }, [serversData, setServersData]);

  const deleteServer = useCallback((serverId: number) => {
    const serverToDelete = findServerById(serversData, serverId);
    if (serverToDelete) {
      const deletedServerIndex = serversData.findIndex(s => s.id === serverId);
      
      // Remove the server
      setServersData(prevData => prevData.filter(s => s.id !== serverId));
      
      // Close side panel if the deleted server was selected
      if (selectedServer?.id === serverId) {
        setSelectedServer(null);
      }
      
      // Show toast with undo option
      showUndoToast(
        TOAST_CONFIG.MESSAGES.DELETED(serverToDelete.name),
        () => {
          // Restore the server at its original position
          setServersData(prevData => {
            const newData = [...prevData];
            newData.splice(deletedServerIndex, 0, serverToDelete);
            return newData;
          });
          toast.success(TOAST_CONFIG.MESSAGES.RESTORED(serverToDelete.name));
        }
      );
    }
  }, [serversData, selectedServer, setServersData, setSelectedServer]);

  const saveServer = useCallback((
    panelMode: 'add' | 'view',
    editedServer: EditedServerData
  ) => {
    if (panelMode === 'add') {
      // Add new gateway
      const nextId = generateNextId(serversData);
      const newGateway = createNewServer(editedServer, nextId);
      setServersData(prevData => [...prevData, newGateway]);
      toast.success(TOAST_CONFIG.MESSAGES.CREATED(newGateway.name));
      return true;
    } else {
      // Save changes to existing gateway
      if (selectedServer) {
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
  }, [serversData, selectedServer, setServersData]);

  return {
    toggleServerActive,
    duplicateServer,
    deleteServer,
    saveServer,
  };
}


