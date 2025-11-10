// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Tray methods
  showNotification: (title: string, body: string, options?: { silent?: boolean }) => {
    ipcRenderer.send('tray:show-notification', title, body, options);
  },
  updateBadge: (count: number) => {
    ipcRenderer.send('tray:update-badge', count);
  },
  getTrayConfig: () => ipcRenderer.invoke('tray:get-config'),
  updateTrayConfig: (config: any) => {
    ipcRenderer.send('tray:update-config', config);
  },

  // Window methods
  showWindow: () => {
    ipcRenderer.send('window:show');
  },
  hideWindow: () => {
    ipcRenderer.send('window:hide');
  },
  toggleWindow: () => {
    ipcRenderer.send('window:toggle');
  },
  isWindowVisible: () => ipcRenderer.invoke('window:is-visible'),
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      showNotification: (title: string, body: string, options?: { silent?: boolean }) => void;
      updateBadge: (count: number) => void;
      getTrayConfig: () => Promise<any>;
      updateTrayConfig: (config: any) => void;
      showWindow: () => void;
      hideWindow: () => void;
      toggleWindow: () => void;
      isWindowVisible: () => Promise<boolean>;
    };
  }
}

// Made with Bob
