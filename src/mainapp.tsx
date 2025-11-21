import { useState } from 'react';
import { SideNav } from './components/SideNav';
import { TopNav } from './components/TopNav';
import { AddServerForm } from './components/AddServerForm';
import { MCPServersPage } from './components/MCPServersPage';
import { ToolsPage } from './components/ToolsPage';
import { SettingsPage } from './components/SettingsPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toaster } from './components/ui/sonner';
import { useTray } from './hooks/useTray';

function AppContent() {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState<'servers' | 'mcp-servers' | 'tools' | 'settings'>('servers');
  
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
          {currentPage === 'servers' && <AddServerForm />}
          {currentPage === 'mcp-servers' && <MCPServersPage />}
          {currentPage === 'tools' && <ToolsPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}