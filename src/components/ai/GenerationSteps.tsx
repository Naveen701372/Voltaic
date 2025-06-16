'use client';

import React from 'react';
import { Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { GenerationStep, Message } from './types';

interface GenerationStepsProps {
    generationSteps: GenerationStep[];
    streamingMessage: Message | null;
    showGenerationSteps: boolean;
    previewLoading: boolean;
}

export function GenerationSteps({
    generationSteps,
    streamingMessage,
    showGenerationSteps,
    previewLoading
}: GenerationStepsProps) {
    return (
        <div className={`absolute inset-0 flex items-center justify-center px-8 transition-all duration-700 ease-in-out ${showGenerationSteps ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-[30px] scale-95'
            } ${previewLoading ? 'transform translate-x-[-50%] scale-75 opacity-0' : ''}`}
            style={{
                animationDelay: `${2 * 150}ms`,
                animation: showGenerationSteps ? 'fadeInUp 0.8s ease-out forwards' : 'none'
            }}
        >
            <div className="max-w-5xl mx-auto w-full">
                {/* Header Section - Fixed */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Generating your app...</h2>
                    <p className="text-white/70">Our AI is analyzing your requirements and building your application</p>
                </div>

                {/* Main Content Area - Fixed Height Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[400px]">
                    {/* Left Column - Generation Steps */}
                    <div className="flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-white mb-4 flex-shrink-0">Progress</h3>
                        <div className="flex-1 space-y-4 overflow-y-auto">
                            {generationSteps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`flex items-center gap-3 text-white/60 transition-all duration-600 ease-out`}
                                    style={{
                                        animationDelay: `${index * 150}ms`,
                                        animation: showGenerationSteps ? 'fadeInUp 0.8s ease-out forwards' : 'none'
                                    }}
                                >
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${step.status === 'completed' ? 'bg-green-500 scale-110' :
                                            step.status === 'generating' ? 'bg-blue-400 scale-110' : 'bg-white/20'
                                        }`}>
                                        {step.status === 'completed' ? (
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        ) : step.status === 'generating' ? (
                                            <Loader2 className="w-3 h-3 text-white animate-spin" />
                                        ) : (
                                            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium transition-colors duration-300 ${step.status === 'completed' ? 'text-green-400' :
                                                step.status === 'generating' ? 'text-blue-400' : 'text-white/40'
                                            }`}>
                                            {step.name}
                                        </div>
                                        <div className="text-xs text-white/40 truncate">{step.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Streaming Message */}
                    <div className="flex flex-col h-full">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-purple-400 font-medium">Voltaic AI</span>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {streamingMessage ? (
                                    <div className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed animate-fadeInUp">
                                        {streamingMessage.content}
                                        {streamingMessage.isStreaming && (
                                            <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse"></span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center text-white/40">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            <p className="text-sm">Preparing response...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 