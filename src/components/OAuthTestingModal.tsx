import { useState } from 'react';
import { X, ExternalLink, CheckCircle, XCircle, Loader2, Copy } from 'lucide-react';
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
}

type TestStep = 'idle' | 'authorization' | 'token-exchange' | 'testing' | 'success' | 'error';

export function OAuthTestingModal({ isOpen, onClose, agent, theme }: OAuthTestingModalProps) {
  const [currentStep, setCurrentStep] = useState<TestStep>('idle');
  const [authorizationUrl, setAuthorizationUrl] = useState<string>('');
  const [authCode, setAuthCode] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [tokenResponse, setTokenResponse] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const oauthConfig = agent.oauthConfig;
  const isAuthorizationCode = oauthConfig?.grant_type === 'authorization_code';
  const isClientCredentials = oauthConfig?.grant_type === 'client_credentials';

  const handleStartAuthorizationFlow = async () => {
    try {
      setCurrentStep('authorization');
      setError('');
      
      // Get authorization URL from backend
      const url = await api.getOAuthAuthorizationUrl({
        ...oauthConfig,
        redirect_uri: 'http://localhost:3000/oauth/callback'
      });
      
      setAuthorizationUrl(url);
      
      // Open in external browser (using shell.openExternal)
      if (window.electronAPI) {
        // We'll need to add this to the IPC API
        window.open(url, '_blank');
      }
      
      toast.info('Authorization URL opened in browser');
    } catch (err) {
      setError((err as Error).message);
      setCurrentStep('error');
      toast.error('Failed to start OAuth flow: ' + (err as Error).message);
    }
  };

  const handleExchangeCode = async () => {
    if (!authCode.trim()) {
      toast.error('Please enter the authorization code');
      return;
    }

    try {
      setCurrentStep('token-exchange');
      setError('');
      
      // Exchange code for token
      const response = await api.exchangeOAuthCode(authCode, {
        ...oauthConfig,
        redirect_uri: 'http://localhost:3000/oauth/callback'
      });
      
      setTokenResponse(response);
      setAccessToken(response.access_token);
      setCurrentStep('testing');
      
      // Automatically test the connection
      await testConnection(response.access_token);
    } catch (err) {
      setError((err as Error).message);
      setCurrentStep('error');
      toast.error('Failed to exchange code: ' + (err as Error).message);
    }
  };

  const handleClientCredentialsFlow = async () => {
    try {
      setCurrentStep('token-exchange');
      setError('');
      
      // For client credentials, we can directly get the token
      const response = await api.getClientCredentialsToken(oauthConfig);
      
      setTokenResponse(response);
      setAccessToken(response.access_token);
      setCurrentStep('testing');
      
      // Automatically test the connection
      await testConnection(response.access_token);
    } catch (err) {
      setError((err as Error).message);
      setCurrentStep('error');
      toast.error('Failed to get token: ' + (err as Error).message);
    }
  };

  const testConnection = async (token: string) => {
    try {
      setCurrentStep('testing');
      
      // Test the agent connection with the token
      const result = await api.testAgentConnection(agent.endpointUrl, token);
      
      setTestResult(result);
      setCurrentStep('success');
      toast.success('OAuth flow completed successfully!');
    } catch (err) {
      setError((err as Error).message);
      setCurrentStep('error');
      toast.error('Connection test failed: ' + (err as Error).message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleReset = () => {
    setCurrentStep('idle');
    setAuthorizationUrl('');
    setAuthCode('');
    setAccessToken('');
    setTokenResponse(null);
    setTestResult(null);
    setError('');
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
            {['Authorization', 'Token Exchange', 'Testing', 'Complete'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index < ['idle', 'authorization', 'token-exchange', 'testing', 'success'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : index === ['idle', 'authorization', 'token-exchange', 'testing', 'success'].indexOf(currentStep)
                    ? 'bg-blue-500 text-white'
                    : theme === 'dark' ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-300 text-gray-600'
                }`}>
                  {index < ['idle', 'authorization', 'token-exchange', 'testing', 'success'].indexOf(currentStep) ? (
                    <CheckCircle size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  index <= ['idle', 'authorization', 'token-exchange', 'testing', 'success'].indexOf(currentStep)
                    ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                    : theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < ['idle', 'authorization', 'token-exchange', 'testing', 'success'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Authorization (for Authorization Code flow) */}
          {isAuthorizationCode && currentStep === 'idle' && (
            <div className="space-y-4">
              <p className={theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}>
                Click the button below to start the OAuth Authorization Code flow. This will open the authorization URL in your browser.
              </p>
              <Button
                onClick={handleStartAuthorizationFlow}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <ExternalLink size={16} className="mr-2" />
                Start Authorization Flow
              </Button>
            </div>
          )}

          {/* Step 2: Enter Authorization Code */}
          {isAuthorizationCode && currentStep === 'authorization' && (
            <div className="space-y-4">
              {authorizationUrl && (
                <div className={`p-3 rounded ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Authorization URL:</span>
                    <button
                      onClick={() => copyToClipboard(authorizationUrl)}
                      className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'}`}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-xs break-all">{authorizationUrl}</p>
                </div>
              )}
              
              <div>
                <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                  Authorization Code
                </label>
                <input
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Paste the authorization code here"
                  className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              
              <Button
                onClick={handleExchangeCode}
                disabled={!authCode.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                Exchange Code for Token
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
