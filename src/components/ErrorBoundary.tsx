'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Check if it's a chunk loading error
        if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
            console.log('Chunk loading error detected, attempting recovery...');
            // Attempt to reload the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }

        this.setState({
            error,
            errorInfo,
        });
    }

    retry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error!} retry={this.retry} />;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                    <div className="glass-card p-8 max-w-md mx-4 text-center">
                        <div className="text-red-400 mb-4 flex justify-center">
                            <AlertTriangle className="w-12 h-12" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-4">
                            Something went wrong
                        </h2>
                        <p className="text-white/70 mb-6 text-sm">
                            {this.state.error?.name === 'ChunkLoadError' ||
                                this.state.error?.message.includes('Loading chunk')
                                ? 'A network error occurred while loading the application. The page will reload automatically.'
                                : 'An unexpected error occurred. Please try refreshing the page.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="glass-button px-6 py-3 flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Page
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-4 text-left">
                                <summary className="text-white/50 text-xs cursor-pointer">
                                    Error Details (Development)
                                </summary>
                                <pre className="text-red-300 text-xs mt-2 overflow-auto max-h-32 bg-black/20 p-2 rounded">
                                    {this.state.error?.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 