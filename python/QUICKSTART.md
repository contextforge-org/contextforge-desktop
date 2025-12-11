# Quick Start Guide

## Build the Backend (One Command)

### macOS/Linux
```bash
cd python && ./build.sh
```

### Windows
```cmd
cd python
build.bat
```

## What It Does

1. ✅ Installs UV (if needed)
2. ✅ Creates virtual environment
3. ✅ Installs mcp-context-forge from GitHub (IBM/mcp-context-forge)
4. ✅ Installs contextforge-cli from GitHub (contextforge-org/contextforge-cli)
5. ✅ Builds executable with PyInstaller
6. ✅ Outputs to `dist/backend` (or `backend.exe`)

## Test It

```bash
# macOS/Linux
./dist/backend --help

# Windows
dist\backend.exe --help
```

## Use with Electron

1. Start Electron app: `npm start`
2. Click tray icon → Python Backend → Start Backend
3. Backend runs automatically!

## Troubleshooting

### SSH Access Issues
The script tries SSH first, then falls back to HTTPS automatically.

### Build Fails
- Check you have git installed: `git --version`
- Check network connection
- See full README.md for detailed troubleshooting

## Files Created

```
python/
├── .venv/          # Virtual environment (ignored by git)
├── dist/
│   └── backend     # Your executable! ⭐
├── build/          # Build artifacts (can delete)
└── *.spec          # PyInstaller spec (can delete)
```

## Rebuild

```bash
# Clean and rebuild
rm -rf build dist *.spec
./build.sh  # or build.bat on Windows
```

## More Info

See `README.md` for complete documentation.