# Python Backend for Context Forge

This directory contains the Python backend that can be controlled from the Electron tray menu. The backend uses the **contextforge-cli** package from GitHub, built into a standalone executable using PyInstaller.

## ⚠️ Important: Authentication Requirements

The Electron application requires the backend to support email/password authentication with specific behavior:

### Required Backend Configuration

1. **Default Admin User**: The backend MUST automatically create a default admin user on first startup:
   - Email: `admin@example.com`
   - Password: `changeme`
   - `password_change_required` flag: `true`

2. **Login Endpoint**: When `password_change_required` is true, the backend MUST:
   - Return HTTP 403 status
   - Include an `access_token` in the response (critical for password change flow)
   - Include message: "Password change required"

3. **Password Change Endpoint**: Must clear the `password_change_required` flag after successful password change

**📖 See detailed requirements**: `docs/backend-authentication-requirements.md`

If the backend doesn't implement these requirements, the Electron app will fail to authenticate on first startup.

## Quick Start

### Prerequisites

- **Git**: Required to clone the contextforge-cli repository
- **UV**: Modern Python package manager (will be auto-installed by build script)
- **SSH or HTTPS access** to GitHub (for cloning the repository)

### Build the Executable

#### macOS/Linux

```bash
cd python
chmod +x build.sh
./build.sh
```

#### Windows

```cmd
cd python
build.bat
```

The build script will:
1. ✅ Install UV if not present
2. ✅ Create a virtual environment (`.venv/`)
3. ✅ Install `contextforge-cli` from GitHub
4. ✅ Install PyInstaller
5. ✅ Build the executable with proper configuration
6. ✅ Output to `dist/backend` (or `dist/backend.exe` on Windows)

### Test the Executable

```bash
# macOS/Linux
./dist/backend --help

# Windows
dist\backend.exe --help
```

### Run with Electron

The executable will be automatically detected by the Electron app. Control it from the tray menu:

- **Start Backend** - Starts the Python process
- **Stop Backend** - Stops the Python process gracefully
- **Restart Backend** - Restarts the Python process

## File Structure

```
python/
├── build.sh            # Build script for macOS/Linux
├── build.bat           # Build script for Windows
├── .venv/              # UV virtual environment (created by build script)
├── dist/               # PyInstaller output (created after build)
│   └── backend         # Executable (macOS/Linux) or backend.exe (Windows)
├── build/              # PyInstaller build files (can be deleted)
├── .gitignore          # Excludes build artifacts and virtual environment
└── README.md           # This file
```

## Build Process Details

### What the Build Script Does

1. **UV Installation Check**
   - Checks if UV is installed
   - Auto-installs UV if missing (via curl on Unix, PowerShell on Windows)

2. **Virtual Environment Setup**
   - Creates `.venv/` directory using UV
   - Activates the environment for isolated package installation

3. **Package Installation**
   - Installs `mcp-context-forge` from GitHub (IBM repository)
   - Installs `contextforge-cli` from GitHub (contextforge-org repository)
   - Tries SSH first for both packages, falls back to HTTPS if SSH fails
   - SSH URLs:
     - `git+ssh://git@github.com/IBM/mcp-context-forge.git`
     - `git+ssh://git@github.com/contextforge-org/contextforge-cli.git`
   - HTTPS URLs:
     - `git+https://github.com/IBM/mcp-context-forge.git`
     - `git+https://github.com/contextforge-org/contextforge-cli.git`

4. **PyInstaller Build**
   - Uses `cforge.spec` configuration file
   - Includes all necessary packages and data files:
     - All submodules from cforge, mcpgateway, and mcp packages
     - **Plugins directory** from mcpgateway package (automatically discovered)
     - MCP catalog configuration file
     - Package metadata
   - Configuration:
     - `-F`: Single file executable
     - `--console`: Console mode for debugging
     - `--name cforge`: Names the output executable "cforge"
   - **Plugin Packaging**: The spec file automatically locates and includes the `plugins/` directory from the installed `mcpgateway` package, ensuring all backend plugins are bundled with the executable

5. **Output Verification**
   - Tests the executable to ensure it works
   - Reports the location of the built executable

### PyInstaller Configuration

The build uses these PyInstaller flags:

- **`-F` (onefile)**: Creates a single executable file
- **`--console`**: Shows console window for debugging output
- **`--collect-all cforge`**: Collects all submodules from the cforge package
- **`--collect-all mcpgateway.main`**: Collects all submodules from mcpgateway.main
- **`--name backend`**: Names the output executable "backend" (or "backend.exe")

## Development

### Manual Build Steps

If you prefer to build manually:

```bash
# 1. Install UV (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Create virtual environment
uv venv .venv

# 3. Activate environment
source .venv/bin/activate  # macOS/Linux
# or
.venv\Scripts\activate.bat  # Windows

# 4. Install mcp-context-forge (required dependency)
uv pip install git+ssh://git@github.com/IBM/mcp-context-forge.git
# or
uv pip install git+https://github.com/IBM/mcp-context-forge.git

# 5. Install contextforge-cli
uv pip install git+ssh://git@github.com/contextforge-org/contextforge-cli.git
# or
uv pip install git+https://github.com/contextforge-org/contextforge-cli.git

# 6. Install PyInstaller
uv pip install pyinstaller

# 7. Find cforge.py location
python -c "import cforge; import os; print(os.path.join(os.path.dirname(cforge.__file__), 'cforge.py'))"

# 8. Build with PyInstaller
pyinstaller cforge_wrapper.py -F --console --collect-all cforge --collect-all mcpgateway --collect-all mcp --name backend
```

### Rebuilding

To rebuild after changes:

```bash
# Clean previous build
rm -rf build dist *.spec

# Run build script again
./build.sh  # macOS/Linux
# or
build.bat   # Windows
```

### Updating contextforge-cli

To update to the latest version:

```bash
# Activate environment
source .venv/bin/activate  # macOS/Linux
# or
.venv\Scripts\activate.bat  # Windows

# Update packages
uv pip install --upgrade git+ssh://git@github.com/IBM/mcp-context-forge.git
uv pip install --upgrade git+ssh://git@github.com/contextforge-org/contextforge-cli.git

# Rebuild
./build.sh  # macOS/Linux
# or
build.bat   # Windows
```

## Troubleshooting

### "UV not found" or Installation Fails

**macOS/Linux:**
```bash
# Manual UV installation
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH
export PATH="$HOME/.cargo/bin:$PATH"
```

**Windows:**
```powershell
# Manual UV installation
irm https://astral.sh/uv/install.ps1 | iex
```

### Git SSH Access Issues

If SSH fails, the script automatically falls back to HTTPS. To use SSH:

1. **Set up SSH keys**: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
2. **Test SSH access**: `ssh -T git@github.com`

To force HTTPS instead, modify the build script to use only the HTTPS URL.

### "Could not find cforge.py"

This means the packages weren't installed correctly:

1. Check that both packages installed: `uv pip list | grep -E "(mcp-context-forge|contextforge)"`
2. Try reinstalling both:
   ```bash
   uv pip install --force-reinstall git+https://github.com/IBM/mcp-context-forge.git
   uv pip install --force-reinstall git+https://github.com/contextforge-org/contextforge-cli.git
   ```
3. Verify the package structure: `python -c "import cforge; print(cforge.__file__)"`

### Build Succeeds but Executable Doesn't Work

1. **Test directly**: `./dist/backend --help`
2. **Check for missing dependencies**: The `--collect-all` flags should include everything, but some packages may need additional configuration
3. **Run in console mode**: The `--console` flag shows output for debugging
4. **Check PyInstaller warnings**: Review the build output for warnings about missing modules

### Executable Not Found by Electron

The Electron app expects the executable at:
- **Development**: `python/dist/backend` (or `backend.exe`)
- **Production**: `resources/python/backend` (or `backend.exe`)

Verify the file exists and has execute permissions:

```bash
# macOS/Linux
ls -la python/dist/backend
chmod +x python/dist/backend

# Windows
dir python\dist\backend.exe
```

### Virtual Environment Issues

If you encounter virtual environment issues:

```bash
# Remove and recreate
rm -rf .venv
./build.sh  # Will create fresh environment
```

## Cross-Platform Builds

PyInstaller creates platform-specific executables. Build on each target platform:

- **macOS**: Build on macOS → `dist/backend`
- **Windows**: Build on Windows → `dist/backend.exe`
- **Linux**: Build on Linux → `dist/backend`

You cannot cross-compile (e.g., build Windows executable on macOS).

## Production Deployment

### Including in Electron Package

Update `forge.config.ts` to include the executable:

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

### Build Process for Distribution

1. **Build on each platform**:
   ```bash
   # On macOS
   cd python && ./build.sh
   
   # On Windows
   cd python && build.bat
   
   # On Linux
   cd python && ./build.sh
   ```

2. **Package Electron app**:
   ```bash
   npm run make
   ```

3. **Test packaged app** to ensure the backend works in production

## Advanced Configuration

### Custom PyInstaller Options

Edit the build script to add custom PyInstaller options:

```bash
pyinstaller "$CFORGE_PATH" \
    -F \
    --console \
    --collect-all cforge \
    --collect-all mcpgateway.main \
    --name backend \
    --add-data "config:config" \        # Add custom data files
    --hidden-import some_module \       # Add hidden imports
    --exclude-module unnecessary_module # Exclude modules
```

### Environment Variables

Set environment variables for the build:

```bash
# In build.sh
export SOME_VAR="value"
pyinstaller ...
```

### Debugging Build Issues

Enable verbose PyInstaller output:

```bash
pyinstaller "$CFORGE_PATH" \
    --log-level DEBUG \
    -F --console \
    --collect-all cforge \
    --collect-all mcpgateway.main \
    --name backend
```

## Resources

- **UV Documentation**: https://github.com/astral-sh/uv
- **PyInstaller Documentation**: https://pyinstaller.org/
- **contextforge-cli Repository**: https://github.com/contextforge-org/contextforge-cli
- **Electron Integration**: See `docs/README-python-backend.md`

## Next Steps

1. Run the build script: `./build.sh` (macOS/Linux) or `build.bat` (Windows)
2. Test the executable: `./dist/backend --help`
3. Start the Electron app: `npm start`
4. Use the tray menu to control the backend
5. Package for distribution: `npm run make`