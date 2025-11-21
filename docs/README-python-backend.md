# Python Backend Integration

This document explains how the Python backend integration works in Context Forge Electron.

## Overview

The application can spawn and manage a PyInstaller-packaged Python executable from the system tray menu. This allows you to:

- Start/stop a Python backend process on demand
- Monitor the process status (running/stopped, PID, uptime)
- Automatically clean up the process when the app quits
- Control everything from the tray icon menu

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Main Process                    │
│                                                               │
│  ┌──────────────────┐         ┌─────────────────────────┐   │
│  │   TrayManager    │────────▶│ PythonProcessManager    │   │
│  │                  │         │                         │   │
│  │ - Tray Menu      │         │ - spawn()               │   │
│  │ - Start/Stop UI  │         │ - Process lifecycle     │   │
│  │ - Status Display │         │ - Signal handling       │   │
│  └──────────────────┘         └─────────────────────────┘   │
│                                          │                    │
└──────────────────────────────────────────┼────────────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │  Python Child Process   │
                              │                         │
                              │  PyInstaller Executable │
                              │  - backend.py           │
                              │  - Signal handlers      │
                              │  - JSON output          │
                              └─────────────────────────┘
```

## Components

### 1. PythonProcessManager (`src/python-process-manager.ts`)

Manages the Python process lifecycle:

- **`start(args?)`** - Spawns the Python executable
- **`stop()`** - Gracefully stops the process (SIGTERM, then SIGKILL after 5s)
- **`restart(args?)`** - Stops and restarts the process
- **`getStatus()`** - Returns current status (running, PID, uptime, path)
- **`executableExists()`** - Checks if the executable is present

**Key Features:**
- Automatic path resolution (dev vs production)
- Platform-specific executable names (`.exe` on Windows)
- Graceful shutdown with timeout
- stdout/stderr logging
- Error handling

### 2. TrayManager Integration (`src/tray-manager.ts`)

The tray menu includes a "Python Backend" submenu with:

- **Status indicator**: 🟢 Running / 🔴 Stopped / ⚠️ Not Found
- **Process info**: PID and uptime (when running)
- **Controls**: Start, Stop, Restart buttons
- **Executable path**: Shows where the executable is located

The menu updates dynamically based on the process state.

### 3. Main Process Setup (`src/main.ts`)

Initializes the Python manager and integrates it with the tray:

```typescript
// Create Python manager
pythonManager = new PythonProcessManager();

// Pass to tray manager
trayManager = new TrayManager(mainWindow, pythonManager);

// Clean up on quit
app.on('before-quit', async () => {
  await pythonManager.stop();
});
```

## File Locations

### Development
```
project-root/
└── python/
    ├── backend.py           # Source script
    └── dist/
        └── backend          # PyInstaller executable (macOS/Linux)
        └── backend.exe      # PyInstaller executable (Windows)
```

### Production (Packaged App)
```
app-package/
└── resources/
    └── python/
        └── backend          # Bundled executable (macOS/Linux)
        └── backend.exe      # Bundled executable (Windows)
```

## Usage

### For Users

1. **Start the backend**: Click tray icon → Python Backend → Start Backend
2. **Check status**: The menu shows if it's running, the PID, and uptime
3. **Stop the backend**: Click tray icon → Python Backend → Stop Backend
4. **Restart**: Click tray icon → Python Backend → Restart Backend

The backend automatically stops when you quit the app.

### For Developers

#### Building the Python Executable

```bash
cd python
pip install pyinstaller
pyinstaller --onefile --name backend backend.py
```

This creates `python/dist/backend` (or `backend.exe` on Windows).

#### Testing Locally

1. Build the executable (see above)
2. Run the Electron app: `npm start`
3. Use the tray menu to start/stop the backend
4. Check the console for Python output

#### Customizing the Backend

Edit `python/backend.py` to add your logic. Key requirements:

1. **Handle signals** for graceful shutdown:
   ```python
   signal.signal(signal.SIGTERM, self.handle_shutdown)
   signal.signal(signal.SIGINT, self.handle_shutdown)
   ```

2. **Flush output** so Electron receives it immediately:
   ```python
   print("message", flush=True)
   ```

3. **Check running flag** in your main loop:
   ```python
   while self.running:
       # Your logic here
       time.sleep(1)
   ```

#### Passing Arguments

Modify the tray menu to pass arguments:

```typescript
// In tray-manager.ts
await this.pythonManager?.start(['--port', '5000', '--debug']);
```

Handle them in Python:
```python
import sys
args = sys.argv[1:]  # ['--port', '5000', '--debug']
```

## Communication Patterns

### 1. stdout/stderr (Current Implementation)

Python prints to stdout, Electron logs it:

```python
# Python
print(json.dumps({"status": "ready"}), flush=True)
```

```typescript
// TypeScript
pythonProcess.stdout?.on('data', (data) => {
  console.log(`Python: ${data}`);
});
```

### 2. HTTP Server (Recommended for Complex Apps)

Run a Flask/FastAPI server in Python:

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/status')
def status():
    return jsonify({"status": "running"})

app.run(port=5000)
```

Call it from Electron:
```typescript
const response = await fetch('http://localhost:5000/api/status');
const data = await response.json();
```

### 3. stdin Communication

Send data to Python via stdin:

```typescript
// TypeScript
pythonProcess.stdin?.write(JSON.stringify({action: "process"}) + '\n');
```

```python
# Python
import sys
for line in sys.stdin:
    data = json.loads(line)
    # Process data
```

## Troubleshooting

### "Python executable not found"

**Cause**: The executable doesn't exist at the expected location.

**Solution**:
1. Build the executable: `cd python && pyinstaller --onefile --name backend backend.py`
2. Verify it exists: `ls python/dist/backend`
3. Check permissions: `chmod +x python/dist/backend` (macOS/Linux)

### Process won't stop

**Cause**: Python script doesn't handle signals properly.

**Solution**: Ensure your Python script has signal handlers:
```python
signal.signal(signal.SIGTERM, self.handle_shutdown)
```

The process will be force-killed after 5 seconds if it doesn't respond.

### No output in console

**Cause**: Python output is buffered.

**Solution**: Always use `flush=True`:
```python
print("message", flush=True)
```

Or disable buffering:
```python
sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 0)
```

### Process starts but immediately exits

**Cause**: Python script has an error or exits immediately.

**Solution**:
1. Test the executable directly: `./python/dist/backend`
2. Check stderr output in Electron console
3. Add error handling in Python:
   ```python
   try:
       backend.run()
   except Exception as e:
       print(f"Error: {e}", file=sys.stderr, flush=True)
   ```

## Production Deployment

### 1. Update forge.config.ts

Include the Python executable in your package:

```typescript
export default {
  packagerConfig: {
    extraResource: [
      './python/dist/backend',      // macOS/Linux
      './python/dist/backend.exe',  // Windows
    ],
  },
  // ... rest of config
};
```

### 2. Build for Each Platform

PyInstaller creates platform-specific executables. Build on each target platform:

- **macOS**: Build on macOS
- **Windows**: Build on Windows
- **Linux**: Build on Linux

### 3. Test the Packaged App

```bash
npm run make
```

Then test the generated app to ensure the Python backend works.

## Security Considerations

1. **Validate input**: If passing user input to Python, validate and sanitize it
2. **Limit permissions**: Run Python with minimal required permissions
3. **Secure communication**: Use HTTPS if communicating over network
4. **Code signing**: Sign both the Electron app and Python executable
5. **Update mechanism**: Plan for updating the Python backend separately

## Performance Tips

1. **Lazy loading**: Don't auto-start the backend; let users start it when needed
2. **Resource limits**: Monitor Python process memory/CPU usage
3. **Graceful degradation**: App should work even if Python backend fails
4. **Caching**: Cache Python results to reduce process communication
5. **Batch operations**: Send multiple requests together instead of one-by-one

## Next Steps

1. Replace `python/backend.py` with your actual implementation
2. Build the executable with PyInstaller
3. Test start/stop/restart from the tray menu
4. Add your custom logic and API endpoints
5. Package and distribute with your Electron app