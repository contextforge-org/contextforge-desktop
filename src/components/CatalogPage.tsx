import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTeam } from '../context/TeamContext';
import { CatalogServer } from '../types/catalog';
import { PageHeader } from './common';
import * as api from '../lib/api/contextforge-api-ipc';
import { withAuth } from '../lib/api/auth-helper';
import { toast } from '../lib/toastWithTray';
import { Search, Filter, Package, ExternalLink, CheckCircle2, Loader2, Plus, Key } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

export function CatalogPage() {
  const [servers, setServers] = useState<CatalogServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedAuthType, setSelectedAuthType] = useState<string>('all');
  const [showRegisteredOnly, setShowRegisteredOnly] = useState(false);
  const [registeringIds, setRegisteringIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [showCredentialDialog, setShowCredentialDialog] = useState(false);
  const [selectedServerForAuth, setSelectedServerForAuth] = useState<CatalogServer | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [customName, setCustomName] = useState('');

  const { theme } = useTheme();
  const { selectedTeamId } = useTeam();

  // Fetch catalog servers
  useEffect(() => {
    async function fetchCatalogServers() {
      try {
        setIsLoading(true);
        const response = await withAuth(
          () => api.listCatalogServers({
            show_registered: showRegisteredOnly || undefined,
          }),
          'Failed to load catalog servers'
        );
        
        setServers(response.servers);
        setCategories(response.categories || []);
        setProviders(response.providers || []);
        toast.success('Catalog loaded successfully');
      } catch (err) {
        const errorMessage = (err as Error).message;
        toast.error('Failed to load catalog: ' + errorMessage);
        console.error('Failed to fetch catalog servers:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCatalogServers();
  }, [showRegisteredOnly]);

  // Filter servers
  const filteredServers = useMemo(() => {
    return servers.filter(server => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          server.name.toLowerCase().includes(query) ||
          server.description.toLowerCase().includes(query) ||
          server.provider.toLowerCase().includes(query) ||
          (server.tags && server.tags.some(tag => tag.toLowerCase().includes(query)));
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && server.category !== selectedCategory) {
        return false;
      }

      // Provider filter
      if (selectedProvider !== 'all' && server.provider !== selectedProvider) {
        return false;
      }

      // Auth type filter
      if (selectedAuthType !== 'all' && server.auth_type !== selectedAuthType) {
        return false;
      }

      return true;
    });
  }, [servers, searchQuery, selectedCategory, selectedProvider, selectedAuthType]);

  // Check if server requires authentication
  const requiresAuth = (server: CatalogServer) => {
    return server.requires_api_key ||
           (server.auth_type && server.auth_type.toLowerCase() !== 'open' && server.auth_type.toLowerCase() !== 'none');
  };

  // Handle register button click
  const handleRegisterClick = (server: CatalogServer) => {
    if (requiresAuth(server)) {
      // Show credential dialog
      setSelectedServerForAuth(server);
      setCustomName(server.name);
      setApiKey('');
      setShowCredentialDialog(true);
    } else {
      // Register directly without credentials
      handleRegister(server);
    }
  };

  // Register a catalog server
  const handleRegister = async (server: CatalogServer, credentials?: { apiKey?: string; customName?: string }) => {
    try {
      setRegisteringIds(prev => new Set(prev).add(server.id));
      
      const requestData: any = {
        server_id: server.id,
      };

      if (credentials?.customName) {
        requestData.name = credentials.customName;
      }

      if (credentials?.apiKey) {
        requestData.api_key = credentials.apiKey;
      }

      // For OAuth servers, indicate that OAuth credentials will be configured
      // The backend should recognize the auth_type from the catalog server definition
      if (server.auth_type?.toLowerCase().includes('oauth')) {
        // OAuth will be configured after registration via the server details panel
        requestData.oauth_credentials = {};
      }

      await withAuth(
        () => api.registerCatalogServer(server.id, requestData),
        'Failed to register server'
      );

      // Update the server's registered status
      setServers(prev => prev.map(s =>
        s.id === server.id ? { ...s, is_registered: true } : s
      ));

      toast.success(`${server.name} registered successfully${server.auth_type?.toLowerCase().includes('oauth') ? '. Please configure OAuth in the server details.' : ''}`);
      
      // Close dialog if open
      setShowCredentialDialog(false);
      setSelectedServerForAuth(null);
      setApiKey('');
      setCustomName('');
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error('Failed to register server: ' + errorMessage);
      console.error('Failed to register server:', err);
    } finally {
      setRegisteringIds(prev => {
        const next = new Set(prev);
        next.delete(server.id);
        return next;
      });
    }
  };

  // Handle credential dialog submit
  const handleCredentialSubmit = () => {
    if (selectedServerForAuth) {
      handleRegister(selectedServerForAuth, {
        apiKey: apiKey || undefined,
        customName: customName || undefined,
      });
    }
  };

  // Get unique auth types from servers
  const authTypes = useMemo(() => {
    const types = new Set(servers.map(s => s.auth_type));
    return Array.from(types).sort();
  }, [servers]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="MCP Server Catalog"
        description="Browse and add common MCP servers to your Context Forge"
        theme={theme}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search servers, providers, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(prov => (
                  <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAuthType} onValueChange={setSelectedAuthType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Auth Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Auth Types</SelectItem>
                {authTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showRegisteredOnly ? "default" : "outline"}
              onClick={() => setShowRegisteredOnly(!showRegisteredOnly)}
            >
              <Filter size={16} className="mr-2" />
              {showRegisteredOnly ? 'Showing Registered' : 'Show All'}
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span>Loading catalog...</span>
          </div>
        )}

        {/* Server grid */}
        {!isLoading && (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredServers.length} of {servers.length} servers
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServers.map(server => (
                <Card key={server.id} className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {server.logo_url && (
                            <img 
                              src={server.logo_url} 
                              alt={server.name}
                              className="w-6 h-6 rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          {server.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {server.provider}
                        </CardDescription>
                      </div>
                      {server.is_registered && (
                        <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                      {server.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{server.category}</Badge>
                        <Badge variant="outline">{server.auth_type}</Badge>
                      </div>

                      {server.tags && server.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {server.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {server.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{server.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {server.transport && (
                        <div className="text-xs text-gray-500">
                          Transport: {server.transport}
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    {server.is_registered ? (
                      <Button variant="outline" disabled className="flex-1">
                        <CheckCircle2 size={16} className="mr-2" />
                        Registered
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRegisterClick(server)}
                        disabled={registeringIds.has(server.id)}
                        className="flex-1"
                      >
                        {registeringIds.has(server.id) ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            {requiresAuth(server) ? (
                              <Key size={16} className="mr-2" />
                            ) : (
                              <Plus size={16} className="mr-2" />
                            )}
                            Add Server
                          </>
                        )}
                      </Button>
                    )}

                    {server.documentation_url && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(server.documentation_url!, '_blank')}
                      >
                        <ExternalLink size={16} />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredServers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No servers found matching your filters.
              </div>
            )}
          </>
        )}

        {/* Credential Collection Dialog */}
        <Dialog open={showCredentialDialog} onOpenChange={setShowCredentialDialog}>
          <DialogContent className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
            <DialogHeader>
              <DialogTitle>Configure {selectedServerForAuth?.name}</DialogTitle>
              <DialogDescription>
                This server requires authentication. Please provide the necessary credentials.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="custom-name">Server Name (Optional)</Label>
                <Input
                  id="custom-name"
                  placeholder={selectedServerForAuth?.name}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Customize the name for this server instance
                </p>
              </div>

              {selectedServerForAuth?.requires_api_key && (
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key *</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    {selectedServerForAuth.documentation_url ? (
                      <>
                        Get your API key from{' '}
                        <a
                          href={selectedServerForAuth.documentation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {selectedServerForAuth.provider}'s documentation
                        </a>
                      </>
                    ) : (
                      `Get your API key from ${selectedServerForAuth.provider}`
                    )}
                  </p>
                </div>
              )}

              {selectedServerForAuth?.auth_type?.toLowerCase().includes('oauth') && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    OAuth authentication will be configured after registration.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCredentialDialog(false);
                  setSelectedServerForAuth(null);
                  setApiKey('');
                  setCustomName('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCredentialSubmit}
                disabled={selectedServerForAuth?.requires_api_key && !apiKey}
              >
                Register Server
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Made with Bob
