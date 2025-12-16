import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PluginSummary, PluginDetail, PluginStatsResponse } from '../types/plugin';
import { PageHeader } from './common';
import * as api from '../lib/api/contextforge-api-ipc';
import { withAuth } from '../lib/api/auth-helper';
import { toast } from '../lib/toastWithTray';
import { Plug, CheckCircle2, XCircle, Info, RefreshCw, Power } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Switch } from './ui/switch';
import { useCurrentUser } from '../hooks/useCurrentUser';
import type { PluginConfig } from '../types/backend-settings';

export function PluginsPage() {
  const [plugins, setPlugins] = useState<PluginSummary[]>([]);
  const [stats, setStats] = useState<PluginStatsResponse | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [pluginConfigs, setPluginConfigs] = useState<Record<string, PluginConfig>>({});
  const [enablePlugins, setEnablePlugins] = useState(true); // Default to true to match backend default
  const [isRestarting, setIsRestarting] = useState(false);

  const { theme } = useTheme();
  const [isInternalProfile, setIsInternalProfile] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      try {
        const result = await window.electronAPI.api.getCurrentProfile();
        if (result.success && result.data?.profile) {
          // Check for "Internal Backend" or "Internal" profile names
          const profileName = result.data.profile.name;
          setIsInternalProfile(
            profileName === 'Internal Backend'
          );
        }
        // If no profile or error, keep default (true)
      } catch (error) {
        console.error('Failed to get current profile:', error);
        // Keep default (true) on error
      }
    }
    checkProfile();
  }, []);

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

  // Load plugin configs on mount if Internal profile
  useEffect(() => {
    if (isInternalProfile) {
      loadPluginConfigs();
    }
  }, [isInternalProfile]);

  async function loadPluginConfigs() {
    try {
      const [enableResult, configsResult] = await Promise.all([
        window.electronAPI.getEnablePlugins(),
        window.electronAPI.getAllPluginConfigs(),
      ]);
      
      if (enableResult.success && enableResult.data !== undefined) {
        setEnablePlugins(enableResult.data);
      }
      
      if (configsResult.success && configsResult.data) {
        setPluginConfigs(configsResult.data);
      }
    } catch (error) {
      console.error('Failed to load plugin configs:', error);
    }
  }

  // Handler to toggle plugin enablement
  async function handleTogglePlugin(pluginName: string, enabled: boolean) {
    try {
      const config: PluginConfig = {
        enabled,
        mode: enabled ? 'permissive' : 'disabled',
      };
      
      const result = await window.electronAPI.setPluginConfig(pluginName, config);
      
      if (result.success) {
        setPluginConfigs(prev => ({
          ...prev,
          [pluginName]: config,
        }));
        toast.success(`Plugin ${enabled ? 'enabled' : 'disabled'}. Restart backend to apply changes.`);
      } else {
        toast.error('Failed to update plugin: ' + result.error);
      }
    } catch (error) {
      toast.error('Failed to update plugin: ' + (error as Error).message);
    }
  }

  // Handler to toggle global plugin system
  async function handleTogglePluginSystem(enabled: boolean) {
    try {
      const result = await window.electronAPI.setEnablePlugins(enabled);
      
      if (result.success) {
        setEnablePlugins(enabled);
        toast.success(`Plugin system ${enabled ? 'enabled' : 'disabled'}. Restart backend to apply changes.`);
      } else {
        toast.error('Failed to update plugin system: ' + result.error);
      }
    } catch (error) {
      toast.error('Failed to update plugin system: ' + (error as Error).message);
    }
  }

  // Handler to restart backend
  async function handleRestartBackend() {
    try {
      setIsRestarting(true);
      toast.info('Restarting backend...');
      
      const result = await window.electronAPI.restartBackend();
      
      if (result.success) {
        toast.success('Backend restarted successfully');
        // Reload plugins after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error('Failed to restart backend: ' + result.error);
      }
    } catch (error) {
      toast.error('Failed to restart backend: ' + (error as Error).message);
    } finally {
      setIsRestarting(false);
    }
  }

  const handlePluginClick = async (plugin: PluginSummary) => {
    try {
      const details = await withAuth(
        () => api.getPluginDetails(plugin.name),
        'Failed to load plugin details'
      );
      
      // Check if we got valid details
      if (!details || !details.name) {
        // If backend doesn't return full details (e.g., for disabled plugins),
        // create a detail object from the summary
        const fallbackDetails: PluginDetail = {
          name: plugin.name,
          description: plugin.description,
          author: plugin.author,
          version: plugin.version,
          mode: plugin.mode,
          priority: plugin.priority,
          hooks: plugin.hooks,
          tags: plugin.tags,
          status: plugin.status,
          config_summary: plugin.config_summary,
          plugin_type: null,
          namespace: null,
          conditions: null,
          config: null,
          manifest: null
        };
        setSelectedPlugin(fallbackDetails);
      } else {
        setSelectedPlugin(details);
      }
      
      setShowDetailsDialog(true);
    } catch (err) {
      const errorMsg = (err as Error).message;
      
      // If the plugin details aren't available (common for disabled plugins),
      // show the summary info we already have
      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        toast.info('Detailed information not available for this plugin. Showing summary.');
        const fallbackDetails: PluginDetail = {
          name: plugin.name,
          description: plugin.description,
          author: plugin.author,
          version: plugin.version,
          mode: plugin.mode,
          priority: plugin.priority,
          hooks: plugin.hooks,
          tags: plugin.tags,
          status: plugin.status,
          config_summary: plugin.config_summary,
          plugin_type: null,
          namespace: null,
          conditions: null,
          config: null,
          manifest: null
        };
        setSelectedPlugin(fallbackDetails);
        setShowDetailsDialog(true);
      } else {
        toast.error('Failed to load plugin details: ' + errorMsg);
      }
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
        {/* Plugin System Control Card - Only for Internal Profile */}
        {isInternalProfile && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Power className="w-5 h-5" />
                    Plugin System Control
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Manage the plugin system for the internal backend
                  </CardDescription>
                </div>
                <Button
                  onClick={handleRestartBackend}
                  disabled={isRestarting}
                  variant="outline"
                  size="sm"
                >
                  {isRestarting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Restarting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restart Backend
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Plugin System</p>
                  <p className="text-sm text-muted-foreground">
                    Requires backend restart to take effect
                  </p>
                </div>
                <Switch
                  checked={enablePlugins}
                  onCheckedChange={handleTogglePluginSystem}
                />
              </div>
            </CardContent>
          </Card>
        )}

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
                  <p className="text-sm font-medium mb-2">Configuration</p>
                  {typeof selectedPlugin.config_summary === 'string' ? (
                    <p className="text-sm text-muted-foreground">{selectedPlugin.config_summary}</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(selectedPlugin.config_summary).map(([key, value]) => (
                        <div key={key} className="border rounded-lg p-3 bg-muted/50">
                          <p className="text-sm font-medium mb-1 capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {value.map((item, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {String(item)}
                                  </Badge>
                                ))}
                              </div>
                            ) : typeof value === 'object' && value !== null ? (
                              <pre className="text-xs overflow-x-auto mt-1 p-2 bg-background rounded">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            ) : typeof value === 'boolean' ? (
                              <Badge variant={value ? 'default' : 'secondary'} className="text-xs">
                                {value ? 'Enabled' : 'Disabled'}
                              </Badge>
                            ) : (
                              <span>{String(value)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Plugin Control - Only for Internal Profile */}
              {isInternalProfile && selectedPlugin && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Plugin Control</p>
                    <Switch
                      checked={pluginConfigs[selectedPlugin.name]?.enabled ?? (selectedPlugin.status === 'enabled')}
                      onCheckedChange={(checked) => handleTogglePlugin(selectedPlugin.name, checked)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Changes require backend restart to take effect
                  </p>
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
