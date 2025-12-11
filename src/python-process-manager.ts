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
  private process: ChildProcess | null = null;
  private isRunning = false;
  private startTime: Date | null = null;
  private executablePath: string | null = null;

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
      return path.join(process.resourcesPath, 'python', execName);
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
  public async start(args: string[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        this.log('info', 'Python process already running');
        resolve();
        return;
      }

      try {
        this.verifyExecutableExists();
        const execPath = this.getExecutablePath();
        this.executablePath = execPath;

        this.log('info', `Starting Python process: ${execPath}`);

        this.process = spawn(execPath, args, this.getSpawnOptions(execPath));
        this.setupProcessOutputHandlers();
        this.setupProcessLifecycleHandlers(resolve, reject);
      } catch (error) {
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
  private getSpawnOptions(execPath: string) {
    // Set up environment variables for the internal backend
    const env = {
      ...process.env,
      // Backend configuration
      MCG_HOST: '127.0.0.1',
      MCG_PORT: '4444',
      HOST: '127.0.0.1',
      PORT: '4444',
      // Authentication - enable for internal backend
      AUTH_REQUIRED: 'false',
      BASIC_AUTH_USER: 'admin@example.com',
      BASIC_AUTH_PASSWORD: 'changeme',
      // Database
      CONTEXTFORGE_HOME: path.join(app.getPath('userData'), '.contextforge'),
      // Logging
      LOG_LEVEL: 'INFO',
      // UI - disable for internal backend
      MCPGATEWAY_UI_ENABLED: 'false',
      MCPGATEWAY_ADMIN_API_ENABLED: 'true',
      // Development mode for easier setup
      DEV_MODE: 'true',
    };

    return {
      detached: false,
      stdio: ['pipe', 'pipe', 'pipe'] as ['pipe', 'pipe', 'pipe'],
      cwd: path.dirname(execPath),
      env,
    };
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
        this.setProcessRunning();
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
  public async restart(args: string[] = []): Promise<void> {
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
