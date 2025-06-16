'use client';

import React from 'react';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { Message, GenerationStep } from './types';

interface ChatPanelProps {
    messages: Message[];
    streamingMessage: Message | null;
    copiedMessageId: string | null;
    onCopy: (text: string, messageId: string) => void;
    previewLoading: boolean;
    showGenerationSteps: boolean;
    generationSteps: GenerationStep[];
    isGenerating: boolean;
    currentProject: any;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatPanel({
    messages,
    streamingMessage,
    copiedMessageId,
    onCopy,
    previewLoading,
    showGenerationSteps,
    generationSteps,
    isGenerating,
    currentProject,
    messagesEndRef
}: ChatPanelProps) {
    return (
        <div className="h-full flex flex-col transform transition-all duration-700 ease-in-out overflow-hidden">
            {/* Generation Steps in Left Panel (when preview loading) */}
            {previewLoading && showGenerationSteps && (
                <div className={`p-6 border-b border-white/10 transition-all duration-700 ease-in-out ${previewLoading ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
                    }`}>
                    <h3 className="text-white font-medium mb-4">Generation Progress</h3>
                    <div className="space-y-3">
                        {generationSteps.map((step, index) => (
                            <div
                                key={step.id}
                                className="flex items-center gap-3 text-white/60 transition-all duration-300"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: previewLoading ? 'slideInLeft 0.6s ease-out forwards' : 'none'
                                }}
                            >
                                <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all duration-300 ${step.status === 'completed' ? 'bg-green-500' :
                                    step.status === 'generating' ? 'bg-blue-400' : 'bg-white/20'
                                    }`}>
                                    {step.status === 'completed' ? (
                                        <CheckCircle className="w-2 h-2 text-white" />
                                    ) : step.status === 'generating' ? (
                                        <Loader2 className="w-2 h-2 text-white animate-spin" />
                                    ) : (
                                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                                    )}
                                </div>
                                <div className="text-sm">
                                    <div className={`font-medium transition-colors duration-300 ${step.status === 'completed' ? 'text-green-400' :
                                        step.status === 'generating' ? 'text-blue-400' : 'text-white/40'
                                        }`}>
                                        {step.name}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                        copiedMessageId={copiedMessageId}
                        onCopy={onCopy}
                    />
                ))}

                {/* Show streaming message in chat */}
                {streamingMessage && (
                    <div className="flex justify-start transition-all duration-700 ease-in-out animate-fadeInUp">
                        <ChatMessage
                            message={streamingMessage}
                            copiedMessageId={copiedMessageId}
                            onCopy={onCopy}
                            isStreaming={streamingMessage.isStreaming}
                        />
                    </div>
                )}

                {isGenerating && !streamingMessage && currentProject && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                <p className="text-white">Processing your request...</p>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
} 