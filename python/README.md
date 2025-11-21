# Python Backend for Context Forge

This directory contains the Python backend that can be controlled from the Electron tray menu.

## Quick Start

### 1. Install Dependencies

```bash
pip install pyinstaller
```

### 2. Build the Executable

```bash
cd python
pyinstaller --onefile --name backend backend.py
```

This will create:
- `dist/backend` (macOS/Linux) or `dist/backend.exe` (Windows)

### 3. Test the Executable

```bash
# macOS/Linux
./dist/backend

# Windows
dist\backend.exe
```

Press `Ctrl+C` to stop it gracefully.

### 4. Run the Electron App

The executable will be automatically detected by the Electron app. You can control it from the tray menu:

- **Start Backend** - Starts the Python process
- **Stop Backend** - Stops the Python process gracefully
- **Restart Backend** - Restarts the Python process

## File Structure

```
python/
├── backend.py          # Main Python script (stub implementation)
├── dist/               # PyInstaller output (created after build)
│   └── backend         # Executable (macOS/Linux) or backend.exe (Windows)
├── build/              # PyInstaller build files (can be deleted)
└── README.md           # This file
```

## Development

### Modifying the Backend

Edit `backend.py` to add your custom logic. The stub implementation includes:

- **Graceful shutdown handling** - Responds to SIGTERM/SIGINT signals
- **JSON output** - Prints structured JSON to stdout for easy parsing
- **Heartbeat logging** - Prints status every 10 seconds
- **Error handling** - Catches and logs exceptions

### Key Features to Maintain

1. **Signal Handlers**: Keep the `signal.signal()` calls to ensure graceful shutdown
2. **Flush Output**: Always use `flush=True` when printing to ensure Electron receives the output immediately
3. **Exit Codes**: Use proper exit codes (0 for success, 1 for errors)

### Example: Adding HTTP Server

```python
from flask import Flask, jsonify
import threading

class PythonBackend:
    def __init__(self):
        self.running = True
        self.app = Flask(__name__)
        
        @self.app.route('/api/status')
        def status():
            return jsonify({"status": "running"})
        
        signal.signal(signal.SIGTERM, self.handle_shutdown)
        signal.signal(signal.SIGINT, self.handle_shutdown)
    
    def run(self):
        # Run Flask in a separate thread
        server_thread = threading.Thread(
            target=lambda: self.app.run(port=5000, debug=False)
        )
        server_thread.daemon = True
        server_thread.start()
        
        print(json.dumps({"status": "started", "port": 5000}), flush=True)
        
        while self.running:
            time.sleep(1)
```

## Building for Production

### Cross-Platform Builds

PyInstaller creates platform-specific executables. Build on each target platform:

**macOS:**
```bash
pyinstaller --onefile --name backend backend.py
```

**Windows:**
```bash
pyinstaller --onefile --name backend backend.py
```

**Linux:**
```bash
pyinstaller --onefile --name backend backend.py
```

### Including in Electron Package

The Electron app expects the executable at:
- **Development**: `python/dist/backend` (or `backend.exe`)
- **Production**: `resources/python/backend` (or `backend.exe`)

Update `forge.config.ts` to include the executable:

```typescript
extraResource: [
  './python/dist/backend',      // macOS/Linux
  './python/dist/backend.exe',  // Windows
]
```

## Troubleshooting

### Executable Not Found

If you see "Python executable not found" in the tray menu:

1. Verify the executable exists: `ls python/dist/backend`
2. Check file permissions: `chmod +x python/dist/backend` (macOS/Linux)
3. Rebuild: `pyinstaller --onefile --name backend backend.py`

### Process Won't Stop

If the process doesn't stop gracefully:

1. Check that signal handlers are registered
2. Ensure the main loop checks `self.running`
3. The process will be force-killed after 5 seconds

### No Output in Console

If you don't see Python output in the Electron console:

1. Add `flush=True` to all `print()` statements
2. Use `sys.stdout.flush()` after writing
3. Check that stdout is not buffered

## Advanced Configuration

### Custom Arguments

Pass arguments to the Python process:

```typescript
// In tray-manager.ts
await this.pythonManager?.start(['--port', '5000', '--debug']);
```

```python
# In backend.py
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=5000)
parser.add_argument('--debug', action='store_true')
args = parser.parse_args()
```

### Environment Variables

Set environment variables for the Python process:

```typescript
// In python-process-manager.ts
this.process = spawn(execPath, args, {
  env: {
    ...process.env,
    PYTHON_ENV: 'production',
    API_KEY: 'your-api-key',
  }
});
```

## Next Steps

1. Replace the stub implementation with your actual backend logic
2. Build the executable with PyInstaller
3. Test start/stop/restart from the tray menu
4. Package with your Electron app for distribution