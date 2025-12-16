@echo off
REM Build script for Context Forge Python Backend (Windows)
REM Uses UV to create an isolated environment and PyInstaller to build the executable

setlocal enabledelayedexpansion

REM Configuration
set VENV_DIR=.venv
set GATEWAY_REPO_SSH=git+ssh://git@github.com/IBM/mcp-context-forge.git@main
set GATEWAY_REPO_HTTPS=git+https://github.com/IBM/mcp-context-forge.git@main
set CLI_REPO_SSH=git+ssh://git@github.com/contextforge-org/contextforge-cli.git@main
set CLI_REPO_HTTPS=git+https://github.com/contextforge-org/contextforge-cli.git@main
set OUTPUT_NAME=backend
if not defined DEFAULT_HOME_DIR (
    set "DEFAULT_HOME_DIR="
)

echo ========================================
echo Context Forge Backend Build Script
echo ========================================
echo.

REM Check if UV is installed
echo [*] Checking for UV installation...
where uv >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] UV not found. Installing UV...
    powershell -Command "irm https://astral.sh/uv/install.ps1 | iex"

    REM Refresh PATH
    call refreshenv >nul 2>nul

    where uv >nul 2>nul
    if !ERRORLEVEL! NEQ 0 (
        echo [X] Failed to install UV. Please install manually: https://github.com/astral-sh/uv
        exit /b 1
    )
    echo [+] UV installed successfully
) else (
    echo [+] UV is already installed
)

REM Create or use existing virtual environment
echo [*] Setting up Python environment...
if not exist "%VENV_DIR%" (
    echo [*] Creating new UV virtual environment...
    uv venv "%VENV_DIR%"
    if %ERRORLEVEL% NEQ 0 (
        echo [X] Failed to create virtual environment
        exit /b 1
    )
    echo [+] Virtual environment created
) else (
    echo [+] Using existing virtual environment
)

REM Activate virtual environment
echo [*] Activating virtual environment...
call "%VENV_DIR%\Scripts\activate.bat"
if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to activate virtual environment
    exit /b 1
)
echo [+] Virtual environment activated

REM Install mcp-context-forge (provides cforge module via contextforge-cli) with llmchat extras
echo [*] Installing mcp-context-forge from GitHub main branch (IBM/mcp-context-forge) with [llmchat] extras...
echo.

REM Try SSH first, fallback to HTTPS - force reinstall to get latest
uv pip install --force-reinstall --no-deps "%GATEWAY_REPO_SSH%[llmchat]" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [+] Installed mcp-context-forge via SSH with [llmchat] extras from main branch
) else (
    echo [!] SSH installation failed, trying HTTPS...
    uv pip install --force-reinstall --no-deps "%GATEWAY_REPO_HTTPS%[llmchat]"
    if !ERRORLEVEL! NEQ 0 (
        echo [X] Failed to install mcp-context-forge from GitHub
        echo [X] Please check your git credentials and network connection
        exit /b 1
    )
    echo [+] Installed mcp-context-forge via HTTPS with [llmchat] extras from main branch
)

REM Reinstall dependencies that were skipped by --no-deps
echo [*] Installing dependencies for mcp-context-forge...
uv pip install "%GATEWAY_REPO_SSH%[llmchat]" >nul 2>nul
if !ERRORLEVEL! NEQ 0 (
    uv pip install "%GATEWAY_REPO_HTTPS%[llmchat]"
)

REM Install contextforge-cli (provides cforge module)
echo [*] Installing contextforge-cli from GitHub main branch (contextforge-org/contextforge-cli)...
echo.

REM Try SSH first, fallback to HTTPS - force reinstall to get latest
uv pip install --force-reinstall --no-deps "%CLI_REPO_SSH%" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [+] Installed contextforge-cli via SSH from main branch
) else (
    echo [!] SSH installation failed, trying HTTPS...
    uv pip install --force-reinstall --no-deps "%CLI_REPO_HTTPS%"
    if !ERRORLEVEL! NEQ 0 (
        echo [X] Failed to install contextforge-cli from GitHub
        echo [X] Please check your git credentials and network connection
        exit /b 1
    )
    echo [+] Installed contextforge-cli via HTTPS from main branch
)

REM Reinstall dependencies that were skipped by --no-deps
echo [*] Installing dependencies for contextforge-cli...
uv pip install "%CLI_REPO_SSH%" >nul 2>nul
if !ERRORLEVEL! NEQ 0 (
    uv pip install "%CLI_REPO_HTTPS%"
)

REM Install PyInstaller
echo [*] Installing PyInstaller...
uv pip install pyinstaller
if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to install PyInstaller
    exit /b 1
)
echo [+] PyInstaller installed

REM Remove GPL-licensed jinja2-ansible-filters package
echo [*] Removing GPL-licensed jinja2-ansible-filters package (if present)...
uv pip show jinja2-ansible-filters >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    uv pip uninstall -y jinja2-ansible-filters
    echo [+] jinja2-ansible-filters removed
) else (
    echo [+] jinja2-ansible-filters not installed (already clean)
)

REM Download plugins directory from the backend repository using sparse checkout
echo [*] Downloading plugins directory from backend repository...
set TEMP_REPO_DIR=temp_mcp_repo
if exist %TEMP_REPO_DIR% rmdir /s /q %TEMP_REPO_DIR%
if exist plugins rmdir /s /q plugins

git clone --depth 1 --filter=blob:none --sparse https://github.com/IBM/mcp-context-forge.git %TEMP_REPO_DIR% >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    cd %TEMP_REPO_DIR%
    git sparse-checkout set plugins >nul 2>nul
    cd ..
    
    if exist "%TEMP_REPO_DIR%\plugins" (
        xcopy /E /I /Q "%TEMP_REPO_DIR%\plugins" plugins >nul
        rmdir /s /q %TEMP_REPO_DIR%
        echo [+] Downloaded plugins directory with all plugin implementations
    ) else (
        rmdir /s /q %TEMP_REPO_DIR%
        echo [X] Failed to download plugins directory
        exit /b 1
    )
) else (
    echo [!] Git sparse checkout failed, trying alternative method...
    REM Fallback: just download config.yaml
    if not exist plugins mkdir plugins
    set PLUGINS_CONFIG_URL=https://raw.githubusercontent.com/IBM/mcp-context-forge/main/plugins/config.yaml
    powershell -Command "try { Invoke-WebRequest -Uri '%PLUGINS_CONFIG_URL%' -OutFile 'plugins\config.yaml' -UseBasicParsing; exit 0 } catch { exit 1 }"
    if !ERRORLEVEL! EQU 0 (
        echo [!] Downloaded only plugins/config.yaml - plugin implementations may not work
    ) else (
        echo [X] Could not download plugins directory or config
        exit /b 1
    )
)

REM Find cforge.py location
echo [*] Locating cforge.py entry point...
for /f "delims=" %%i in ('python -c "import cforge; import os; print(os.path.join(os.path.dirname(cforge.__file__), 'cforge.py'))" 2^>nul') do set CFORGE_PATH=%%i

if not defined CFORGE_PATH (
    REM Try alternative location
    for /f "delims=" %%i in ('dir /s /b "%VENV_DIR%\cforge.py" 2^>nul ^| findstr /v "__pycache__"') do set CFORGE_PATH=%%i
)

if not defined CFORGE_PATH (
    echo [X] Could not find cforge.py entry point
    echo [X] The contextforge-cli package may not be installed correctly
    exit /b 1
)

REM Create wrapper script for 'cforge serve'
set CFORGE_PATH=cforge_wrapper.py
(
    echo #!/usr/bin/env python3
    echo """
    echo Wrapper script for cforge to default home to app data and set plugin config path
    echo """
    echo import os
    echo import sys
    echo.
    echo HOME_ENV = "CONTEXTFORGE_HOME"
    echo PLUGIN_CONFIG_ENV = "PLUGIN_CONFIG_FILE"
    echo.
    echo if __name__ == '__main__':
    echo     # Set the default env var for the home directory
    echo     if home_dir := os.getenv^(HOME_ENV, "%DEFAULT_HOME_DIR%"^):
    echo         os.environ[HOME_ENV] = home_dir
    echo.
    echo     # Set plugin config file path for PyInstaller bundle
    echo     # PyInstaller extracts to sys._MEIPASS in onefile mode
    echo     if not os.getenv^(PLUGIN_CONFIG_ENV^):
    echo         if getattr^(sys, 'frozen', False^):
    echo             # Running in PyInstaller bundle
    echo             bundle_dir = getattr^(sys, '_MEIPASS', os.path.dirname^(os.path.abspath^(sys.executable^)^)^)
    echo             # Try plugins/config.yaml first ^(downloaded from repo^)
    echo             plugin_config = os.path.join^(bundle_dir, 'plugins', 'config.yaml'^)
    echo             if os.path.exists^(plugin_config^):
    echo                 os.environ[PLUGIN_CONFIG_ENV] = plugin_config
    echo                 print^(f"Set PLUGIN_CONFIG_FILE to: {plugin_config}", file=sys.stderr^)
    echo             else:
    echo                 print^(f"Warning: Plugin config not found at {plugin_config}", file=sys.stderr^)
    echo.
    echo     # Enable plugins by default
    echo     if not os.getenv^('PLUGINS_ENABLED'^):
    echo         os.environ['PLUGINS_ENABLED'] = 'true'
    echo.
    echo     # Import the main entrypoint and run it
    echo     from cforge.main import main
    echo     sys.exit^(main^(^)^)
) > !CFORGE_PATH!

echo [+] Created wrapper script at: !CFORGE_PATH!

REM Use the downloaded plugins directory
echo [*] Preparing plugins directory for bundling...
set "PLUGINS_DATA_ARG="
if exist "plugins" (
    echo [+] Using downloaded plugins directory
    set "PLUGINS_DATA_ARG=--add-data plugins;plugins"
) else (
    echo [!] plugins directory not found, plugins may not work
)

REM Clean previous build artifacts
echo [*] Cleaning previous build artifacts...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist *.spec del /q *.spec
echo [+] Build directory cleaned

REM Run PyInstaller with --collect-all for mcpgateway.plugins
echo [*] Running PyInstaller...
echo.
echo PyInstaller command:
echo pyinstaller "%CFORGE_PATH%" -F --console --collect-all cforge --collect-all mcpgateway --collect-all mcpgateway.plugins --collect-all mcp --collect-all cryptography !PLUGINS_CONFIG_ARG! --name %OUTPUT_NAME%
echo.

pyinstaller "%CFORGE_PATH%" -F --console --collect-all cforge --collect-all mcpgateway --collect-all mcpgateway.plugins --collect-all mcp --collect-all cryptography --copy-metadata mcp-contextforge-gateway --copy-metadata cforge --copy-metadata mcp --hidden-import mcpgateway.main --hidden-import mcpgateway.plugins --hidden-import mcpgateway.plugins.framework --hidden-import mcpgateway.plugins.framework.external.mcp.client --hidden-import mcpgateway.plugins.framework.loader.config --hidden-import mcpgateway.plugins.framework.loader.plugin --hidden-import mcpgateway.plugins.tools --hidden-import uvicorn --hidden-import uvicorn.logging --hidden-import uvicorn.loops --hidden-import uvicorn.loops.auto --hidden-import uvicorn.protocols --hidden-import uvicorn.protocols.http --hidden-import uvicorn.protocols.http.auto --hidden-import uvicorn.protocols.websockets --hidden-import uvicorn.protocols.websockets.auto --hidden-import uvicorn.lifespan --hidden-import uvicorn.lifespan.on --hidden-import cryptography.hazmat.primitives.kdf.pbkdf2 --hidden-import cryptography.hazmat.primitives.kdf --hidden-import cryptography.hazmat.backends --hidden-import cryptography.hazmat.backends.openssl !PLUGINS_DATA_ARG! --name %OUTPUT_NAME%

if %ERRORLEVEL% NEQ 0 (
    echo [X] Build failed! Check the output above for errors.
    exit /b 1
)

REM Check if build was successful
if exist "dist\%OUTPUT_NAME%.exe" (
    echo [+] Build completed successfully!
    echo.
    echo ========================================
    echo Executable created at:
    echo   %CD%\dist\%OUTPUT_NAME%.exe
    echo ========================================
    echo.

    REM Test the executable
    echo [*] Testing executable...
    "dist\%OUTPUT_NAME%.exe" --version >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo [+] Executable is working!
    ) else (
        "dist\%OUTPUT_NAME%.exe" --help >nul 2>nul
        if !ERRORLEVEL! EQU 0 (
            echo [+] Executable is working!
        ) else (
            echo [!] Executable created but may have issues. Test it manually.
        )
    )

    echo.
    echo [*] Next steps:
    echo   1. Test the executable: dist\%OUTPUT_NAME%.exe
    echo   2. The Electron app will automatically detect it
    echo   3. Use the tray menu to start/stop the backend
    echo.
) else (
    echo [X] Build failed! Executable not found.
    exit /b 1
)

endlocal
