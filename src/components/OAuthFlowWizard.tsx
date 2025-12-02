import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ExternalLink,
  AlertCircle,
  Shield,
  Key,
  Globe,
  Settings,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import * as api from '../lib/api/contextforge-api-ipc';
import { toast } from '../lib/toastWithTray';

/**
 * Entity type for OAuth configuration
 */
export type OAuthEntityType = 'gateway' | 'agent';

/**
 * OAuth configuration structure
 */
export interface OAuthConfig {
  grant_type: 'authorization_code' | 'client_credentials';
  client_id: string;
  client_secret: string;
  token_url: string;
  auth_url?: string;
  scopes: string[];
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
}

/**
 * Props for the OAuth Flow Wizard
 */
interface OAuthFlowWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: OAuthConfig) => void;
  theme: 'light' | 'dark';
  initialConfig?: Partial<OAuthConfig>;
  /**
   * Entity type - 'gateway' or 'agent'
   */
  entityType: OAuthEntityType;
  /**
   * Entity ID if it exists (for testing OAuth flow)
   * When undefined, wizard works in "configuration-only" mode
   */
  entityId?: string;
  /**
   * Entity name for display purposes
   */
  entityName?: string;
}

type WizardStep = 'grant-type' | 'credentials' | 'urls' | 'scopes' | 'authorize' | 'complete';

/**
 * OAuth Flow Wizard
 * 
 * A unified wizard component for configuring OAuth 2.0 authentication
 * for both MCP Gateways and A2A Agents.
 * 
 * Features:
 * - Works without entity ID (configuration-only mode for new entities)
 * - Supports both Client Credentials and Authorization Code grants
 * - Native OAuth flow with browser authorization when entity exists
 * - Uses generated TypeScript client for API calls
 */
export function OAuthFlowWizard({
  isOpen,
  onClose,
  onComplete,
  theme,
  initialConfig,
  entityType,
  entityId,
  entityName,
}: OAuthFlowWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('grant-type');
  const [config, setConfig] = useState<Partial<OAuthConfig>>({
    grant_type: initialConfig?.grant_type,
    client_id: initialConfig?.client_id || '',
    client_secret: initialConfig?.client_secret || '',
    token_url: initialConfig?.token_url || '',
    auth_url: initialConfig?.auth_url || '',
    scopes: initialConfig?.scopes || [],
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string>('');
  const [pollingForOAuth, setPollingForOAuth] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isAuthorizationCode = config.grant_type === 'authorization_code';
  const isClientCredentials = config.grant_type === 'client_credentials';
  const hasEntityId = !!entityId;

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('grant-type');
      setConfig({
        grant_type: initialConfig?.grant_type,
        client_id: initialConfig?.client_id || '',
        client_secret: initialConfig?.client_secret || '',
        token_url: initialConfig?.token_url || '',
        auth_url: initialConfig?.auth_url || '',
        scopes: initialConfig?.scopes || [],
      });
      setTesting(false);
      setTestResult(null);
      setTestError('');
      setPollingForOAuth(false);
    }
  }, [isOpen, initialConfig]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const updateConfig = useCallback((updates: Partial<OAuthConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 'grant-type':
        return !!config.grant_type;
      case 'credentials':
        return !!config.client_id && !!config.client_secret;
      case 'urls':
        if (isAuthorizationCode) {
          return !!config.token_url && !!config.auth_url;
        }
        return !!config.token_url;
      case 'scopes':
        return true; // Scopes are optional
      case 'authorize':
        // For client credentials, we need test to pass
        // For auth code without entity, we allow skip
        // For auth code with entity, we need authorization
        if (isClientCredentials) {
          return !!testResult;
        }
        if (!hasEntityId) {
          return true; // Can proceed without authorization when no entity
        }
        return !!testResult;
      default:
        return true;
    }
  }, [currentStep, config, isAuthorizationCode, isClientCredentials, hasEntityId, testResult]);

  const getSteps = useCallback((): WizardStep[] => {
    return ['grant-type', 'credentials', 'urls', 'scopes', 'authorize', 'complete'];
  }, []);

  const handleNext = useCallback(() => {
    const steps = getSteps();
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (nextStep) setCurrentStep(nextStep);
    }
  }, [currentStep, getSteps]);

  const handleBack = useCallback(() => {
    const steps = getSteps();
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      if (prevStep) setCurrentStep(prevStep);
    }
  }, [currentStep, getSteps]);

  // Poll for OAuth status when using gateway-based flow
  const startPollingOAuthStatus = useCallback(() => {
    if (!entityId || entityType !== 'gateway') return;

    setPollingForOAuth(true);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await api.getOAuthStatus(entityId);

        if (status.is_authorized || status.access_token) {
          // OAuth complete!
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setPollingForOAuth(false);
          setTestResult(status);
          updateConfig({
            access_token: status.access_token,
            refresh_token: status.refresh_token,
            token_expires_at: status.token_expires_at,
          });
          toast.success('OAuth authorization successful!');
          setCurrentStep('complete');
        }
      } catch (err) {
        console.error('Error polling OAuth status:', err);
      }
    }, 2000); // Poll every 2 seconds
  }, [entityId, entityType, updateConfig]);

  const stopPollingOAuthStatus = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setPollingForOAuth(false);
  }, []);

  const handleTestClientCredentials = useCallback(async () => {
    setTesting(true);
    setTestError('');
    setTestResult(null);

    try {
      const response = await api.getClientCredentialsToken(config);
      setTestResult(response);
      updateConfig({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_expires_at: response.expires_in
          ? new Date(Date.now() + response.expires_in * 1000).toISOString()
          : undefined,
      });
      toast.success('OAuth token obtained successfully!');
      setCurrentStep('complete');
    } catch (err) {
      const errorMsg = (err as Error).message;
      setTestError(errorMsg);
      toast.error('OAuth test failed: ' + errorMsg);
    } finally {
      setTesting(false);
    }
  }, [config, updateConfig]);

  const handleInitiateAuthCodeFlow = useCallback(async () => {
    setTesting(true);
    setTestError('');

    try {
      if (entityType === 'gateway' && entityId) {
        // Use backend-managed OAuth flow for gateways
        const response = await api.initiateOAuthFlow(entityId);
        if (response && response.authorization_url) {
          // Open authorization URL in system browser
          window.open(response.authorization_url, '_blank');
          toast.info('Authorization page opened in browser. Complete the authorization and return here.');
          startPollingOAuthStatus();
        }
      } else {
        // For agents (or new entities without ID), use native OAuth flow
        // This performs the complete OAuth flow with a local callback server
        toast.info('Opening authorization page in browser...');
        
        const result = await api.performNativeOAuthFlow({
          grant_type: 'authorization_code',
          client_id: config.client_id,
          client_secret: config.client_secret,
          auth_url: config.auth_url,
          token_url: config.token_url,
          scopes: config.scopes,
        });
        
        if (result.success) {
          setTestResult(result);
          updateConfig({
            access_token: result.access_token,
            refresh_token: result.refresh_token,
            token_expires_at: result.expires_in
              ? new Date(Date.now() + result.expires_in * 1000).toISOString()
              : undefined,
          });
          toast.success('OAuth authorization successful!');
          setCurrentStep('complete');
        } else {
          throw new Error(result.error || 'OAuth flow failed');
        }
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      setTestError('Failed to initiate OAuth flow: ' + errorMsg);
      toast.error('OAuth flow failed: ' + errorMsg);
    } finally {
      setTesting(false);
    }
  }, [config, entityId, entityType, startPollingOAuthStatus, updateConfig]);

  const handleSkipAuthorization = useCallback(() => {
    // Allow proceeding without authorization
    // Configuration will be saved, but user will need to authorize later
    setTestResult({ skipped: true });
    setCurrentStep('complete');
  }, []);

  const handleComplete = useCallback(() => {
    stopPollingOAuthStatus();
    if (config.grant_type && config.client_id && config.client_secret && config.token_url) {
      // Merge config with any tokens from testResult to ensure we capture tokens
      // even if React state hasn't updated yet
      const finalConfig: OAuthConfig = {
        grant_type: config.grant_type,
        client_id: config.client_id,
        client_secret: config.client_secret,
        token_url: config.token_url,
        auth_url: config.auth_url,
        scopes: config.scopes || [],
        // Prefer testResult tokens (freshest) over config tokens (may be stale)
        access_token: testResult?.access_token || config.access_token,
        refresh_token: testResult?.refresh_token || config.refresh_token,
        token_expires_at: testResult?.expires_in 
          ? new Date(Date.now() + testResult.expires_in * 1000).toISOString()
          : config.token_expires_at,
      };
      
      console.log('[OAuthFlowWizard] handleComplete - finalConfig:', {
        grant_type: finalConfig.grant_type,
        has_access_token: !!finalConfig.access_token,
        has_refresh_token: !!finalConfig.refresh_token,
        testResult_has_token: !!testResult?.access_token,
      });
      
      onComplete(finalConfig);
      onClose();
    }
  }, [config, testResult, onComplete, onClose, stopPollingOAuthStatus]);

  const getStepLabel = (step: WizardStep): string => {
    switch (step) {
      case 'grant-type':
        return 'Grant Type';
      case 'credentials':
        return 'Credentials';
      case 'urls':
        return 'URLs';
      case 'scopes':
        return 'Scopes';
      case 'authorize':
        return isClientCredentials ? 'Test' : 'Authorize';
      case 'complete':
        return 'Complete';
      default:
        return step;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-2xl ${theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={20} />
            OAuth Configuration {entityName && `- ${entityName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs">
            {getSteps().map((step, index) => {
              const steps = getSteps();
              const stepIndex = steps.indexOf(currentStep);
              const isActive = index === stepIndex;
              const isComplete = index < stepIndex;

              return (
                <div key={step} className="flex items-center">
                  <div className={`flex flex-col items-center ${index > 0 ? 'ml-2' : ''}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isComplete
                          ? 'bg-green-500 text-white'
                          : isActive
                            ? 'bg-blue-500 text-white'
                            : theme === 'dark'
                              ? 'bg-zinc-700 text-zinc-400'
                              : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isComplete ? <CheckCircle size={16} /> : index + 1}
                    </div>
                    <span
                      className={`mt-1 text-center ${
                        isActive
                          ? theme === 'dark'
                            ? 'text-white'
                            : 'text-gray-900'
                          : theme === 'dark'
                            ? 'text-zinc-500'
                            : 'text-gray-500'
                      }`}
                    >
                      {getStepLabel(step)}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 ${
                        isComplete ? 'bg-green-500' : theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div
            className={`min-h-[300px] p-6 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-50'}`}
          >
            {/* Step 1: Grant Type */}
            {currentStep === 'grant-type' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select OAuth Grant Type</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Choose the OAuth 2.0 flow that matches your {entityType === 'gateway' ? 'MCP server' : 'agent'}'s requirements.
                </p>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => updateConfig({ grant_type: 'client_credentials' })}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      config.grant_type === 'client_credentials'
                        ? 'border-blue-500 bg-blue-500/10'
                        : theme === 'dark'
                          ? 'border-zinc-700 hover:border-zinc-600'
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Key size={24} className="mb-3 text-blue-500" />
                    <h4 className="font-semibold mb-2">Client Credentials</h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Machine-to-machine authentication. No user interaction required.
                    </p>
                  </button>

                  <button
                    onClick={() => updateConfig({ grant_type: 'authorization_code' })}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      config.grant_type === 'authorization_code'
                        ? 'border-blue-500 bg-blue-500/10'
                        : theme === 'dark'
                          ? 'border-zinc-700 hover:border-zinc-600'
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Globe size={24} className="mb-3 text-purple-500" />
                    <h4 className="font-semibold mb-2">Authorization Code</h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      User authorization via browser. More secure for user-specific access.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Credentials */}
            {currentStep === 'credentials' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Enter OAuth Credentials</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  These credentials are provided by your OAuth provider when you register your application.
                </p>

                <div className="space-y-4 mt-6">
                  <div>
                    <label
                      className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                    >
                      Client ID *
                    </label>
                    <input
                      type="text"
                      value={config.client_id}
                      onChange={e => updateConfig({ client_id: e.target.value })}
                      placeholder="Enter your OAuth client ID"
                      className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                    >
                      Client Secret *
                    </label>
                    <input
                      type="password"
                      value={config.client_secret}
                      onChange={e => updateConfig({ client_secret: e.target.value })}
                      placeholder="Enter your OAuth client secret"
                      className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: URLs */}
            {currentStep === 'urls' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configure OAuth URLs</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Enter the OAuth endpoint URLs from your provider's documentation.
                </p>

                <div className="space-y-4 mt-6">
                  {isAuthorizationCode && (
                    <div>
                      <label
                        className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                      >
                        Authorization URL *
                      </label>
                      <input
                        type="text"
                        value={config.auth_url}
                        onChange={e => updateConfig({ auth_url: e.target.value })}
                        placeholder="https://provider.com/oauth/authorize"
                        className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  )}

                  <div>
                    <label
                      className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                    >
                      Token URL *
                    </label>
                    <input
                      type="text"
                      value={config.token_url}
                      onChange={e => updateConfig({ token_url: e.target.value })}
                      placeholder="https://provider.com/oauth/token"
                      className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Scopes */}
            {currentStep === 'scopes' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configure OAuth Scopes</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Scopes define what permissions your application will request. Leave empty if not required.
                </p>

                <div className="mt-6">
                  <label
                    className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
                  >
                    Scopes (optional)
                  </label>
                  <input
                    type="text"
                    value={config.scopes?.join(' ') || ''}
                    onChange={e => updateConfig({ scopes: e.target.value.split(' ').filter(s => s) })}
                    placeholder="read write admin"
                    className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                    Enter space-separated scope names (e.g., "read write admin")
                  </p>
                </div>

                {/* Common scopes suggestions */}
                <div className="mt-4">
                  <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                    Common scopes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['read', 'write', 'openid', 'profile', 'email', 'offline_access'].map(scope => (
                      <button
                        key={scope}
                        onClick={() => {
                          const currentScopes = config.scopes || [];
                          if (!currentScopes.includes(scope)) {
                            updateConfig({ scopes: [...currentScopes, scope] });
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded ${
                          config.scopes?.includes(scope)
                            ? 'bg-blue-500 text-white'
                            : theme === 'dark'
                              ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Authorize/Test */}
            {currentStep === 'authorize' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {isClientCredentials ? 'Test OAuth Configuration' : 'Authorize Access'}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  {isClientCredentials
                    ? "Let's verify your OAuth configuration by obtaining an access token."
                    : 'Click below to open the authorization page in your browser.'}
                </p>

                {/* Info banner for gateway auth code without entity */}
                {isAuthorizationCode && !hasEntityId && entityType === 'gateway' && (
                  <div
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Gateway Authorization</h4>
                        <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                          The backend-managed gateway OAuth flow requires the gateway to be saved first.
                          You can save the configuration now and authorize later from the gateway settings.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Test/Authorize buttons */}
                {!testResult && !pollingForOAuth && (
                  <div className="space-y-3 mt-6">
                    {isClientCredentials && (
                      <Button
                        onClick={handleTestClientCredentials}
                        disabled={testing}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {testing ? (
                          <>
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Getting Token...
                          </>
                        ) : (
                          <>
                            <Key size={16} className="mr-2" />
                            Get Access Token
                          </>
                        )}
                      </Button>
                    )}

                    {/* For gateways with entity ID, use backend-managed OAuth */}
                    {isAuthorizationCode && hasEntityId && entityType === 'gateway' && (
                      <Button
                        onClick={handleInitiateAuthCodeFlow}
                        disabled={testing}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {testing ? (
                          <>
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Starting Authorization...
                          </>
                        ) : (
                          <>
                            <ExternalLink size={16} className="mr-2" />
                            Authorize in Browser
                          </>
                        )}
                      </Button>
                    )}

                    {/* For agents (any), use native OAuth flow */}
                    {isAuthorizationCode && entityType === 'agent' && (
                      <Button
                        onClick={handleInitiateAuthCodeFlow}
                        disabled={testing}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {testing ? (
                          <>
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Authorizing...
                          </>
                        ) : (
                          <>
                            <ExternalLink size={16} className="mr-2" />
                            Authorize in Browser
                          </>
                        )}
                      </Button>
                    )}

                    {/* For gateways without entity ID, show skip option */}
                    {isAuthorizationCode && !hasEntityId && entityType === 'gateway' && (
                      <Button
                        onClick={handleSkipAuthorization}
                        variant="outline"
                        className="w-full"
                      >
                        <Settings size={16} className="mr-2" />
                        Save Configuration & Authorize Later
                      </Button>
                    )}
                  </div>
                )}

                {/* Polling indicator */}
                {pollingForOAuth && !testResult && (
                  <div className="space-y-4 mt-6">
                    <div
                      className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin" size={20} />
                        <div>
                          <p className="text-sm font-medium">Waiting for authorization...</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                            Complete the authorization in your browser, then return here.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button onClick={stopPollingOAuthStatus} variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Error display */}
                {testError && (
                  <div
                    className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}
                  >
                    <p className="text-sm text-red-500">{testError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Complete */}
            {currentStep === 'complete' && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle size={64} className="text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Configuration Complete!</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  {testResult?.skipped
                    ? `Your OAuth configuration has been saved. Remember to authorize access after saving the ${entityType}.`
                    : 'Your OAuth configuration has been tested and is ready to use.'}
                </p>

                {testResult && !testResult.skipped && testResult.access_token && (
                  <div
                    className={`p-4 rounded-lg text-left ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}
                  >
                    <h4 className="font-semibold mb-2">Token Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Access Token:</span>{' '}
                        {testResult.access_token?.substring(0, 20)}...
                      </p>
                      {testResult.expires_in && (
                        <p>
                          <span className="font-medium">Expires In:</span> {testResult.expires_in} seconds
                        </p>
                      )}
                      {testResult.token_type && (
                        <p>
                          <span className="font-medium">Token Type:</span> {testResult.token_type}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Configuration summary for skipped auth */}
                {testResult?.skipped && (
                  <div
                    className={`p-4 rounded-lg text-left ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}
                  >
                    <h4 className="font-semibold mb-2">Configuration Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Grant Type:</span>{' '}
                        {config.grant_type === 'authorization_code'
                          ? 'Authorization Code'
                          : 'Client Credentials'}
                      </p>
                      <p>
                        <span className="font-medium">Client ID:</span> {config.client_id}
                      </p>
                      {config.scopes && config.scopes.length > 0 && (
                        <p>
                          <span className="font-medium">Scopes:</span> {config.scopes.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={handleBack}
              disabled={currentStep === 'grant-type' || currentStep === 'complete'}
              variant="outline"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>

            {currentStep === 'complete' ? (
              <Button onClick={handleComplete} className="bg-green-500 hover:bg-green-600 text-white">
                Save Configuration
              </Button>
            ) : currentStep === 'authorize' && isAuthorizationCode && !hasEntityId ? (
              <Button
                onClick={handleSkipAuthorization}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Continue
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OAuthFlowWizard;
