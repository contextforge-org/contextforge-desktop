import { useState, useEffect } from 'react';
import { SideNav } from './components/SideNav';
import { TopNav } from './components/TopNav';
import { VirtualServersPage } from './components/VirtualServersPage';
import { MCPServersPage } from './components/MCPServersPage';
import { ToolsPage } from './components/ToolsPage';
import { PromptsPage } from './components/PromptsPage';
import { ResourcesPage } from './components/ResourcesPage';
import { AgentsPage } from './components/AgentsPage';
import { MetricsPage } from './components/MetricsPage';
import { SettingsPage } from './components/SettingsPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TeamProvider } from './context/TeamContext';
import { Toaster } from './components/ui/sonner';
import { useTray } from './hooks/useTray';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OnboardingScreen } from './components/OnboardingScreen';
import { useBackendStatus } from './hooks/useBackendStatus';

function AppContent() {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState<'servers' | 'mcp-servers' | 'tools' | 'prompts' | 'resources' | 'agents' | 'metrics' | 'settings'>('servers');
  
  // Initialize tray integration for toast notifications
  useTray();
  
  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      {/* Top Navigation */}
      <TopNav />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Side Navigation */}
        <SideNav currentPage={currentPage} onNavigate={setCurrentPage} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {currentPage === 'servers' && <VirtualServersPage />}
          {currentPage === 'mcp-servers' && <MCPServersPage />}
          {currentPage === 'tools' && <ToolsPage />}
          {currentPage === 'prompts' && <PromptsPage />}
          {currentPage === 'resources' && <ResourcesPage />}
          {currentPage === 'agents' && <AgentsPage />}
          {currentPage === 'metrics' && <MetricsPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  const backendStatus = useBackendStatus();
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    if (backendStatus.isReady) {
      // Small delay for smooth transition and success animation
      const timer = setTimeout(() => {
        setShowOnboarding(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [backendStatus.isReady]);

  if (showOnboarding) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <OnboardingScreen status={backendStatus} mode="embedded" />
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TeamProvider>
          <AppContent />
        </TeamProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}