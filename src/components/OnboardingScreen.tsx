/**
 * Onboarding Screen Component
 * Displays loading state while backend starts up
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Loader2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import type { BackendStatus } from '../hooks/useBackendStatus';

interface OnboardingScreenProps {
  status: BackendStatus;
  mode?: 'embedded' | 'external';
  defaultProfile?: string;
}

const TIPS = [
  "Use profiles to manage multiple environments and accounts",
  "Organize servers with tags for easy filtering",
  "Test MCP tools directly from the Tools page",
  "Monitor performance metrics in real-time",
  "Create custom prompts for your AI workflows",
  "Virtual servers let you group related MCP servers",
];

export function OnboardingScreen({ status, mode = 'embedded', defaultProfile }: OnboardingScreenProps) {
  const { theme } = useTheme();
  const [currentTip, setCurrentTip] = useState(0);

  // Rotate tips every 5 seconds during connecting state
  useEffect(() => {
    if (status.state === 'connecting') {
      const interval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % TIPS.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [status.state]);

  const getStatusIcon = () => {
    switch (status.state) {
      case 'connecting':
        return <Loader2 className="h-16 w-16 animate-spin text-cyan-500" />;
      case 'ready':
        return <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-500" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-500" />;
      case 'timeout':
        return <Clock className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    if (mode === 'external') {
      if (status.state === 'connecting') {
        return defaultProfile ? `Connecting to ${defaultProfile}...` : "Connecting to backend...";
      }
      if (status.state === 'ready') {
        return "All set!";
      }
      if (status.state === 'error') {
        return "Connection Failed";
      }
      if (status.state === 'timeout') {
        return "Connection Timeout";
      }
    }

    // Embedded mode messages
    switch (status.state) {
      case 'connecting':
        if (status.attempts < 5) return "Starting backend...";
        if (status.attempts < 15) return "Connecting to server...";
        if (status.attempts < 30) return "Loading your profile...";
        return "Almost ready...";
      case 'ready':
        return "All set!";
      case 'error':
        return "Connection Failed";
      case 'timeout':
        return "Connection Timeout";
    }
  };

  const getStatusDetails = () => {
    switch (status.state) {
      case 'error':
        return status.error || "Unable to connect to the backend server";
      case 'timeout':
        return "The backend is taking longer than expected to start";
      default:
        return null;
    }
  };

  return (
    <div className={`h-screen w-screen flex items-center justify-center ${
      theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'
    }`}>
      <div className="flex flex-col items-center justify-center max-w-md px-8 space-y-8">
        {/* Logo - matching TopNav */}
        <div className="flex items-center gap-3">
          <div className="h-[48px] relative shrink-0 w-[48px]">
            <img
              src={theme === 'dark' ? '/assets/icons/contextforge-icon_white_512.png' : '/assets/icons/contextforge-icon_black_512.png'}
              alt="Context Forge"
              className="block size-full object-contain"
            />
          </div>
          <h1 className={`font-['Inter',sans-serif] font-semibold text-2xl ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Context Forge
          </h1>
        </div>

        {/* Status Icon */}
        <div className="flex items-center justify-center">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <div className="text-center space-y-2">
          <h2 className={`text-xl font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {getStatusMessage()}
          </h2>
          
          {getStatusDetails() && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'
            }`}>
              {getStatusDetails()}
            </p>
          )}
        </div>

        {/* Loading Spinner (instead of attempt counter) */}
        {status.state === 'connecting' && (
          <div className="flex items-center gap-2">
            <Loader2 className={`h-4 w-4 animate-spin ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
            }`} />
            <span className={`text-sm ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
            }`}>
              Connecting...
            </span>
          </div>
        )}

        {/* Tips (only during connecting in embedded mode) */}
        {status.state === 'connecting' && mode === 'embedded' && (
          <div className={`text-center text-sm ${
            theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
          } animate-in fade-in duration-300`}>
            <p className="flex items-center justify-center gap-2">
              <span>💡</span>
              <span>{TIPS[currentTip]}</span>
            </p>
          </div>
        )}

        {/* Error Actions */}
        {(status.state === 'error' || status.state === 'timeout') && (
          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={status.retry}
              className="w-full"
              size="lg"
            >
              Try Again
            </Button>
            
            {status.state === 'timeout' && (
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => {
                  // TODO: Open diagnostics panel or show more details
                  console.log('View diagnostics clicked');
                }}
              >
                View Details
              </Button>
            )}
          </div>
        )}

        {/* Additional error details for timeout */}
        {status.state === 'timeout' && (
          <div className={`text-xs text-left w-full p-4 rounded-lg ${
            theme === 'dark' ? 'bg-zinc-900 text-zinc-400' : 'bg-gray-100 text-gray-600'
          }`}>
            <p className="font-medium mb-2">This might indicate:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Port 4444 is already in use</li>
              <li>Backend executable is missing</li>
              <li>System resources are limited</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}