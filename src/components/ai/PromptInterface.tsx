'use client';

import React, { useState } from 'react';
import { Send, Zap, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAgentStore } from '@/lib/stores/agentStore';
import { logger } from '@/lib/utils/logger';

export const PromptInterface: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    // Agent store selectors
    const isGenerating = useAgentStore((state) => state.isGenerating);
    const progress = useAgentStore((state) => state.progress);
    const currentStep = useAgentStore((state) => state.currentStep);
    const error = useAgentStore((state) => state.error);

    // Agent store actions
    const generateMVP = useAgentStore((state) => state.generateMVP);
    const setError = useAgentStore((state) => state.setError);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        logger.info('PromptInterface', `Form submitted with prompt: ${prompt.trim()}`);

        if (!prompt.trim() || isGenerating) {
            logger.warn('PromptInterface', 'Submission blocked - empty prompt or already generating');
            return;
        }

        try {
            logger.info('PromptInterface', 'Calling generateMVP...');
            await generateMVP(prompt.trim());
            logger.info('PromptInterface', 'MVP generation completed successfully');
            setPrompt('');
            setIsExpanded(false);
        } catch (error) {
            logger.error('PromptInterface', 'Failed to generate MVP', error);
        }
    };

    const handleInputFocus = () => {
        setIsExpanded(true);
    };

    const handleInputBlur = () => {
        if (!prompt.trim()) {
            setIsExpanded(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    const examplePrompts = [
        "A task management app with team collaboration features",
        "An e-commerce platform for handmade crafts",
        "A fitness tracking app with social features",
        "A recipe sharing platform with meal planning"
    ];

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            {/* Main Prompt Interface */}
            <div className={`
        relative transition-all duration-500 ease-out
        ${isExpanded ? 'transform scale-105' : ''}
      `}>
                {/* Glass Container */}
                <div className="
          relative backdrop-blur-xl bg-white/10 
          border border-white/20 rounded-2xl
          shadow-2xl shadow-purple-500/10
          overflow-hidden
        ">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5" />

                    {/* Content */}
                    <div className="relative p-8">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    AI MVP Generator
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Describe your app idea and watch it come to life
                                </p>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                    <button
                                        onClick={clearError}
                                        className="text-red-500 hover:text-red-600 text-xs mt-1 underline"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Progress Display */}
                        {isGenerating && (
                            <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        {currentStep || 'Generating your MVP...'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="text-right text-sm text-gray-500 mt-1">
                                    {progress}%
                                </div>
                            </div>
                        )}

                        {/* Prompt Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    placeholder="Describe your app idea in detail..."
                                    disabled={isGenerating}
                                    className={`
                    w-full resize-none rounded-xl border border-white/20
                    bg-white/5 backdrop-blur-sm
                    px-4 py-3 text-gray-900 dark:text-white
                    placeholder-gray-500 dark:placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-purple-500/50
                    focus:border-purple-500/50
                    transition-all duration-300
                    ${isExpanded ? 'min-h-[120px]' : 'min-h-[60px]'}
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                                />

                                {/* Character Count */}
                                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                    {prompt.length}/1000
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || isGenerating}
                                    className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl
                    bg-gradient-to-r from-purple-600 to-blue-600
                    text-white font-medium
                    hover:from-purple-700 hover:to-blue-700
                    focus:outline-none focus:ring-2 focus:ring-purple-500/50
                    transition-all duration-300
                    ${(!prompt.trim() || isGenerating)
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25'
                                        }
                  `}
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {isGenerating ? 'Generating...' : 'Generate MVP'}
                                </button>
                            </div>
                        </form>

                        {/* Example Prompts */}
                        {!isGenerating && !isExpanded && (
                            <div className="mt-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    Try these examples:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {examplePrompts.map((example, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setPrompt(example)}
                                            className="
                        text-left p-3 rounded-lg
                        bg-white/5 hover:bg-white/10
                        border border-white/10 hover:border-white/20
                        text-sm text-gray-600 dark:text-gray-300
                        transition-all duration-200
                        hover:scale-[1.02]
                      "
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60 animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-40 animate-pulse delay-1000" />
            </div>
        </div>
    );
}; 