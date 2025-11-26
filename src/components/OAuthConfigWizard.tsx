import { useState } from 'react';
import { X, CheckCircle, ArrowRight, ArrowLeft, Loader2, Copy, ExternalLink, Wand2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import * as api from '../lib/api/contextforge-api-ipc';
import { toast } from '../lib/toastWithTray';

interface OAuthConfigWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: OAuthConfig) => void;
  theme: 'light' | 'dark';
  initialConfig?: Partial<OAuthConfig>;
}

interface OAuthConfig {
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

type WizardStep = 'grant-type' | 'credentials' | 'urls' | 'scopes' | 'test' | 'complete';

export function OAuthConfigWizard({ isOpen, onClose, onComplete, theme, initialConfig }: OAuthConfigWizardProps) {
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
  const [authCode, setAuthCode] = useState('');
  const [authorizationUrl, setAuthorizationUrl] = useState('');

  const isAuthorizationCode = config.grant_type === 'authorization_code';
  const isClientCredentials = config.grant_type === 'client_credentials';

  const updateConfig = (updates: Partial<OAuthConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
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
      case 'test':
        return !!testResult;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const steps: WizardStep[] = ['grant-type', 'credentials', 'urls', 'scopes', 'test', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (nextStep) setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    const steps: WizardStep[] = ['grant-type', 'credentials', 'urls', 'scopes', 'test', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      if (prevStep) setCurrentStep(prevStep);
    }
  };

  const handleTestOAuth = async () => {
    setTesting(true);
    setTestError('');
    setTestResult(null);

    try {
      if (isClientCredentials) {
        // Client Credentials flow
        const response = await api.getClientCredentialsToken(config);
        setTestResult(response);
        updateConfig({
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          token_expires_at: response.expires_in 
            ? new Date(Date.now() + response.expires_in * 1000).toISOString()
            : undefined,
        });
        toast.success('OAuth configuration successful!');
        setCurrentStep('complete');
      } else {
        // Authorization Code flow - start authorization
        const url = await api.getOAuthAuthorizationUrl({
          ...config,
          redirect_uri: 'http://localhost:3000/oauth/callback'
        });
        setAuthorizationUrl(url);
        window.open(url, '_blank');
        toast.info('Authorization URL opened in browser');
      }
    } catch (err) {
      setTestError((err as Error).message);
      toast.error('OAuth test failed: ' + (err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  const handleExchangeCode = async () => {
    if (!authCode.trim()) {
      toast.error('Please enter the authorization code');
      return;
    }

    setTesting(true);
    setTestError('');

    try {
      const response = await api.exchangeOAuthCode(authCode, {
        ...config,
        redirect_uri: 'http://localhost:3000/oauth/callback'
      });
      
      setTestResult(response);
      updateConfig({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_expires_at: response.expires_in 
          ? new Date(Date.now() + response.expires_in * 1000).toISOString()
          : undefined,
      });
      toast.success('OAuth configuration successful!');
      setCurrentStep('complete');
    } catch (err) {
      setTestError((err as Error).message);
      toast.error('Token exchange failed: ' + (err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  const handleComplete = () => {
    if (config.grant_type && config.client_id && config.client_secret && config.token_url) {
      onComplete(config as OAuthConfig);
      onClose();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 size={20} />
            OAuth Configuration Wizard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs">
            {['Grant Type', 'Credentials', 'URLs', 'Scopes', 'Test', 'Complete'].map((label, index) => {
              const steps: WizardStep[] = ['grant-type', 'credentials', 'urls', 'scopes', 'test', 'complete'];
              const stepIndex = steps.indexOf(currentStep);
              const isActive = index === stepIndex;
              const isComplete = index < stepIndex;
              
              return (
                <div key={label} className="flex items-center">
                  <div className={`flex flex-col items-center ${index > 0 ? 'ml-2' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-500 text-white' :
                      theme === 'dark' ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isComplete ? <CheckCircle size={16} /> : index + 1}
                    </div>
                    <span className={`mt-1 text-center ${
                      isActive ? theme === 'dark' ? 'text-white' : 'text-gray-900' :
                      theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {index < 5 && (
                    <div className={`w-8 h-0.5 ${
                      isComplete ? 'bg-green-500' : theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className={`min-h-[300px] p-6 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-50'}`}>
            {/* Step 1: Grant Type */}
            {currentStep === 'grant-type' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select OAuth Grant Type</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Choose the OAuth 2.0 flow that matches your API provider's requirements.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => updateConfig({ grant_type: 'client_credentials' })}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      config.grant_type === 'client_credentials'
                        ? 'border-blue-500 bg-blue-500/10'
                        : theme === 'dark' ? 'border-zinc-700 hover:border-zinc-600' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <h4 className="font-semibold mb-2">Client Credentials</h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      Machine-to-machine authentication. No user interaction required.
                    </p>
                  </button>
                  
                  <button
                    onClick={() => updateConfig({ grant_type: 'authorization_code' })}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      config.grant_type === 'authorization_code'
                        ? 'border-blue-500 bg-blue-500/10'
                        : theme === 'dark' ? 'border-zinc-700 hover:border-zinc-600' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <h4 className="font-semibold mb-2">Authorization Code</h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                      User authorization required. More secure for user-specific access.
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
                    <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                      Client ID *
                    </label>
                    <input
                      type="text"
                      value={config.client_id}
                      onChange={(e) => updateConfig({ client_id: e.target.value })}
                      placeholder="Enter your OAuth client ID"
                      className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                      Client Secret *
                    </label>
                    <input
                      type="password"
                      value={config.client_secret}
                      onChange={(e) => updateConfig({ client_secret: e.target.value })}
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
                      <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                        Authorization URL *
                      </label>
                      <input
                        type="text"
                        value={config.auth_url}
                        onChange={(e) => updateConfig({ auth_url: e.target.value })}
                        placeholder="https://provider.com/oauth/authorize"
                        className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                      Token URL *
                    </label>
                    <input
                      type="text"
                      value={config.token_url}
                      onChange={(e) => updateConfig({ token_url: e.target.value })}
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
                  <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                    Scopes (optional)
                  </label>
                  <input
                    type="text"
                    value={config.scopes?.join(' ') || ''}
                    onChange={(e) => updateConfig({ scopes: e.target.value.split(' ').filter(s => s) })}
                    placeholder="read write admin"
                    className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                    Enter space-separated scope names (e.g., "read write admin")
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Test */}
            {currentStep === 'test' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test OAuth Configuration</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                  Let's verify your OAuth configuration works correctly.
                </p>
                
                {!testResult && !authorizationUrl && (
                  <div className="mt-6">
                    <Button
                      onClick={handleTestOAuth}
                      disabled={testing}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {testing ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Testing...
                        </>
                      ) : (
                        <>
                          <ExternalLink size={16} className="mr-2" />
                          {isClientCredentials ? 'Get Access Token' : 'Start Authorization'}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {authorizationUrl && !testResult && (
                  <div className="space-y-4 mt-6">
                    <div className={`p-3 rounded ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Authorization URL:</span>
                        <button
                          onClick={() => copyToClipboard(authorizationUrl)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-200'}`}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <p className="text-xs break-all">{authorizationUrl}</p>
                    </div>
                    
                    <div>
                      <label className={`block mb-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
                        Authorization Code
                      </label>
                      <input
                        type="text"
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                        placeholder="Paste the authorization code here"
                        className={`w-full px-3 py-2 border rounded-md ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    
                    <Button
                      onClick={handleExchangeCode}
                      disabled={!authCode.trim() || testing}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {testing ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Exchanging...
                        </>
                      ) : (
                        'Exchange Code for Token'
                      )}
                    </Button>
                  </div>
                )}

                {testError && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
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
                  Your OAuth configuration has been tested and is ready to use.
                </p>
                
                {testResult && (
                  <div className={`p-4 rounded-lg text-left ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                    <h4 className="font-semibold mb-2">Token Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Access Token:</span> {testResult.access_token?.substring(0, 20)}...</p>
                      {testResult.expires_in && (
                        <p><span className="font-medium">Expires In:</span> {testResult.expires_in} seconds</p>
                      )}
                      {testResult.token_type && (
                        <p><span className="font-medium">Token Type:</span> {testResult.token_type}</p>
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
              <Button
                onClick={handleComplete}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Save Configuration
              </Button>
            ) : currentStep === 'test' ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
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