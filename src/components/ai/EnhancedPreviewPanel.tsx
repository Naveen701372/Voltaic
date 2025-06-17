'use client';

import React, { useState, useEffect } from 'react';
import {
    Code,
    Eye,
    ExternalLink,
    Play,
    RefreshCw,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Power,
    Timer,
    Monitor,
    Zap,
    Maximize2
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/glass';
import { AppProject, GeneratedFile } from './types';
import { usePreviewManager } from '@/hooks/usePreviewManager';
// Removed path import - not needed in client-side components

interface EnhancedPreviewPanelProps {
    currentProject: AppProject | null;
    activeTab: 'chat' | 'code' | 'preview';
    setActiveTab: (tab: 'chat' | 'code' | 'preview') => void;
    showSuggestions?: boolean;
    onSuggestionClick?: (suggestion: string) => void;
}

export function EnhancedPreviewPanel({
    currentProject,
    activeTab,
    setActiveTab,
    showSuggestions = false,
    onSuggestionClick
}: EnhancedPreviewPanelProps) {
    const [previewMode, setPreviewMode] = useState<'template' | 'live'>('live'); // Default to live mode
    const [buildAttempts, setBuildAttempts] = useState(0);

    const {
        status,
        isLoading,
        error,
        needsRelaunch,
        isRunning,
        isStarting,
        previewUrl,
        buildAndStart,
        startPreview,
        stopPreview,
        keepAlive
    } = usePreviewManager(currentProject?.id);

    const suggestions = [
        "A task management app with team collaboration",
        "An e-commerce platform for handmade crafts",
        "A fitness tracking app with social features",
        "A recipe sharing platform with meal planning"
    ];

    // Handle live preview launch
    const handleLivePreview = async () => {
        if (!currentProject) return;

        setBuildAttempts(prev => prev + 1);
        setPreviewMode('live');

        const result = await buildAndStart(
            currentProject.files,
            currentProject.name,
            'build'
        );

        if (!result || !result.success) {
            console.warn('Live preview failed, falling back to template mode');
            setPreviewMode('template');
        }
    };

    // Handle relaunch
    const handleRelaunch = async () => {
        if (!currentProject) return;

        // In client-side components, we don't have access to file system
        // The preview manager will handle the path construction server-side
        await startPreview(currentProject.id, true);
        setPreviewMode('live');
    };

    // Keep preview alive when actively viewing
    useEffect(() => {
        if (activeTab === 'preview' && isRunning) {
            keepAlive();
        }
    }, [activeTab, isRunning, keepAlive]);

    // Auto-launch live preview when project is available
    useEffect(() => {
        if (currentProject && !isRunning && !isLoading && buildAttempts === 0) {
            handleLivePreview();
        }
    }, [currentProject, isRunning, isLoading, buildAttempts]);

    const formatUptime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getPreviewUrl = () => {
        if (previewMode === 'live' && isRunning && previewUrl) {
            return previewUrl;
        }
        return null;
    };

    const handleFullscreen = () => {
        const url = getPreviewUrl();
        if (url) {
            window.open(url, '_blank');
        } else if (currentProject) {
            // Create a temporary URL for template preview
            const blob = new Blob([currentProject.preview], { type: 'text/html' });
            const tempUrl = URL.createObjectURL(blob);
            window.open(tempUrl, '_blank');
            // Clean up the URL after a delay
            setTimeout(() => URL.revokeObjectURL(tempUrl), 1000);
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
            {/* Welcome Screen for no project */}
            {!currentProject && (
                <div className={`h-full flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${showSuggestions
                    ? 'opacity-100 transform translate-y-0'
                    : 'opacity-0 transform translate-y-8'
                    }`}>
                    <div className="text-center mb-12">
                        {/* Zap Logo with animations */}
                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 mx-auto transition-all duration-1000 ease-out ${showSuggestions
                            ? 'opacity-0 transform translate-y-8 animate-logo-fade-in-up bg-gradient-to-br from-purple-500 to-blue-600'
                            : 'opacity-0 transform translate-y-8 animate-suggestion-fade-down bg-gradient-to-br from-purple-500 to-blue-600'
                            }`}
                            style={{
                                animationDelay: showSuggestions ? '0.2s' : '0s',
                                animationFillMode: 'both'
                            }}>
                            <Zap className="w-12 h-12 text-white" />
                        </div>

                        {/* Title with fade in/out animation */}
                        <h2 className={`text-4xl font-bold text-white mb-4 opacity-0 transform translate-y-8 ${showSuggestions
                            ? 'animate-logo-fade-in-up'
                            : 'animate-suggestion-fade-down'
                            }`}
                            style={{
                                animationDelay: showSuggestions ? '0.4s' : '0.1s',
                                animationFillMode: 'both'
                            }}>
                            Ready to Build
                        </h2>

                        {/* Subtitle with fade in/out animation */}
                        <p className={`text-xl text-white/60 mb-8 opacity-0 transform translate-y-8 ${showSuggestions
                            ? 'animate-logo-fade-in-up'
                            : 'animate-suggestion-fade-down'
                            }`}
                            style={{
                                animationDelay: showSuggestions ? '0.6s' : '0.2s',
                                animationFillMode: 'both'
                            }}>
                            Tell me what app you'd like to create and I'll build it for you
                        </p>
                    </div>

                    {/* Suggestions with staggered animations */}
                    <div className="grid grid-cols-2 gap-4 max-w-4xl w-full">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className={`opacity-0 transform translate-y-8 ${showSuggestions
                                    ? 'animate-suggestion-slide-up'
                                    : 'animate-suggestion-fade-down'
                                    }`}
                                style={{
                                    animationDelay: showSuggestions
                                        ? `${0.8 + (index * 0.1)}s`
                                        : `${0.3 + (index * 0.05)}s`,
                                    animationFillMode: 'both'
                                }}
                            >
                                <button
                                    onClick={() => onSuggestionClick?.(suggestion)}
                                    className="w-full px-8 py-4 text-center rounded-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] group backdrop-blur-sm"
                                    disabled={!showSuggestions}
                                >
                                    <span className="text-base group-hover:text-white/90 whitespace-nowrap">{suggestion}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Persistent Zap Logo for when suggestions are hidden but no project yet */}
            {!showSuggestions && !currentProject && (
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 animate-logo-fade-in-up"
                    style={{
                        animationDelay: '0.5s',
                        animationFillMode: 'both'
                    }}>
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center animate-gradient-pulse bg-gradient-to-br from-purple-500 via-pink-500 to-blue-600 bg-[length:200%_200%] transition-all duration-500 ease-out">
                        <Zap className="w-12 h-12 text-white" />
                    </div>
                </div>
            )}

            {/* Project Content */}
            {currentProject && (
                <div className="h-full flex flex-col overflow-hidden">
                    {/* Minimal Header with Fullscreen Icon */}
                    <div className="flex-none p-3 border-b border-white/10 bg-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' :
                                        isStarting ? 'bg-yellow-400 animate-pulse' :
                                            'bg-gray-400'
                                        }`} />
                                    <span className="text-xs text-white/60">
                                        {isRunning ? 'Live' : isStarting ? 'Starting...' : 'Preview'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Fullscreen Button */}
                                <button
                                    onClick={handleFullscreen}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                    title="Open in fullscreen"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-200 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Content Area - Full Height */}
                    <div className="flex-1 overflow-hidden h-full relative">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="h-full flex flex-col items-center justify-center p-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Building Live Preview
                                    </h3>
                                    <p className="text-white/60 mb-8">
                                        Compiling your app for live preview...
                                    </p>

                                    <div className="flex justify-center">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Code Tab */}
                        {!isLoading && activeTab === 'code' && (
                            <div className="absolute inset-0 overflow-y-auto p-4 space-y-4">
                                {currentProject.files.map((file: GeneratedFile, index: number) => (
                                    <GlassCard key={index} padding="md">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-mono text-sm text-white">{file.path}</h3>
                                                <p className="text-xs text-white/60">{file.description}</p>
                                            </div>
                                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">
                                                {file.type}
                                            </span>
                                        </div>
                                        <pre className="text-xs text-white/80 bg-black/20 p-3 rounded-lg overflow-x-auto">
                                            <code>{file.content}</code>
                                        </pre>
                                    </GlassCard>
                                ))}
                            </div>
                        )}

                        {/* Preview Tab - Full Height */}
                        {!isLoading && activeTab === 'preview' && (
                            <div className="absolute inset-0 w-full h-full">
                                {previewMode === 'live' && isRunning && previewUrl ? (
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-full border-0 block"
                                        title="Live App Preview"
                                        onLoad={() => keepAlive()}
                                    />
                                ) : (
                                    <iframe
                                        srcDoc={currentProject.preview}
                                        className="w-full h-full border-0 block"
                                        title="Template Preview"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 