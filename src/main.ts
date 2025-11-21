import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { TrayManager } from './tray-manager';
import { PythonProcessManager } from './python-process-manager';
import { setupIpcHandlers, cleanupIpcHandlers } from './ipc-handlers';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Keep references to prevent garbage collection
let mainWindow: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;
let pythonManager: PythonProcessManager | null = null;

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

  // Setup IPC handlers
  setupIpcHandlers(trayManager, mainWindow);

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
