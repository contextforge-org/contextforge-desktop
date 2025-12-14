import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PluginSummary, PluginDetail, PluginStatsResponse } from '../types/plugin';
import { PageHeader } from './common';
import * as api from '../lib/api/contextforge-api-ipc';
import { withAuth } from '../lib/api/auth-helper';
import { toast } from '../lib/toastWithTray';
import { Plug, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

export function PluginsPage() {
  const [plugins, setPlugins] = useState<PluginSummary[]>([]);
  const [stats, setStats] = useState<PluginStatsResponse | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { theme } = useTheme();

  // Fetch plugins and stats on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const [pluginsData, statsData] = await Promise.all([
          withAuth(() => api.listPlugins(), 'Failed to load plugins'),
          withAuth(() => api.getPluginStats(), 'Failed to load plugin stats')
        ]);
        
        setPlugins(pluginsData.plugins || []);
        setStats(statsData);
        
        // Only show success toast if plugins are actually loaded
        if (pluginsData.plugins && pluginsData.plugins.length > 0) {
          toast.success('Plugins loaded successfully');
        }
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        
        // Check if it's a backend error
        if (errorMessage.includes('500') || errorMessage.includes('AttributeError')) {
          toast.error('Backend plugin API error. This may be a backend compatibility issue.');
          setError('Backend plugin API returned an error. The plugin feature may not be fully supported in this backend version.');
        } else {
          toast.error('Failed to load plugins: ' + errorMessage);
        }
        console.error('Failed to fetch plugins:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handlePluginClick = async (plugin: PluginSummary) => {
    try {
      const details = await withAuth(
        () => api.getPluginDetails(plugin.name),
        'Failed to load plugin details'
      );
      setSelectedPlugin(details);
      setShowDetailsDialog(true);
    } catch (err) {
      toast.error('Failed to load plugin details: ' + (err as Error).message);
    }
  };

  const enabledPlugins = plugins.filter(p => p.status === 'enabled');
  const disabledPlugins = plugins.filter(p => p.status === 'disabled');

  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <PageHeader
        title="Plugins"
        description="View and manage backend plugins"
        theme={theme}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_plugins}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Enabled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.enabled_plugins}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Disabled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-500">{stats.disabled_plugins}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>Loading plugins...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 mb-2">Failed to load plugins</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>{error}</p>
            </div>
          </div>
        )}

        {/* Plugins List */}
        {!isLoading && !error && plugins.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-md">
              <Plug className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No Plugins Available
              </h3>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                Plugins are not enabled in the backend or no plugins are installed.
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                To enable plugins, set <code className="px-1 py-0.5 rounded bg-zinc-800 text-cyan-400">ENABLE_PLUGINS=true</code> in your backend configuration.
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && plugins.length > 0 && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({plugins.length})</TabsTrigger>
              <TabsTrigger value="enabled">Enabled ({enabledPlugins.length})</TabsTrigger>
              <TabsTrigger value="disabled">Disabled ({disabledPlugins.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <PluginsList plugins={plugins} onPluginClick={handlePluginClick} theme={theme} />
            </TabsContent>

            <TabsContent value="enabled" className="mt-4">
              <PluginsList plugins={enabledPlugins} onPluginClick={handlePluginClick} theme={theme} />
            </TabsContent>

            <TabsContent value="disabled" className="mt-4">
              <PluginsList plugins={disabledPlugins} onPluginClick={handlePluginClick} theme={theme} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Plugin Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plug className="w-5 h-5" />
              {selectedPlugin?.name}
            </DialogTitle>
            <DialogDescription>{selectedPlugin?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedPlugin && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <Badge variant={selectedPlugin.status === 'enabled' ? 'default' : 'secondary'}>
                    {selectedPlugin.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Mode</p>
                  <Badge variant="outline">{selectedPlugin.mode}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Version</p>
                  <p className="text-sm">{selectedPlugin.version || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Author</p>
                  <p className="text-sm">{selectedPlugin.author || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Priority</p>
                  <p className="text-sm">{selectedPlugin.priority}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Type</p>
                  <p className="text-sm">{selectedPlugin.plugin_type || 'N/A'}</p>
                </div>
              </div>

              {selectedPlugin.hooks && selectedPlugin.hooks.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Hooks</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlugin.hooks.map((hook, idx) => (
                      <Badge key={idx} variant="secondary">{hook}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedPlugin.tags && selectedPlugin.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlugin.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedPlugin.config_summary && (
                <div>
                  <p className="text-sm font-medium mb-2">Configuration Summary</p>
                  <p className="text-sm text-muted-foreground">{selectedPlugin.config_summary}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PluginsList({ 
  plugins, 
  onPluginClick, 
  theme 
}: { 
  plugins: PluginSummary[]; 
  onPluginClick: (plugin: PluginSummary) => void;
  theme: 'light' | 'dark';
}) {
  if (plugins.length === 0) {
    return (
      <div className="text-center py-12">
        <Plug className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-gray-400'}`} />
        <p className={theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}>No plugins found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plugins.map((plugin) => (
        <Card 
          key={plugin.name} 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onPluginClick(plugin)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {plugin.status === 'enabled' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  {plugin.name}
                </CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {plugin.description || 'No description available'}
                </CardDescription>
              </div>
              <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mode:</span>
                <Badge variant="outline" className="text-xs">{plugin.mode}</Badge>
              </div>
              {plugin.version && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="text-xs">{plugin.version}</span>
                </div>
              )}
              {plugin.hooks && plugin.hooks.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hooks:</span>
                  <span className="text-xs">{plugin.hooks.length}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Made with Bob
