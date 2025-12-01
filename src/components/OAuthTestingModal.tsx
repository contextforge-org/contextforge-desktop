import { useState, useEffect, useRef } from 'react';
import { ExternalLink, CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { A2AAgent } from '../types/agent';
import * as api from '../lib/api/contextforge-api-ipc';
import { toast } from '../lib/toastWithTray';

interface OAuthTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: A2AAgent;
  theme: 'light' | 'dark';
  /** Gateway ID is required for Authorization Code flow */
  gatewayId?: string;
}

type TestStep = 'idle' | 'authorization' | 'polling' | 'token-exchange' | 'testing' | 'success' | 'error';

export function OAuthTestingModal({ isOpen, onClose, agent, theme, gatewayId }: OAuthTestingModalProps) {
  const [currentStep, setCurrentStep] = useState<TestStep>('idle');
  const [tokenResponse, setTokenResponse] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const oauthConfig = agent.oauthConfig;
  const isAuthorizationCode = oauthConfig?.grant_type === 'authorization_code';
  const isClientCredentials = oauthConfig?.grant_type === 'client_credentials';

  // Cleanup polling on unmount or close
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // Reset polling when modal closes
  useEffect(() => {
    if (!isOpen && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [isOpen]);

  const handleStartAuthorizationFlow = async () => {
    if (!gatewayId) {
      toast.error('Gateway ID is required for Authorization Code flow');
      return;
    }

    try {
      setCurrentStep('authorization');
      setError('');
      
      // Initiate OAuth flow via backend - this returns the authorization URL
      const response = await api.initiateOAuthFlow(gatewayId);
      
      if (response.authorization_url) {
        // Open in external browser
        window.open(response.authorization_url, '_blank');
        toast.info('Authorization page opened in browser. Complete the flow there.');
        
        // Start polling for OAuth status
        setCurrentStep('polling');
        startPolling();
      } else {
        throw new Error('No authorization URL returned from server');
      }
    } catch (err) {
      setError((err as Error).message);
      setCurrentStep('error');
      toast.error('Failed to start OAuth flow: ' + (err as Error).message);
    }
  };

  const startPolling = () => {
    if (!gatewayId) return;

    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    let pollCount = 0;
    const maxPolls = 60; // 5 minutes with 5 second interval

    pollingIntervalRef.current = setInterval(async () => {
      pollCount++;
      
      if (pollCount > maxPolls) {
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setError('OAuth flow timed out. Please try again.');
        setCurrentStep('error');
        return;
      }

      try {
        const status = await api.getOAuthStatus(gatewayId);
        
        if (status.authenticated) {
          // OAuth complete!
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
          
          setTokenResponse({
            authenticated: true,
            token_type: status.token_type,
            expires_at: status.expires_at,
          });
          setCurrentStep('testing');
          
          // Test the connection with the stored token
          await testConnection();
        }
      } catch (err) {
        console.error('OAuth status poll error:', err);
        // Continue polling unless it's a fatal error
      }
    }, 5000);
  };

  const handleClientCredentialsFlow = async () => {
    try {
      setCurrentStep('token-exchange');
      setError('');
      
      // For client credentials, we can directly get the token
      const response = await api.getClientCredentialsToken(oauthConfig);
      
      setTokenResponse(response);
      setCurrentStep('testing');
      
      // Test the connection with the token
      await testConnection(response.access_token);
    } catch (err) {
      setError((err as Error).message);
      setCurrentStep('error');
      toast.error('Failed to get token: ' + (err as Error).message);
    }
  };

  const testConnection = async (token?: string) => {
    try {
      setCurrentStep('testing');
      
      // If no token provided, the backend should use the stored OAuth token for the gateway
      const result = await api.testAgentConnection(agent.endpointUrl, token || '');
      
      setTestResult(result);
      setCurrentStep('success');
      toast.success('OAuth flow completed successfully!');
    } catch (err) {
      setError((err as Error).message);
      setCurrentStep('error');
      toast.error('Connection test failed: ' + (err as Error).message);
    }
  };

  const handleReset = () => {
    setCurrentStep('idle');
    setTokenResponse(null);
    setTestResult(null);
    setError('');
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>OAuth 2.0 Testing - {agent.name}</span>
            <button
              onClick={onClose}
              className={`p-1 rounded hover:bg-opacity-10 ${theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'}`}
            >
              <X size={20} />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* OAuth Configuration Summary */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
            <h3 className="font-semibold mb-2">Configuration</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Grant Type:</span> {oauthConfig?.grant_type}</p>
              <p><span className="font-medium">Client ID:</span> {oauthConfig?.client_id}</p>
              {isAuthorizationCode && (
                <>
                  <p><span className="font-medium">Auth URL:</span> {oauthConfig?.auth_url}</p>
                  <p><span className="font-medium">Token URL:</span> {oauthConfig?.token_url}</p>
                </>
              )}
              {oauthConfig?.scopes && oauthConfig.scopes.length > 0 && (
                <p><span className="font-medium">Scopes:</span> {oauthConfig.scopes.join(', ')}</p>
              )}
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {['Authorization', 'Waiting', 'Testing', 'Complete'].map((step, index) => {
              const stepStates = ['idle', 'authorization', 'polling', 'token-exchange', 'testing', 'success'];
              const currentIndex = stepStates.indexOf(currentStep);
              // Map step index to state index for comparison
              const stepToStateIndex = [0, 1, 3, 5]; // idle, authorization, testing, success
              
              return (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  stepToStateIndex[index] < currentIndex
                    ? 'bg-green-500 text-white'
                    : stepToStateIndex[index] === currentIndex || (index === 1 && currentStep === 'polling')
                    ? 'bg-blue-500 text-white'
                    : theme === 'dark' ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepToStateIndex[index] < currentIndex ? (
                    <CheckCircle size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  stepToStateIndex[index] <= currentIndex || (index === 1 && currentStep === 'polling')
                    ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                    : theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    stepToStateIndex[index] < currentIndex
                      ? 'bg-green-500'
                      : theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'
                  }`} />
                )}
              </div>
              );
            })}
          </div>

          {/* Step 1: Authorization (for Authorization Code flow) */}
          {isAuthorizationCode && currentStep === 'idle' && (
            <div className="space-y-4">
              {!gatewayId && (
                <div className={`p-3 rounded ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                  <p className="text-sm text-yellow-600">
                    Authorization Code flow requires a gateway ID. Please configure OAuth on a gateway first.
                  </p>
                </div>
              )}
              <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>
                Click the button below to start the OAuth Authorization Code flow. This will open the authorization URL in your browser.
              </p>
              <Button
                onClick={handleStartAuthorizationFlow}
                disabled={!gatewayId}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                <ExternalLink size={16} className="mr-2" />
                Start Authorization Flow
              </Button>
            </div>
          )}

          {/* Step 2: Waiting for OAuth completion (polling) */}
          {isAuthorizationCode && (currentStep === 'authorization' || currentStep === 'polling') && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className={`text-center ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Waiting for OAuth authorization to complete...
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Complete the authorization in your browser. This page will update automatically.
                </p>
              </div>
              <Button
                onClick={handleReset}
                className="w-full"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Client Credentials Flow */}
          {isClientCredentials && currentStep === 'idle' && (
            <div className="space-y-4">
              <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>
                Click the button below to obtain an access token using the Client Credentials flow.
              </p>
              <Button
                onClick={handleClientCredentialsFlow}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Get Access Token
              </Button>
            </div>
          )}

          {/* Loading State */}
          {(currentStep === 'token-exchange' || currentStep === 'testing') && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>
                {currentStep === 'token-exchange' ? 'Exchanging code for token...' : 'Testing connection...'}
              </p>
            </div>
          )}

          {/* Success State */}
          {currentStep === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <CheckCircle size={64} className="text-green-500" />
              </div>
              
              {tokenResponse && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-2">Token Response</h3>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(tokenResponse, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResult && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-2">Connection Test Result</h3>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
              
              <Button
                onClick={handleReset}
                className="w-full"
                variant="outline"
              >
                Test Again
              </Button>
            </div>
          )}

          {/* Error State */}
          {currentStep === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <XCircle size={64} className="text-red-500" />
              </div>
              
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                <h3 className="font-semibold mb-2 text-red-500">Error</h3>
                <p className="text-sm">{error}</p>
              </div>
              
              <Button
                onClick={handleReset}
                className="w-full"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
