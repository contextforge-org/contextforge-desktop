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
      execName = 'backend.exe';
    } else if (platform === 'darwin') {
      execName = 'backend';  // macOS
    } else {
      execName = 'backend';  // Linux
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
        console.log('Python process already running');
        resolve();
        return;
      }

      const execPath = this.getExecutablePath();
      this.executablePath = execPath;

      // Verify executable exists
      if (!fs.existsSync(execPath)) {
        const error = new Error(
          `Python executable not found at: ${execPath}\n` +
          `Please build the Python executable using PyInstaller and place it in the correct location.`
        );
        console.error(error.message);
        reject(error);
        return;
      }

      console.log(`Starting Python process: ${execPath}`);

      // Spawn the PyInstaller executable directly
      this.process = spawn(execPath, args, {
        detached: false,
        stdio: ['pipe', 'pipe', 'pipe'],
        // Set working directory to executable's directory
        cwd: path.dirname(execPath),
      });

      // Handle stdout
      this.process.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`[Python] ${output}`);
      });

      // Handle stderr
      this.process.stderr?.on('data', (data) => {
        const output = data.toString().trim();
        console.error(`[Python Error] ${output}`);
      });

      // Handle successful spawn
      this.process.on('spawn', () => {
        this.isRunning = true;
        this.startTime = new Date();
        console.log(`✅ Python process started (PID: ${this.process?.pid})`);
        resolve();
      });

      // Handle spawn errors
      this.process.on('error', (error) => {
        this.isRunning = false;
        this.startTime = null;
        console.error('Failed to start Python process:', error);
        reject(error);
      });

      // Handle process exit
      this.process.on('close', (code, signal) => {
        this.isRunning = false;
        this.startTime = null;
        if (code !== null) {
          console.log(`Python process exited with code ${code}`);
        } else if (signal) {
          console.log(`Python process killed with signal ${signal}`);
        }
      });
    });
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
