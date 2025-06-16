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
}

export function PreviewPanel({
    previewLoading,
    previewReady,
    currentProject,
    activeTab,
    setActiveTab
}: PreviewPanelProps) {
    return (
        <div className="w-1/2 flex flex-col transform transition-all duration-700 ease-in-out max-h-screen overflow-hidden animate-slideInRight">
            {/* Preview Loading State */}
            {previewLoading && !previewReady && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fadeInUp">
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
                <div className="flex-1 flex flex-col">
                    {/* Header with App Info */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">{currentProject.name}</h2>
                                <p className="text-white/60 text-sm">{currentProject.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('code')}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === 'code'
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Code className="w-4 h-4 inline mr-2" />
                                    Code
                                </button>
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === 'preview'
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Eye className="w-4 h-4 inline mr-2" />
                                    Preview
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
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
                            <div className="h-full flex flex-col">
                                <div className="p-4 border-b border-white/10">
                                    <div className="flex items-center gap-2 text-white/60 text-sm">
                                        <ExternalLink className="w-4 h-4" />
                                        <span>Live Preview</span>
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    <iframe
                                        srcDoc={currentProject.preview}
                                        className="w-full h-full border-0 opacity-100"
                                        title="App Preview"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-white/10 flex gap-2">
                        <GlassButton variant="primary" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Deploy
                        </GlassButton>
                        <GlassButton variant="dark" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </GlassButton>
                    </div>
                </div>
            )}
        </div>
    );
} 