'use client';

import React from 'react';
import { Code, Eye, ExternalLink, Play, Download, Loader2, CheckCircle } from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/glass';
import { AppProject, GeneratedFile } from './types';

interface PreviewPanelProps {
    previewLoading: boolean;
    previewReady: boolean;
    currentProject: AppProject | null;
    activeTab: 'chat' | 'code' | 'preview';
    setActiveTab: (tab: 'chat' | 'code' | 'preview') => void;
    showSuggestions?: boolean;
    onSuggestionClick?: (suggestion: string) => void;
}

export function PreviewPanel({
    previewLoading,
    previewReady,
    currentProject,
    activeTab,
    setActiveTab,
    showSuggestions = false,
    onSuggestionClick
}: PreviewPanelProps) {
    const suggestions = [
        "A task management app with team collaboration",
        "An e-commerce platform for handmade crafts",
        "A fitness tracking app with social features",
        "A recipe sharing platform with meal planning"
    ];

    return (
        <div className="w-full h-full flex flex-col transform transition-all duration-700 ease-in-out  pt-20 overflow-hidden animate-slideInRight">
            {/* Suggestions State - When no project exists */}
            {!currentProject && (
                <div className={`h-full flex flex-col items-center pt-16 px-4 overflow-y-auto transition-all duration-1000 ease-out ${showSuggestions
                    ? 'opacity-100 transform translate-y-0'
                    : 'opacity-0 transform -translate-y-12'
                    }`}>
                    <div className="text-center mb-16">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                            <Code className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">What would you like to build?</h2>
                        <p className="text-white/60 text-sm">Describe your app idea and watch our AI agents bring it to life</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-4xl w-full">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className={`transition-all duration-700 ease-out ${showSuggestions
                                    ? 'opacity-100 transform translate-y-0'
                                    : 'opacity-0 transform -translate-y-8'
                                    }`}
                                style={{
                                    transitionDelay: showSuggestions ? `${index * 100}ms` : `${(suggestions.length - index - 1) * 100}ms`
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

            {/* Preview Loading State */}
            {previewLoading && !previewReady && (
                <div className="h-full flex flex-col items-center justify-center p-8 animate-fadeInUp overflow-y-auto">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto animate-pulse">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Building Preview</h3>
                        <p className="text-white/60 mb-8">Preparing your app for live preview...</p>

                        {/* Progressive loading steps */}
                        <div className="space-y-4 max-w-xs mx-auto mb-8">
                            <div className="flex items-center gap-3 text-white/80 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-2 h-2 text-white" />
                                </div>
                                <span className="text-sm">Compiling components</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-2 h-2 text-white" />
                                </div>
                                <span className="text-sm">Applying glass morphism styles</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse">
                                    <Loader2 className="w-2 h-2 text-white animate-spin" />
                                </div>
                                <span className="text-sm">Generating live preview</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/40 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                                <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                                <span className="text-sm">Finalizing interface</span>
                            </div>
                        </div>

                        {/* Loading animation */}
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

            {/* Preview Ready State */}
            {previewReady && currentProject && (
                <div className="h-full flex flex-col overflow-hidden">
                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'code' && (
                            <div className="h-full overflow-y-auto p-4 space-y-4">
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

                        {activeTab === 'preview' && (
                            <div className="h-full">
                                <iframe
                                    srcDoc={currentProject.preview}
                                    className="w-full h-full border-0 opacity-100"
                                    title="App Preview"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 