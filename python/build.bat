@echo off
REM Build script for Context Forge Python Backend (Windows)
REM Uses UV to create an isolated environment and PyInstaller to build the executable

setlocal enabledelayedexpansion

REM Configuration
set VENV_DIR=.venv
set GATEWAY_REPO_SSH=git+ssh://git@github.com/IBM/mcp-context-forge.git
set GATEWAY_REPO_HTTPS=git+https://github.com/IBM/mcp-context-forge.git
set CLI_REPO_SSH=git+ssh://git@github.com/contextforge-org/contextforge-cli.git
set CLI_REPO_HTTPS=git+https://github.com/contextforge-org/contextforge-cli.git
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
echo [*] Installing mcp-context-forge from GitHub (IBM/mcp-context-forge) with [llmchat] extras...
echo.

REM Try SSH first, fallback to HTTPS
uv pip install "%GATEWAY_REPO_SSH%[llmchat]" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [+] Installed mcp-context-forge via SSH with [llmchat] extras
) else (
    echo [!] SSH installation failed, trying HTTPS...
    uv pip install "%GATEWAY_REPO_HTTPS%[llmchat]"
    if !ERRORLEVEL! NEQ 0 (
        echo [X] Failed to install mcp-context-forge from GitHub
        echo [X] Please check your git credentials and network connection
        exit /b 1
    )
    echo [+] Installed mcp-context-forge via HTTPS with [llmchat] extras
)

REM Install contextforge-cli (provides cforge module)
echo [*] Installing contextforge-cli from GitHub (contextforge-org/contextforge-cli)...
echo.

REM Try SSH first, fallback to HTTPS
uv pip install "%CLI_REPO_SSH%" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [+] Installed contextforge-cli via SSH
) else (
    echo [!] SSH installation failed, trying HTTPS...
    uv pip install "%CLI_REPO_HTTPS%"
    if !ERRORLEVEL! NEQ 0 (
        echo [X] Failed to install contextforge-cli from GitHub
        echo [X] Please check your git credentials and network connection
        exit /b 1
    )
    echo [+] Installed contextforge-cli via HTTPS
)

REM Install PyInstaller
echo [*] Installing PyInstaller...
uv pip install pyinstaller
if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to install PyInstaller
    exit /b 1
)
echo [+] PyInstaller installed

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
    echo Wrapper script for cforge to default home to app data
    echo """
    echo import os
    echo.
    echo HOME_ENV = "CONTEXTFORGE_HOME"
    echo.
    echo if __name__ == '__main__':
    echo     # Set the default env var for the home directory
    echo     if home_dir := os.getenv^(HOME_ENV, "%DEFAULT_HOME_DIR%"^):
    echo         os.environ[HOME_ENV] = home_dir
    echo.
    echo     # Import the main entrypoint and run it
    echo     from cforge.main import main
    echo     sys.exit^(main^(^)^)
) > !CFORGE_PATH!

echo [+] Created wrapper script at: !CFORGE_PATH!

REM Clean previous build artifacts
echo [*] Cleaning previous build artifacts...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist *.spec del /q *.spec
echo [+] Build directory cleaned

REM Run PyInstaller
echo [*] Running PyInstaller...
echo.
echo PyInstaller command:
echo pyinstaller "%CFORGE_PATH%" -F --console --collect-all cforge --collect-all mcpgateway --collect-all mcp --collect-all cryptography --name %OUTPUT_NAME%
echo.

pyinstaller "%CFORGE_PATH%" -F --console --collect-all cforge --collect-all mcpgateway --collect-all mcp --collect-all cryptography --copy-metadata mcp-contextforge-gateway --copy-metadata cforge --copy-metadata mcp --hidden-import mcpgateway.main --hidden-import uvicorn --hidden-import uvicorn.logging --hidden-import uvicorn.loops --hidden-import uvicorn.loops.auto --hidden-import uvicorn.protocols --hidden-import uvicorn.protocols.http --hidden-import uvicorn.protocols.http.auto --hidden-import uvicorn.protocols.websockets --hidden-import uvicorn.protocols.websockets.auto --hidden-import uvicorn.lifespan --hidden-import uvicorn.lifespan.on --hidden-import cryptography.hazmat.primitives.kdf.pbkdf2 --hidden-import cryptography.hazmat.primitives.kdf --hidden-import cryptography.hazmat.backends --hidden-import cryptography.hazmat.backends.openssl --name %OUTPUT_NAME%

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
