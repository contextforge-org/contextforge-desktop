# Context Forge Electron

A desktop application for managing MCP (Model Context Protocol) servers, tools, prompts, and resources. Built with Electron, React, TypeScript, and Python.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd context-forge-electron
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Build the Python backend**
   ```bash
   cd python
   
   # On macOS/Linux:
   ./build.sh
   
   # On Windows:
   build.bat
   ```

4. **Start the application**
   ```bash
   # From the root directory
   npm start
   ```

That's it! The app will launch with the Python backend integrated.

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
│   │   └── *.tsx           # Feature components
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React contexts (Theme, Team)
│   ├── lib/                # Utilities and libraries
│   │   ├── api/           # API client layer
│   │   └── contextforge-client-ts/  # Generated API client
│   ├── types/              # TypeScript type definitions
│   ├── services/           # Application services
│   ├── main.ts             # Electron main process
│   ├── preload.ts          # Electron preload script
│   └── app.tsx             # React app root
├── python/                 # Python backend
│   ├── build.sh           # Build script (macOS/Linux)
│   ├── build.bat          # Build script (Windows)
│   └── dist/              # Built backend executable
├── assets/                 # Static assets (icons, images)
├── docs/                   # Documentation
└── forge.config.ts         # Electron Forge configuration
```

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

### Resources Management
- Browse and manage MCP resources
- View resource metadata and content
- Filter and search capabilities

### Catalog Integration
- Browse MCP server catalog
- Install servers from catalog
- View server details and documentation

### LLM Playground
- Interactive chat interface
- Test prompts and tools
- Multiple LLM provider support
- Conversation history

### Settings & Administration
- Multi-profile support with OAuth
- User management with RBAC
- Team management
- API token generation
- Permission management

### Observability & Metrics
- Real-time metrics dashboard
- Performance monitoring
- Activity tracking
- Security insights

## 🐍 Python Backend

The Python backend is automatically managed by the application:

- **Auto-start**: Backend starts when the app launches
- **Tray control**: Start/stop from system tray menu
- **Status monitoring**: View PID and uptime
- **Graceful shutdown**: Automatic cleanup on app quit

The backend provides:
- MCP server catalog management
- Server configuration validation
- Plugin system support
- Local API endpoints

See [python/README.md](python/README.md) for backend-specific documentation.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (optional):

```bash
# API Configuration
VITE_API_URL=http://localhost:4444

# Development
VITE_LOG_LEVEL=info
VITE_ENABLE_DEVTOOLS=true
```

### Backend API

The application can connect to an external backend API at `http://localhost:4444` by default. This is optional - the built-in Python backend provides core functionality.

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server with hot reload
- `npm run package` - Package the app for distribution
- `npm run make` - Create platform-specific installers
- `npm run publish` - Publish the app
- `npm run lint` - Run ESLint
- `npm run lint -- --fix` - Fix linting issues

### Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons, shadcn/ui
- **Desktop**: Electron 39, Electron Forge
- **Build**: Vite 7
- **Backend**: Python 3.8+ with FastAPI
- **State Management**: React Context + Hooks

## 📝 Documentation

- [Python Backend](python/README.md)
- [Python Backend Integration](docs/README-python-backend.md)
- [Toast & Tray Integration](docs/README-toast-tray.md)
- [Multi-Profile Authentication](docs/multi-profile-authentication.md)
- [LLM Playground Design](docs/llm-playground-design.md)
- [Prompts Page Design](docs/prompts-page-design.md)
- [Metrics Dashboard](docs/metrics-dashboard-architecture.md)

## 🧪 Testing

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

*Note: Comprehensive test suite to be added*

## 🔐 Security

- Profile credentials stored securely using Electron's safeStorage API
- OAuth 2.0 support for authentication
- HTTPS recommended for production API endpoints
- Input validation on all user inputs
- Role-based access control (RBAC)

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

## 🗺️ Roadmap

- [ ] Add comprehensive test coverage
- [ ] Implement error boundaries
- [ ] Upgrade to TypeScript 5.7+
- [ ] Add CI/CD pipeline
- [ ] Enhanced plugin system
- [ ] Advanced metrics and analytics
- [ ] Component library/Storybook
- [ ] Mobile companion app

## 💬 Support

For issues and questions, please open an issue on GitHub.