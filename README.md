# Context Forge Electron

A desktop application for managing MCP (Model Context Protocol) servers, tools, prompts, and resources. Built with Electron, React, TypeScript, and Python.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for backend)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd context-forge-electron

# Install dependencies
npm install

# Install Python dependencies (optional, for backend)
cd python
pip install pyinstaller
cd ..
```

### Development

```bash
# Start the application in development mode
npm start

# This will:
# - Start the Electron app with hot reload
# - Open DevTools automatically
# - Watch for file changes
```

### Building the Python Backend

The application can optionally run a Python backend process. To build the executable:

```bash
cd python
pip install pyinstaller
pyinstaller --onefile --name backend backend.py
```

The executable will be created in `python/dist/backend` (or `backend.exe` on Windows).

## 📦 Building for Production

```bash
# Package the application
npm run package

# Create distributable installers
npm run make
```

Built applications will be in the `out/` directory.

## 🏗️ Project Structure

```
context-forge-electron/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components (Radix UI)
│   │   ├── common/         # Shared components
│   │   └── *.tsx           # Feature components
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React contexts (Theme, Team)
│   ├── lib/                # Utilities and libraries
│   │   ├── api/           # API client layer
│   │   └── contextforge-client-ts/  # Generated API client
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Global styles
│   ├── main.ts             # Electron main process
│   ├── preload.ts          # Electron preload script
│   ├── renderer.ts         # Renderer entry point
│   └── app.tsx             # React app root
├── python/                 # Python backend
│   ├── backend.py         # Main backend script
│   └── dist/              # PyInstaller output
├── assets/                 # Static assets (icons, images)
├── docs/                   # Documentation
└── forge.config.ts         # Electron Forge configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:4444

# Development
VITE_LOG_LEVEL=info
VITE_ENABLE_DEVTOOLS=true
```

### API Backend

The application expects a backend API running at `http://localhost:4444` by default. Configure this in:
- `.env` file (recommended)
- `src/lib/api/contextforge-api.ts` (hardcoded fallback)

## 🎯 Features

### MCP Server Management
- View, create, edit, and delete MCP servers
- Toggle server status (active/inactive)
- Filter by tags, visibility, and team
- Grid and table view modes

### Virtual Servers
- Manage virtual server configurations
- Associate tools, resources, and prompts
- Configure transport and authentication

### Tools Management
- Browse and manage available tools
- Test tools with custom parameters
- Bulk import from JSON
- Filter by annotations, types, and methods

### Prompts Management
- Create and manage prompt templates
- Define template variables
- Execute prompts with arguments
- Track execution metrics

### Settings
- User management with RBAC
- Team management
- API token generation
- Permission management

## 🐍 Python Backend Integration

The application includes a Python process manager that can spawn and control a PyInstaller-packaged Python executable.

### Features
- Start/stop Python backend from tray menu
- Monitor process status (PID, uptime)
- Graceful shutdown handling
- Automatic cleanup on app quit

### Usage
1. Build the Python executable (see above)
2. Start the app
3. Right-click tray icon → Python Backend → Start Backend

See [docs/README-python-backend.md](docs/README-python-backend.md) for detailed documentation.

## 🧪 Testing

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

*Note: Test suite to be added*

## 🛠️ Development Tools

### Available Scripts

- `npm start` - Start development server
- `npm run package` - Package the app
- `npm run make` - Create distributable installers
- `npm run publish` - Publish the app
- `npm run lint` - Run ESLint

### Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Desktop**: Electron 39, Electron Forge
- **Build**: Vite 7
- **Backend**: Python 3.8+ (optional)

## 📝 Documentation

- [Python Backend Integration](docs/README-python-backend.md)
- [Toast & Tray Integration](docs/README-toast-tray.md)
- [Settings Page RBAC](docs/settings-page-rbac-integration-plan.md)
- [Prompts Page Design](docs/prompts-page-design.md)

## 🔐 Security

- Tokens stored in localStorage (consider using Electron's safeStorage API)
- HTTPS recommended for production API endpoints
- Input validation on all user inputs
- Content Security Policy to be implemented

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

Rynne Whitnah (rpwhitna@us.ibm.com)

## 🐛 Known Issues

- TypeScript version needs upgrade (currently 4.5.4)
- No automated tests yet
- Error boundaries not implemented
- API layer needs consolidation

## 🗺️ Roadmap

- [ ] Add comprehensive test coverage
- [ ] Implement error boundaries
- [ ] Upgrade to TypeScript 5.7+
- [ ] Consolidate API layer
- [ ] Add CI/CD pipeline
- [ ] Implement proper state management
- [ ] Add performance monitoring
- [ ] Create component library/Storybook

## 💬 Support

For issues and questions, please open an issue on GitHub.