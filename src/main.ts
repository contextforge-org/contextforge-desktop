import { app, BrowserWindow } from 'electron';
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // On macOS, keep the app running in the tray
  if (process.platform !== 'darwin') {
    // On other platforms, only quit if tray is not active
    if (!trayManager) {
      app.quit();
    }
  }
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
app.on('before-quit', async () => {
  // Set the quitting flag so window close won't be prevented
  if (trayManager) {
    trayManager.setQuitting(true);
  }

  // Stop Python process if running
  if (pythonManager) {
    console.log('Stopping Python process before quit...');
    await pythonManager.stop();
  }

  cleanupIpcHandlers();
  trayManager?.destroy();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
