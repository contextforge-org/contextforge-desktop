import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch and handle React errors gracefully.
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 * 
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Store error info in state
    this.setState({
      errorInfo,
    });

    // TODO: Log to error monitoring service (e.g., Sentry, LogRocket)
    // Example:
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 p-4">
          <div className="max-w-2xl w-full bg-zinc-800 rounded-lg shadow-2xl border border-zinc-700 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Something went wrong
                </h1>
                <p className="text-zinc-400 mt-1">
                  The application encountered an unexpected error
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6">
                <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
                  <p className="text-sm font-mono text-red-400 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {import.meta.env.DEV && this.state.errorInfo && (
                    <details className="mt-4">
                      <summary className="text-sm text-zinc-400 cursor-pointer hover:text-zinc-300">
                        Stack trace
                      </summary>
                      <pre className="mt-2 text-xs text-zinc-500 overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex items-center gap-2 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
              >
                <Home className="w-4 h-4" />
                Reload App
              </Button>
            </div>

            {import.meta.env.DEV && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  <strong>Development Mode:</strong> This error boundary is showing
                  detailed error information. In production, users will see a
                  simplified error message.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components.
 * Note: This is a wrapper around the class-based ErrorBoundary.
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
