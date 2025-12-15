import { app, Tray, Menu, BrowserWindow, nativeImage, Notification } from 'electron';
import path from 'node:path';
import { PythonProcessManager } from './python-process-manager';

export interface TrayConfig {
  notificationsEnabled: boolean;
  notificationSound: boolean;
  minimizeToTray: boolean;
}

export class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;
  private pythonManager: PythonProcessManager | null = null;
  private config: TrayConfig = {
    notificationsEnabled: true,
    notificationSound: true,
    minimizeToTray: true,
  };
  private unreadCount = 0;
  private isQuitting = false;
  private menuUpdateInterval: NodeJS.Timeout | null = null;
  private quitAndStopBackendCallback: (() => void) | null = null;

  constructor(mainWindow: BrowserWindow, pythonManager?: PythonProcessManager) {
    this.mainWindow = mainWindow;
    this.pythonManager = pythonManager || null;
  }

  /**
   * Set the callback for quitting and stopping backend
   */
  public setQuitAndStopBackendCallback(callback: () => void): void {
    this.quitAndStopBackendCallback = callback;
  }

  /**
   * Initialize the system tray
   */
  public createTray(): void {
    if (this.tray) {
      return; // Already created
    }

    const iconPath = this.getTrayIconPath();

    const icon = nativeImage.createFromPath(iconPath);

    // Create tray with icon
    this.tray = new Tray(icon);


    // Set tooltip
    this.tray.setToolTip('Context Forge');

    // Build and set context menu
    this.updateContextMenu();

    // Start periodic menu updates (every 10 seconds) to keep uptime fresh
    this.startMenuUpdateInterval();

    // Handle tray icon click
    this.tray.on('click', () => {
      console.log('Tray icon clicked');
    });

    // Handle right-click (Windows/Linux)
    this.tray.on('right-click', () => {
      console.log('Tray icon right-clicked');
      if (this.tray) {
        this.tray.popUpContextMenu();
      }
    });

    console.log('✅ System tray created successfully');
    console.log('Look for the icon in your macOS menubar (top right)');
  }

  /**
   * Get the appropriate tray icon path based on platform
   */
  private getTrayIconPath(): string {
    const platform = process.platform;
    let iconName: string;

    if (platform === 'darwin') {
      // macOS uses template images for dark mode support
      iconName = 'iconTemplate.png';
    } else if (platform === 'win32') {
      iconName = 'icon.ico';
    } else {
      // Linux
      iconName = 'icon.png';
    }

    // In development, use assets folder directly from project root
    // In production, icons should be in the resources folder
    if (app.isPackaged) {
      return path.join(process.resourcesPath, 'assets', 'icons', 'tray', iconName);
    } else {
      // In development, go up from .vite/build to project root
      // __dirname in dev is something like: /path/to/project/.vite/build
      const projectRoot = path.join(__dirname, '..', '..');
      return path.join(projectRoot, 'assets', 'icons', 'tray', iconName);
    }
  }

  /**
   * Build and update the context menu
   */
  public updateContextMenu(): void {
    if (!this.tray) return;

    const isVisible = this.mainWindow?.isVisible() ?? false;
    const unreadText = this.unreadCount > 0 ? ` (${this.unreadCount})` : '';

    // Get Python process status
    const pythonStatus = this.pythonManager?.getStatus();
    const isPythonRunning = pythonStatus?.isRunning ?? false;
    const pythonExists = this.pythonManager?.executableExists() ?? false;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: isVisible ? 'Hide Window' : `Show Window${unreadText}`,
        click: () => this.toggleWindow(),
      },
      { type: 'separator' },
      // Python Backend submenu
      ...(this.pythonManager ? [{
        label: 'Python Backend',
        submenu: [
          {
            label: isPythonRunning ? '🟢 Running' : (pythonExists ? '🔴 Stopped' : '⚠️ Not Found'),
            enabled: false,
          },
          ...(pythonStatus?.pid ? [{
            label: `PID: ${pythonStatus.pid}`,
            enabled: false,
          }] : []),
          ...(isPythonRunning && pythonStatus?.startTime ? [{
            label: `Uptime: ${this.formatUptime(this.pythonManager.getUptime())}`,
            enabled: false,
          }] : []),
          { type: 'separator' as const },
          {
            label: 'Start Backend',
            enabled: !isPythonRunning && pythonExists,
            click: async () => {
              try {
                await this.pythonManager?.start();
                this.showNotification('Python Backend', 'Started successfully');
                this.updateContextMenu();
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                this.showNotification('Python Backend', `Failed to start: ${errorMsg}`);
                console.error('Failed to start Python backend:', error);
              }
            },
          },
          {
            label: 'Stop Backend',
            enabled: isPythonRunning,
            click: async () => {
              try {
                await this.pythonManager?.stop();
                this.showNotification('Python Backend', 'Stopped successfully');
                this.updateContextMenu();
              } catch (error) {
                console.error('Failed to stop Python backend:', error);
              }
            },
          },
          {
            label: 'Restart Backend',
            enabled: isPythonRunning,
            click: async () => {
              try {
                await this.pythonManager?.restart();
                this.showNotification('Python Backend', 'Restarted successfully');
                this.updateContextMenu();
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                this.showNotification('Python Backend', `Failed to restart: ${errorMsg}`);
                console.error('Failed to restart Python backend:', error);
              }
            },
          },
        ],
      }, { type: 'separator' as const }] : []),
      {
        label: 'Notifications',
        submenu: [
          {
            label: 'Enable Notifications',
            type: 'checkbox',
            checked: this.config.notificationsEnabled,
            click: (menuItem) => {
              this.config.notificationsEnabled = menuItem.checked;
              this.updateContextMenu();
            },
          },
          {
            label: 'Notification Sound',
            type: 'checkbox',
            checked: this.config.notificationSound,
            enabled: this.config.notificationsEnabled,
            click: (menuItem) => {
              this.config.notificationSound = menuItem.checked;
              this.updateContextMenu();
            },
          },
          { type: 'separator' },
          {
            label: 'Test Notification',
            enabled: this.config.notificationsEnabled,
            click: () => this.showTestNotification(),
          },
        ],
      },
      {
        label: 'Preferences',
        submenu: [
          {
            label: 'Minimize to Tray',
            type: 'checkbox',
            checked: this.config.minimizeToTray,
            click: (menuItem) => {
              this.config.minimizeToTray = menuItem.checked;
              this.updateContextMenu();
            },
          },
          {
            label: 'Start Minimized',
            type: 'checkbox',
            checked: false,
            click: (menuItem) => {
              // This would be saved to user preferences
              console.log('Start minimized:', menuItem.checked);
            },
          },
        ],
      },
      { type: 'separator' },
      {
        label: 'About',
        click: () => this.showAbout(),
      },
      { type: 'separator' },
      {
        label: 'Hide App',
        click: () => {
          // Hide window to tray, keep backend running
          this.hideWindow();
          this.showNotification(
            'Context Forge',
            'App hidden to tray. Backend still running.',
            { silent: true }
          );
        },
      },
      {
        label: 'Quit App (Keep Backend Running)',
        click: () => {
          // Quit app but keep backend running
          this.quitWithoutStoppingBackend();
        },
      },
      {
        label: 'Quit and Stop Backend',
        click: () => {
          // Force quit and stop backend
          this.quitAndStopBackend();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  /**
   * Toggle window visibility
   */
  public toggleWindow(): void {
    if (!this.mainWindow) return;

    // Always show the window when tray icon is clicked
    this.showWindow();

    // Update menu to reflect new state
    this.updateContextMenu();
  }

  /**
   * Show and focus the main window
   */
  public showWindow(): void {
    if (!this.mainWindow) return;

    this.mainWindow.show();
    this.mainWindow.focus();

    // Clear unread count when window is shown
    if (this.unreadCount > 0) {
      this.setUnreadCount(0);
    }

    // On macOS, restore from dock if hidden
    if (process.platform === 'darwin') {
      app.dock?.show();
    }
  }

  /**
   * Hide the main window
   */
  public hideWindow(): void {
    if (!this.mainWindow) return;

    this.mainWindow.hide();

    // On macOS, optionally hide from dock
    if (process.platform === 'darwin') {
      // Uncomment to hide from dock when window is hidden
      // app.dock?.hide();
    }

    this.updateContextMenu();
  }

  /**
   * Show a notification
   */
  public showNotification(title: string, body: string, options?: { silent?: boolean }): void {
    if (!this.config.notificationsEnabled) {
      console.log('Notifications are disabled');
      return;
    }

    const notification = new Notification({
      title,
      body,
      silent: options?.silent ?? !this.config.notificationSound,
      icon: this.getTrayIconPath(),
    });

    notification.on('click', () => {
      this.showWindow();
    });

    notification.show();

    // Increment unread count if window is hidden
    if (!this.mainWindow?.isVisible()) {
      this.setUnreadCount(this.unreadCount + 1);
    }
  }

  /**
   * Show a test notification
   */
  private showTestNotification(): void {
    this.showNotification(
      'Test Notification',
      'This is a test notification from Context Forge!',
    );
  }

  /**
   * Set the unread count badge
   */
  public setUnreadCount(count: number): void {
    this.unreadCount = Math.max(0, count);
    console.log('Setting unread count to:', this.unreadCount);

    // Update tray tooltip
    if (this.tray) {
      const tooltip = this.unreadCount > 0
        ? `Context Forge (${this.unreadCount} unread)`
        : 'Context Forge';
      this.tray.setToolTip(tooltip);
      console.log('Updated tray tooltip:', tooltip);
    }

    // Update menu
    this.updateContextMenu();

    // On macOS, update dock badge
    if (process.platform === 'darwin') {
      const badgeText = this.unreadCount > 0 ? String(this.unreadCount) : '';
      app.dock?.setBadge(badgeText);
      console.log('Updated macOS dock badge:', badgeText || '(cleared)');
    }

    // On Windows, flash window if hidden
    if (process.platform === 'win32' && !this.mainWindow?.isVisible() && this.unreadCount > 0) {
      this.mainWindow?.flashFrame(true);
      console.log('Flashed Windows taskbar');
    }
  }

  /**
   * Format uptime in seconds to human-readable string
   */
  private formatUptime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Show about dialog
   */
  private showAbout(): void {
    this.showNotification(
      'Context Forge',
      `Version ${app.getVersion()}\nElectron ${process.versions.electron}`,
      { silent: true }
    );
  }

  /**
   * Handle window close event
   */
  public handleWindowClose(event: Electron.Event): boolean {
    // If app is quitting, allow the window to close
    if (this.isQuitting) {
      return true;
    }

    if (this.config.minimizeToTray && this.mainWindow) {
      event.preventDefault();
      this.hideWindow();

      // Show notification on first minimize
      if (this.unreadCount === 0) {
        this.showNotification(
          'Context Forge',
          'App minimized to tray. Click the tray icon to restore.',
          { silent: true }
        );
      }

      return false; // Prevent default close
    }
    return true; // Allow close
  }

  /**
   * Quit app without stopping backend
   */
  private quitWithoutStoppingBackend(): void {
    // Set flag to allow window to close
    this.isQuitting = true;

    // Show notification
    this.showNotification(
      'Context Forge',
      'App closing. Backend will continue running in background.',
      { silent: true }
    );

    // Quit the app (backend will keep running)
    app.quit();
  }

  /**
   * Quit app and stop backend
   */
  private async quitAndStopBackend(): Promise<void> {
    // Set flag to allow window to close
    this.isQuitting = true;

    // Show notification
    this.showNotification(
      'Context Forge',
      'Stopping backend and quitting app...',
      { silent: true }
    );

    // Stop the backend if we have a python manager
    if (this.pythonManager) {
      try {
        console.log('Stopping Python backend...');
        await this.pythonManager.stop();
        console.log('Python backend stopped successfully');
      } catch (error) {
        console.error('Failed to stop Python backend:', error);
      }
    }

    // Use the callback if provided, otherwise just quit
    if (this.quitAndStopBackendCallback) {
      this.quitAndStopBackendCallback();
    } else {
      app.quit();
    }
  }

  /**
   * Set the quitting flag
   */
  public setQuitting(value: boolean): void {
    this.isQuitting = value;
  }

  /**
   * Get current configuration
   */
  public getConfig(): TrayConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<TrayConfig>): void {
    this.config = { ...this.config, ...config };
    this.updateContextMenu();
  }

  /**
   * Start periodic menu updates to keep uptime fresh
   */
  private startMenuUpdateInterval(): void {
    // Update menu every 10 seconds when backend is running
    this.menuUpdateInterval = setInterval(() => {
      if (this.pythonManager?.isProcessRunning()) {
        this.updateContextMenu();
      }
    }, 10000); // 10 seconds
  }

  /**
   * Stop periodic menu updates
   */
  private stopMenuUpdateInterval(): void {
    if (this.menuUpdateInterval) {
      clearInterval(this.menuUpdateInterval);
      this.menuUpdateInterval = null;
    }
  }

  /**
   * Destroy the tray
   */
  public destroy(): void {
    this.stopMenuUpdateInterval();
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
