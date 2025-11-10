import { app, Tray, Menu, BrowserWindow, nativeImage, Notification } from 'electron';
import path from 'node:path';

export interface TrayConfig {
  notificationsEnabled: boolean;
  notificationSound: boolean;
  minimizeToTray: boolean;
}

export class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;
  private config: TrayConfig = {
    notificationsEnabled: true,
    notificationSound: true,
    minimizeToTray: true,
  };
  private unreadCount = 0;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
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

    // Handle tray icon click
    this.tray.on('click', () => {
      console.log('Tray icon clicked');
      this.toggleWindow();
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
  private updateContextMenu(): void {
    if (!this.tray) return;

    const isVisible = this.mainWindow?.isVisible() ?? false;
    const unreadText = this.unreadCount > 0 ? ` (${this.unreadCount})` : '';

    const contextMenu = Menu.buildFromTemplate([
      {
        label: isVisible ? 'Hide Window' : `Show Window${unreadText}`,
        click: () => this.toggleWindow(),
      },
      { type: 'separator' },
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
        label: 'Quit',
        click: () => {
          // Force quit, bypassing minimize to tray
          this.forceQuit();
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

    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.showWindow();
    }

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
   * Force quit the application
   */
  private forceQuit(): void {
    // Disable minimize to tray temporarily
    this.config.minimizeToTray = false;
    
    // Quit the app
    app.quit();
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
   * Destroy the tray
   */
  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
