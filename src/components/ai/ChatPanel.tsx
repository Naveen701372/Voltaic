'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { WorkflowVisualization } from './WorkflowVisualization';
import { Message, GenerationStep, AgentWorkflow } from './types';

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
    currentWorkflow: AgentWorkflow | null;
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
    currentWorkflow,
    messagesEndRef
}: ChatPanelProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const intersectionSentinelRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const isUserScrolling = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();

    // Smooth scroll to bottom function
    const scrollToBottom = useCallback((behavior: 'smooth' | 'instant' = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior,
                block: 'end',
                inline: 'nearest'
            });
        }
    }, [messagesEndRef]);

    // Auto-scroll logic with intersection detection
    useEffect(() => {
        if (!scrollContainerRef.current || !intersectionSentinelRef.current) return;

        const scrollContainer = scrollContainerRef.current;
        const sentinel = intersectionSentinelRef.current;

        // Intersection Observer to detect when content overlaps with input area
        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // If the sentinel (near bottom) is not visible, auto-scroll
                    if (!entry.isIntersecting && !isUserScrolling.current) {
                        scrollToBottom('smooth');
                    }
                });
            },
            {
                root: scrollContainer,
                // Account for floating input height (~120px) + padding
                rootMargin: '0px 0px -140px 0px',
                threshold: 0.1
            }
        );

        intersectionObserver.observe(sentinel);

        // Handle user scrolling detection
        const handleScroll = () => {
            isUserScrolling.current = true;

            // Clear existing timeout
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            // Reset user scrolling flag after scroll ends
            scrollTimeoutRef.current = setTimeout(() => {
                isUserScrolling.current = false;

                // Check if user scrolled back near the bottom
                const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

                if (isNearBottom) {
                    scrollToBottom('smooth');
                }
            }, 150);
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            intersectionObserver.disconnect();
            scrollContainer.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [scrollToBottom]);

    // Auto-scroll on new messages or streaming updates
    useEffect(() => {
        if (!isUserScrolling.current) {
            // Small delay to ensure DOM is updated
            const timeoutId = setTimeout(() => {
                scrollToBottom('smooth');
            }, 50);

            return () => clearTimeout(timeoutId);
        }
    }, [messages.length, streamingMessage?.content, currentWorkflow, scrollToBottom]);

    // Force scroll on specific events (new workflow, completion, etc.)
    useEffect(() => {
        if (currentWorkflow && !isUserScrolling.current) {
            scrollToBottom('smooth');
        }
    }, [currentWorkflow?.isComplete, currentWorkflow?.agents, scrollToBottom]);

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

            {/* Messages - Scrollable Area with enhanced autoscroll */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 pb-32 scroll-smooth"
                style={{ scrollBehavior: 'smooth' }}
            >
                {messages.map((message, index) => {
                    // Check if the next message is a completion message
                    const nextMessage = messages[index + 1];
                    const isNextMessageCompletion = nextMessage?.content.includes('Your app is ready!');

                    return (
                        <React.Fragment key={message.id}>
                            <div
                                ref={index === messages.length - 1 ? lastMessageRef : undefined}
                                className="animate-messageSlideIn"
                            >
                                <ChatMessage
                                    message={message}
                                    copiedMessageId={copiedMessageId}
                                    onCopy={onCopy}
                                />
                            </div>

                            {/* Show workflow visualization after user message but before completion message */}
                            {isNextMessageCompletion && nextMessage?.metadata?.workflow && (
                                <div className="animate-fadeInUp bg-white/5 border border-white/20 backdrop-blur-xl rounded-2xl p-6 transition-all duration-500 ease-in-out">
                                    <WorkflowVisualization workflow={nextMessage.metadata.workflow} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}

                {/* Show streaming message in chat */}
                {streamingMessage && (
                    <div className="animate-fadeInUp">
                        <ChatMessage
                            message={streamingMessage}
                            copiedMessageId={copiedMessageId}
                            onCopy={onCopy}
                            isStreaming={streamingMessage.isStreaming}
                        />
                    </div>
                )}

                {/* Show current workflow visualization when agents are actively working */}
                {currentWorkflow && !currentWorkflow.isComplete && (
                    <div className="animate-fadeInUp bg-white/5 border border-white/20 backdrop-blur-xl rounded-2xl p-6 transition-all duration-500 ease-in-out">
                        <WorkflowVisualization workflow={currentWorkflow} />
                    </div>
                )}

                {isGenerating && !streamingMessage && !currentWorkflow && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                <p className="text-white">Processing your request...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Intersection sentinel - invisible element to detect overlap with input */}
                <div
                    ref={intersectionSentinelRef}
                    className="h-4 w-full"
                    aria-hidden="true"
                />

                {/* Messages end marker */}
                <div ref={messagesEndRef} className="h-1" />
            </div>
        </div>
    );
} 