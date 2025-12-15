import { app, BrowserWindow, Menu } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { TrayManager } from './tray-manager';
import { PythonProcessManager } from './python-process-manager';
import { setupIpcHandlers, cleanupIpcHandlers } from './ipc-handlers';
import { profileManager } from './services/ProfileManager';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Keep references to prevent garbage collection
let mainWindow: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;
let pythonManager: PythonProcessManager | null = null;
let shouldStopBackend = false; // Flag to control backend shutdown

/**
 * Wait for backend to be ready by polling the health endpoint
 */
async function waitForBackendReady(maxAttempts = 30, delayMs = 1000): Promise<boolean> {
  const apiUrl = 'http://127.0.0.1:4444';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        console.log(`✅ Backend is ready (attempt ${attempt}/${maxAttempts})`);
        return true;
      }
    } catch (error) {
      // Backend not ready yet, continue waiting
      console.log(`⏳ Waiting for backend... (attempt ${attempt}/${maxAttempts})`);
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  console.warn('⚠️ Backend did not become ready within timeout');
  return false;
}

/**
 * Start the Python backend and setup the internal profile
 */
async function startBackendAndSetupProfile(manager: PythonProcessManager): Promise<void> {
  try {
    console.log('Starting Python backend...');
    // Start backend - default admin user creation should be handled by environment variables
    await manager.start(["serve"]);
    console.log('Python backend process started');

    // Wait for backend to be fully ready
    console.log('Waiting for backend to be ready...');
    const isReady = await waitForBackendReady();

    if (!isReady) {
      console.warn('⚠️ Backend may not be fully ready, but continuing with profile setup');
    }

    // Ensure internal profile exists and login
    console.log('Setting up internal profile...');
    const result = await profileManager.ensureInternalProfile(!isReady);

    if (result.success) {
      console.log('✅ Internal profile setup complete and logged in');
    } else {
      console.warn('⚠️ Failed to setup internal profile:', result.error);

      // If backend wasn't ready, try again after a delay
      if (!isReady) {
        console.log('Retrying profile setup in 5 seconds...');
        setTimeout(async () => {
          const retryResult = await profileManager.ensureInternalProfile(false);
          if (retryResult.success) {
            console.log('✅ Internal profile setup successful on retry');
          } else {
            console.error('❌ Internal profile setup failed on retry:', retryResult.error);
          }
        }, 5000);
      }
    }
  } catch (error) {
    console.error('Failed to start backend or setup profile:', error);
    throw error;
  }
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Create application menu with custom quit behavior
  createApplicationMenu();

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Initialize Python process manager
  pythonManager = new PythonProcessManager();

  // Initialize tray manager with Python manager
  trayManager = new TrayManager(mainWindow, pythonManager);
  trayManager.createTray();

  // Initialize profile manager to load saved profiles and active profile
  profileManager.initialize().catch(error => {
    console.error('Failed to initialize ProfileManager:', error);
  });

  // Setup IPC handlers
  setupIpcHandlers(trayManager, mainWindow);

  // Check backend preferences and conditionally start the Python backend
  (async () => {
    try {
      const { backendPreferences } = await import('./services/BackendPreferences');
      const shouldAutoStart = backendPreferences.getAutoStartEmbedded();
      
      if (shouldAutoStart) {
        console.log('Auto-start enabled, starting Python backend...');
        await startBackendAndSetupProfile(pythonManager);
      } else {
        console.log('Auto-start disabled, skipping Python backend startup');
        console.log('You can start the backend manually from the tray menu or use an external backend via profiles');
      }
      
      // Update tray menu to reflect backend status
      if (trayManager) {
        trayManager.updateContextMenu();
      }
    } catch (error) {
      console.error('Failed to start backend and setup profile:', error);
      // Update tray menu even on error to show correct status
      if (trayManager) {
        trayManager.updateContextMenu();
      }
    }
  })();

  // Handle window close event (minimize to tray)
  mainWindow.on('close', (event) => {
    if (trayManager) {
      const shouldClose = trayManager.handleWindowClose(event);
      if (!shouldClose) {
        // Window was minimized to tray, don't quit
        return;
      }
    }
  });

  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  console.log('Main window created successfully');
};

/**
 * Create application menu with custom quit behavior
 */
const createApplicationMenu = () => {
  if (process.platform === 'darwin') {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: () => {
              // Hide to tray instead of quitting
              if (mainWindow && trayManager) {
                mainWindow.hide();
                trayManager.showNotification(
                  'Context Forge',
                  'App hidden to tray. Backend still running. Use tray menu to quit completely.',
                  { silent: true }
                );
              }
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          { type: 'separator' },
          { role: 'front' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
});

// Keep app running when all windows are closed (tray mode)
app.on('window-all-closed', () => {
  // Don't quit - keep running in tray on all platforms
  console.log('All windows closed, app continues running in tray');
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    // Show the window if it exists but is hidden
    trayManager?.showWindow();
  }
});

// Cleanup before quit
app.on('before-quit', async (event) => {
  // Set the quitting flag so window close won't be prevented
  if (trayManager) {
    trayManager.setQuitting(true);
  }

  // Only stop Python process if explicitly requested
  if (shouldStopBackend && pythonManager) {
    console.log('Stopping Python process before quit...');
    event.preventDefault(); // Prevent immediate quit
    
    try {
      await pythonManager.stop();
    } catch (error) {
      console.error('Error stopping Python process:', error);
    }
    
    // Now actually quit
    shouldStopBackend = false; // Reset flag
    app.quit();
  } else {
    console.log('Quitting without stopping backend (backend will continue running)');
  }

  cleanupIpcHandlers();
  trayManager?.destroy();
});

// Export function to trigger quit with backend stop
export function quitAndStopBackend() {
  shouldStopBackend = true;
  app.quit();
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
