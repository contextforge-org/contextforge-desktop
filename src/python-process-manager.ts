import { spawn, ChildProcess } from 'child_process';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export interface PythonProcessStatus {
  isRunning: boolean;
  pid?: number;
  startTime?: Date;
  executablePath?: string;
}

export class PythonProcessManager {
  private static instance: PythonProcessManager | null = null;
  private process: ChildProcess | null = null;
  private isRunning = false;
  private startTime: Date | null = null;
  private executablePath: string | null = null;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance of PythonProcessManager
   */
  public static getInstance(): PythonProcessManager {
    if (!PythonProcessManager.instance) {
      PythonProcessManager.instance = new PythonProcessManager();
    }
    return PythonProcessManager.instance;
  }

  /**
   * Get path to PyInstaller executable
   * Looks for executable in resources folder (production) or python/dist (development)
   */
  private getExecutablePath(): string {
    const platform = process.platform;
    let execName: string;

    // PyInstaller creates platform-specific executables
    if (platform === 'win32') {
      execName = 'cforge.exe';
    } else if (platform === 'darwin') {
      execName = 'cforge';  // macOS
    } else {
      execName = 'cforge';  // Linux
    }

    if (app.isPackaged) {
      // Production: executable in resources folder
      return path.join(process.resourcesPath, execName);
    } else {
      // Development: executable in project directory
      return path.join(__dirname, '..', '..', 'python', 'dist', execName);
    }
  }

  /**
   * Check if the Python executable exists
   */
  public executableExists(): boolean {
    const execPath = this.getExecutablePath();
    return fs.existsSync(execPath);
  }

  /**
   * Start the Python process
   */
  public async start(args: string[] = ['serve']): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.isRunning) {
        this.log('info', 'Python process already running');
        resolve();
        return;
      }

      // Set flag immediately to prevent race conditions
      this.isRunning = true;

      try {
        this.verifyExecutableExists();
        const execPath = this.getExecutablePath();
        this.executablePath = execPath;

        this.log('info', `Starting Python process: ${execPath} ${args.join(' ')}`);

        const spawnOptions = await this.getSpawnOptions(execPath);
        this.process = spawn(execPath, args, spawnOptions);
        this.setupProcessOutputHandlers();
        this.setupProcessLifecycleHandlers(resolve, reject);
      } catch (error) {
        // Reset flag on error
        this.isRunning = false;
        this.log('error', 'Failed to start Python process:', error);
        reject(error as Error);
      }
    });
  }

  /**
   * Verify that the Python executable exists
   */
  private verifyExecutableExists(): void {
    if (!this.executableExists()) {
      throw new Error(
        `Python executable not found at: ${this.getExecutablePath()}\n` +
        `Please build the Python executable using PyInstaller and place it in the correct location.`
      );
    }
  }

  /**
   * Get spawn options for the Python process
   */
  private async getSpawnOptions(execPath: string) {
    // Get plugin preferences
    const { backendPreferences } = await import('./services/BackendPreferences');
    const enablePlugins = backendPreferences.getEnablePlugins();
    const pluginConfigs = backendPreferences.getAllPluginConfigs();

    // Write plugin configuration file if plugins are enabled
    const contextforgeHome = path.join(app.getPath('userData'), '.contextforge');
    const pluginConfigPath = path.join(contextforgeHome, 'plugins', 'config.yaml');
    
    if (enablePlugins && Object.keys(pluginConfigs).length > 0) {
      await this.writePluginConfigFile(pluginConfigPath, pluginConfigs);
      console.log('[PythonProcessManager] Plugin configuration written to:', pluginConfigPath);
    }

    // Set up environment variables for the internal backend
    const env: Record<string, string> = {
      ...process.env,
      // Backend configuration
      MCG_HOST: '127.0.0.1',
      MCG_PORT: '4444',
      HOST: '127.0.0.1',
      PORT: '4444',
      // Email authentication - enable for internal backend
      EMAIL_AUTH_ENABLED: 'true',
      CREATE_DEFAULT_ADMIN: 'true',
      DEFAULT_ADMIN_EMAIL: 'admin@example.com',
      DEFAULT_ADMIN_PASSWORD: 'changeme',
      // Enable authentication (required for email auth to work)
      AUTH_REQUIRED: 'true',
      BASIC_AUTH_USER: 'admin@example.com',
      BASIC_AUTH_PASSWORD: 'changeme',
      // Database
      CONTEXTFORGE_HOME: contextforgeHome,
      // Logging
      LOG_LEVEL: 'INFO',
      // UI - disable for internal backend
      MCPGATEWAY_UI_ENABLED: 'false',
      MCPGATEWAY_ADMIN_API_ENABLED: 'true',
      // Development mode for easier setup
      DEV_MODE: 'true',
      // Plugin configuration from preferences
      PLUGINS_ENABLED: enablePlugins ? 'true' : 'false',
      // Enable observability and tracing
      ENABLE_OBSERVABILITY: 'true',
      ENABLE_TRACING: 'true',
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
      // Enable LLM Chat Playground
      LLMCHAT_ENABLED: 'true',
    };

    // Point to custom plugin config file if plugins are enabled
    if (enablePlugins && Object.keys(pluginConfigs).length > 0) {
      env['PLUGIN_CONFIG_FILE'] = pluginConfigPath;
    }

    return {
      detached: false,
      stdio: ['pipe', 'pipe', 'pipe'] as ['pipe', 'pipe', 'pipe'],
      cwd: path.dirname(execPath),
      env,
    };
  }

  /**
   * Write plugin configuration to YAML file
   * Reads the base config, updates plugin modes based on user preferences, and writes to user config
   */
  private async writePluginConfigFile(
    userConfigPath: string,
    pluginConfigs: Record<string, import('./types/backend-settings').PluginConfig>
  ): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(userConfigPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Get the base config file path (shipped with the app)
    const baseConfigPath = app.isPackaged
      ? path.join(process.resourcesPath, 'plugins', 'config.yaml')
      : path.join(__dirname, '..', '..', 'python', 'plugins', 'config.yaml');

    // Copy base config to user config if it doesn't exist
    if (!fs.existsSync(userConfigPath) && fs.existsSync(baseConfigPath)) {
      fs.copyFileSync(baseConfigPath, userConfigPath);
      console.log('[PythonProcessManager] Copied base plugin config to user directory');
    }

    // Read the current config file
    let configContent = '';
    if (fs.existsSync(userConfigPath)) {
      configContent = fs.readFileSync(userConfigPath, 'utf8');
    } else if (fs.existsSync(baseConfigPath)) {
      configContent = fs.readFileSync(baseConfigPath, 'utf8');
    } else {
      console.warn('[PythonProcessManager] No plugin config file found, creating minimal config');
      configContent = 'plugins:\n';
    }

    // Update plugin modes based on user preferences
    // This is a simple regex-based approach - for production, consider using a YAML library
    for (const [pluginName, config] of Object.entries(pluginConfigs)) {
      const mode = config.enabled ? (config.mode || 'permissive') : 'disabled';
      
      // Find the plugin entry and update its mode
      const pluginRegex = new RegExp(
        `(- name: ["']?${pluginName}["']?\\s+[\\s\\S]*?mode: )["']?\\w+["']?`,
        'g'
      );
      
      if (pluginRegex.test(configContent)) {
        configContent = configContent.replace(pluginRegex, `$1"${mode}"`);
        console.log(`[PythonProcessManager] Updated ${pluginName} mode to: ${mode}`);
      } else {
        console.warn(`[PythonProcessManager] Plugin ${pluginName} not found in config file`);
      }
    }

    // Write updated config
    fs.writeFileSync(userConfigPath, configContent, 'utf8');
    console.log('[PythonProcessManager] Plugin configuration updated');
  }

  /**
   * Setup handlers for process output (stdout/stderr)
   */
  private setupProcessOutputHandlers(): void {
    this.process!.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      this.log('info', `[Python] ${output}`);
    });

    this.process!.stderr?.on('data', (data) => {
      const output = data.toString().trim();
      this.log('error', `[Python Error] ${output}`);
    });
  }

  /**
   * Setup handlers for process lifecycle events (spawn, error, close)
   */
  private setupProcessLifecycleHandlers(
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    let settled = false;

    this.process!.on('spawn', () => {
      if (!settled) {
        // Update start time (isRunning already set to true)
        this.startTime = new Date();
        this.log('info', `✅ Python process started (PID: ${this.process?.pid})`);
        settled = true;
        resolve();
      }
    });

    this.process!.on('error', (error) => {
      if (!settled) {
        this.setProcessStopped();
        this.log('error', 'Failed to start Python process:', error);
        settled = true;
        reject(error);
      }
    });

    this.process!.on('close', (code, signal) => {
      this.setProcessStopped();
      if (code !== null) {
        this.log('info', `Python process exited with code ${code}`);
      } else if (signal) {
        this.log('info', `Python process killed with signal ${signal}`);
      }
    });
  }

  /**
   * Set process state to running
   */
  private setProcessRunning(): void {
    this.isRunning = true;
    this.startTime = new Date();
  }

  /**
   * Set process state to stopped
   */
  private setProcessStopped(): void {
    this.isRunning = false;
    this.startTime = null;
  }

  /**
   * Centralized logging method
   */
  private log(level: 'info' | 'error', message: string, data?: any): void {
    const prefix = '[PythonProcessManager]';
    if (level === 'error') {
      console.error(prefix, message, data || '');
    } else {
      console.log(prefix, message, data || '');
    }
  }

  /**
   * Stop the Python process gracefully
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.process || !this.isRunning) {
        console.log('Python process not running');
        resolve();
        return;
      }

      console.log('Stopping Python process...');

      // Listen for process exit
      this.process.once('close', () => {
        this.isRunning = false;
        this.startTime = null;
        console.log('🛑 Python process stopped');
        resolve();
      });

      // Send SIGTERM for graceful shutdown
      this.process.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (this.process && this.isRunning) {
          console.warn('Force killing Python process (timeout)');
          this.process.kill('SIGKILL');
        }
      }, 5000);
    });
  }

  /**
   * Restart the Python process
   */
  public async restart(args: string[] = ['serve']): Promise<void> {
    console.log('Restarting Python process...');
    await this.stop();
    // Wait a bit before restarting
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.start(args);
  }

  /**
   * Get the current status of the Python process
   */
  public getStatus(): PythonProcessStatus {
    return {
      isRunning: this.isRunning,
      pid: this.process?.pid,
      startTime: this.startTime || undefined,
      executablePath: this.executablePath || undefined,
    };
  }

  /**
   * Check if process is running
   */
  public isProcessRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get uptime in seconds
   */
  public getUptime(): number {
    if (!this.isRunning || !this.startTime) {
      return 0;
    }
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }
}
