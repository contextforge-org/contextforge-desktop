#!/bin/bash
# Build script for Context Forge Python Backend
# Uses UV to create an isolated environment and PyInstaller to build the executable

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VENV_DIR=".venv"
GATEWAY_REPO_SSH="git+ssh://git@github.com/IBM/mcp-context-forge.git"
GATEWAY_REPO_HTTPS="git+https://github.com/IBM/mcp-context-forge.git"
CLI_REPO_SSH="git+ssh://git@github.com/contextforge-org/contextforge-cli.git"
CLI_REPO_HTTPS="git+https://github.com/contextforge-org/contextforge-cli.git"
OUTPUT_NAME="cforge"
DEFAULT_HOME_DIR=${DEFAULT_HOME_DIR:-""}

# Always run from the script's parent directory
cd $(dirname ${BASH_SOURCE[0]})

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Context Forge Backend Build Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status messages
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if UV is installed
print_status "Checking for UV installation..."
if ! command -v uv &> /dev/null; then
    print_warning "UV not found. Installing UV..."
    curl -LsSf https://astral.sh/uv/install.sh | sh

    # Add UV to PATH for current session
    export PATH="$HOME/.cargo/bin:$PATH"

    if ! command -v uv &> /dev/null; then
        print_error "Failed to install UV. Please install manually: https://github.com/astral-sh/uv"
        exit 1
    fi
    print_success "UV installed successfully"
else
    print_success "UV is already installed ($(uv --version))"
fi

# Create or activate virtual environment
print_status "Setting up Python environment..."
if [ ! -d "$VENV_DIR" ]; then
    print_status "Creating new UV virtual environment..."
    uv venv "$VENV_DIR"
    print_success "Virtual environment created"
else
    print_success "Using existing virtual environment"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Verify we're using the venv's Python
PYTHON_PATH=$(which python)
if [[ "$PYTHON_PATH" == *"$VENV_DIR"* ]]; then
    print_success "Virtual environment activated (Python: $PYTHON_PATH)"
else
    print_warning "Python may not be from venv: $PYTHON_PATH"
fi

# Install mcp-context-forge (provides mcpgateway module)
print_status "Installing mcp-context-forge from GitHub (IBM/mcp-context-forge)..."
echo ""

# Try SSH first, fallback to HTTPS
if uv pip install "$GATEWAY_REPO_SSH" 2>/dev/null; then
    print_success "Installed mcp-context-forge via SSH"
else
    print_warning "SSH installation failed, trying HTTPS..."
    if uv pip install "$GATEWAY_REPO_HTTPS"; then
        print_success "Installed mcp-context-forge via HTTPS"
    else
        print_error "Failed to install mcp-context-forge from GitHub"
        print_error "Please check your git credentials and network connection"
        exit 1
    fi
fi

# Verify mcp-contextforge-gateway was installed
print_status "Verifying mcp-contextforge-gateway installation..."
if uv pip show mcp-contextforge-gateway >/dev/null 2>&1; then
    print_success "mcp-contextforge-gateway package installed"
else
    print_error "mcp-contextforge-gateway package not found!"
    exit 1
fi

# Install contextforge-cli (provides cforge module)
print_status "Installing contextforge-cli from GitHub (contextforge-org/contextforge-cli)..."
echo ""

# Try SSH first, fallback to HTTPS
if uv pip install "$CLI_REPO_SSH" 2>/dev/null; then
    print_success "Installed contextforge-cli via SSH"
else
    print_warning "SSH installation failed, trying HTTPS..."
    if uv pip install "$CLI_REPO_HTTPS"; then
        print_success "Installed contextforge-cli via HTTPS"
    else
        print_error "Failed to install contextforge-cli from GitHub"
        print_error "Please check your git credentials and network connection"
        exit 1
    fi
fi

# Verify cforge module was installed from contextforge-cli
print_status "Verifying cforge module installation..."
if python -c "import cforge" 2>/dev/null; then
    print_success "cforge module is available"
    python -c "import cforge; print('  Location:', cforge.__file__)"
else
    print_error "cforge module not found after installation!"
    print_error "Checking what was installed..."
    uv pip list | grep -i cforge
    print_error ""
    print_error "This is a package configuration issue in the source repository."
    exit 1
fi

# Verify mcp module is available (dependency)
print_status "Verifying mcp module..."
if python -c "import mcp" 2>/dev/null; then
    print_success "mcp module is available"
else
    print_warning "mcp module not found (may be optional)"
fi

# Install PyInstaller
print_status "Installing PyInstaller..."
uv pip install pyinstaller
print_success "PyInstaller installed"

# Verify PyInstaller is from venv
PYINSTALLER_PATH=$(which pyinstaller)
if [[ "$PYINSTALLER_PATH" == *"$VENV_DIR"* ]]; then
    print_success "Using PyInstaller from venv: $PYINSTALLER_PATH"
else
    print_warning "PyInstaller may not be from venv: $PYINSTALLER_PATH"
fi

# Find cforge.py location
print_status "Locating cforge.py entry point..."

# Try multiple methods to find cforge.py
CFORGE_PATH=""

# Method 0: Just run `which cforge`
if which cforge 2>/dev/null; then
    CFORGE_PATH=$(which cforge)
    print_success "cforge found at $CFORGE_PATH"
fi

# Method 1: Check if cforge module exists and find its location
if [ -z "$CFORGE_PATH" ] || [ ! -f "$CFORGE_PATH" ]; then
    if python -c "import cforge" 2>/dev/null; then
        print_success "cforge module found"

        # Try to find cforge.py in the package directory
        CFORGE_PATH=$(python -c "import cforge; import os; pkg_dir = os.path.dirname(cforge.__file__); cforge_py = os.path.join(pkg_dir, 'cforge.py'); print(cforge_py if os.path.exists(cforge_py) else '')" 2>/dev/null)

        if [ -z "$CFORGE_PATH" ]; then
            # Try __main__.py instead
            CFORGE_PATH=$(python -c "import cforge; import os; pkg_dir = os.path.dirname(cforge.__file__); main_py = os.path.join(pkg_dir, '__main__.py'); print(main_py if os.path.exists(main_py) else '')" 2>/dev/null)
        fi
    fi
fi

# Method 2: Search for cforge.py in the virtual environment
if [ -z "$CFORGE_PATH" ] || [ ! -f "$CFORGE_PATH" ]; then
    print_status "Searching for cforge.py in virtual environment..."
    CFORGE_PATH=$(find "$VENV_DIR" -name "cforge.py" -type f -not -path "*/test/*" -not -path "*/__pycache__/*" | head -n 1)
fi

# Method 3: Check if there's a console script entry point
if [ -z "$CFORGE_PATH" ] || [ ! -f "$CFORGE_PATH" ]; then
    print_status "Checking for console script entry point..."
    if [ -f "$VENV_DIR/bin/cforge" ]; then
        print_warning "Found cforge console script, but need Python source file"
        print_status "Attempting to extract entry point from console script..."

        # Try to find the module from the console script
        MODULE_INFO=$(grep -A 5 "from.*import" "$VENV_DIR/bin/cforge" | head -n 1)
        print_status "Console script info: $MODULE_INFO"
    fi
fi

# Method 4: List installed packages to help debug
if [ -z "$CFORGE_PATH" ] || [ ! -f "$CFORGE_PATH" ]; then
    print_warning "Could not find cforge.py, checking installed packages..."
    echo ""
    echo "Installed packages:"
    uv pip list | grep -E "(cforge|contextforge|mcp)" || echo "No matching packages found"
    echo ""

    print_status "Checking cforge package structure..."
    python -c "import cforge; import os; print('cforge location:', cforge.__file__); print('Package contents:'); import pkgutil; print([name for _, name, _ in pkgutil.iter_modules([os.path.dirname(cforge.__file__)])])" 2>/dev/null || echo "Could not inspect cforge package"
    echo ""
fi

# Create a wrapper script to redirect the home dir to the app's data path
CFORGE_PATH="cforge_wrapper.py"
cat > "$CFORGE_PATH" << EOF
#!/usr/bin/env python3
"""
Wrapper script for cforge to default home to app data
"""
import os

HOME_ENV = "CONTEXTFORGE_HOME"

if __name__ == '__main__':
    # Set the default env var for the home directory
    if home_dir := os.getenv(HOME_ENV, "${DEFAULT_HOME_DIR}"):
        os.environ[HOME_ENV] = home_dir

    # Import the main entrypoint and run it
    from cforge.main import main
    sys.exit(main())
EOF
chmod +x "$CFORGE_PATH"
print_success "Created wrapper script at: $CFORGE_PATH"

# Verify the wrapper works
print_status "Testing wrapper script..."
if python "$CFORGE_PATH" --help >/dev/null 2>&1; then
    print_success "Wrapper script works!"
else
    print_warning "Wrapper test inconclusive, but proceeding with build..."
fi


# Clean previous build artifacts
print_status "Cleaning previous build artifacts..."
rm -rf build dist *.spec
print_success "Build directory cleaned"

# Run PyInstaller
print_status "Running PyInstaller..."
echo ""
echo -e "${YELLOW}PyInstaller command:${NC}"
echo "pyinstaller \"$CFORGE_PATH\" -F --console --collect-all cforge --collect-all mcpgateway --collect-all mcp --name $OUTPUT_NAME"
echo ""

pyinstaller "$CFORGE_PATH" \
    -F \
    --console \
    --collect-all cforge \
    --collect-all mcpgateway \
    --collect-all mcp \
    --collect-all cryptography \
    --copy-metadata mcp-contextforge-gateway \
    --copy-metadata cforge \
    --copy-metadata mcp \
    --hidden-import mcpgateway.main \
    --hidden-import uvicorn \
    --hidden-import uvicorn.logging \
    --hidden-import uvicorn.loops \
    --hidden-import uvicorn.loops.auto \
    --hidden-import uvicorn.protocols \
    --hidden-import uvicorn.protocols.http \
    --hidden-import uvicorn.protocols.http.auto \
    --hidden-import uvicorn.protocols.websockets \
    --hidden-import uvicorn.protocols.websockets.auto \
    --hidden-import uvicorn.lifespan \
    --hidden-import uvicorn.lifespan.on \
    --hidden-import cryptography.hazmat.primitives.kdf.pbkdf2 \
    --hidden-import cryptography.hazmat.primitives.kdf \
    --hidden-import cryptography.hazmat.backends \
    --hidden-import cryptography.hazmat.backends.openssl \
    --name "$OUTPUT_NAME"

# Check if build was successful
if [ -f "dist/$OUTPUT_NAME" ]; then
    print_success "Build completed successfully!"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Executable created at:${NC}"
    echo -e "${GREEN}  $(pwd)/dist/$OUTPUT_NAME${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""

    # Make executable
    chmod +x "dist/$OUTPUT_NAME"

    # Test the executable
    print_status "Testing executable..."
    if "dist/$OUTPUT_NAME" --version &> /dev/null || "dist/$OUTPUT_NAME" --help &> /dev/null; then
        print_success "Executable is working!"
    else
        print_warning "Executable created but may have issues. Test it manually."
    fi

    echo ""
    print_status "Next steps:"
    echo "  1. Test the executable: ./dist/$OUTPUT_NAME"
    echo "  2. The Electron app will automatically detect it"
    echo "  3. Use the tray menu to start/stop the backend"
    echo ""
else
    print_error "Build failed! Check the output above for errors."
    exit 1
fi

# Made with Bob
