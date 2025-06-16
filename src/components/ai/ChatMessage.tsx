'use client';

import React from 'react';
import { Copy, Check, Sparkles, FileText } from 'lucide-react';
import { Message, GeneratedFile } from './types';
import { AgentCard } from './AgentCard';

interface ChatMessageProps {
    message: Message;
    copiedMessageId: string | null;
    onCopy: (text: string, messageId: string) => void;
    isStreaming?: boolean;
}

// Function to parse markdown bold text
function parseMarkdownBold(text: string): React.ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return <strong key={index} className="font-semibold text-white">{boldText}</strong>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
}

export function ChatMessage({ message, copiedMessageId, onCopy, isStreaming = false }: ChatMessageProps) {
    const isLoadingState = isStreaming && !message.content;

    // Handle agent type messages differently
    if (message.type === 'agent' && message.agentType && message.agentStatus) {
        const agentData = {
            id: message.id,
            type: message.agentType,
            name: message.agentType === 'enthusiasm' ? 'Enthusiasm Agent' :
                message.agentType === 'title-generator' ? 'Title Generator' :
                    message.agentType === 'analyzer' ? 'Feature Analyzer' :
                        message.agentType === 'coder' ? 'Code Generator' :
                            message.agentType === 'preview' ? 'Preview Generator' : 'Agent',
            description: message.agentType === 'enthusiasm' ? 'Acknowledging your idea with excitement' :
                message.agentType === 'title-generator' ? 'Creating a compelling project title' :
                    message.agentType === 'analyzer' ? 'Analyzing features and components' :
                        message.agentType === 'coder' ? 'Writing code and creating files' :
                            message.agentType === 'preview' ? 'Setting up preview and making files accessible' : 'Processing...',
            status: message.agentStatus,
            output: message.content,
            files: message.files,
            timestamp: message.timestamp
        };

        return <AgentCard agent={agentData} />;
    }

    return (
        <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`group relative max-w-[80%] ${message.type === 'user'
                ? 'bg-blue-600/20 border-blue-400/30'
                : 'bg-white/10 border-white/20'
                } backdrop-blur-xl border rounded-2xl p-5 hover:bg-opacity-80 transition-all duration-200`}>
                {/* Copy Button - appears on hover and only when not in loading state */}
                {!isLoadingState && (
                    <button
                        onClick={() => onCopy(message.content, message.id)}
                        className={`absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${copiedMessageId === message.id ? 'opacity-100 bg-green-500/20 border-green-400/30' : ''
                            }`}
                        title={copiedMessageId === message.id ? 'Copied!' : message.content.trim() ? 'Copy message' : 'Message is empty'}
                        disabled={!message.content.trim()}
                    >
                        {copiedMessageId === message.id ? (
                            <Check className="w-3 h-3 text-green-400" />
                        ) : (
                            <Copy className="w-3 h-3 text-white/70 hover:text-white" />
                        )}
                    </button>
                )}

                {/* Message header for assistant messages */}
                {message.type === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-medium text-sm">Voltaic AI</span>
                    </div>
                )}

                {/* Message content */}
                {message.content ? (
                    <div className="text-white whitespace-pre-wrap text-sm pr-10">
                        {parseMarkdownBold(message.content)}
                        {isStreaming && (
                            <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse"></span>
                        )}
                    </div>
                ) : isStreaming ? (
                    // Loading animation for empty streaming content
                    <div className="flex items-center justify-center gap-3 py-2 min-w-[150px]">
                        <div className="flex space-x-1 flex-shrink-0">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-white/60 text-sm whitespace-nowrap">Thinking...</span>
                    </div>
                ) : (
                    <div className="text-white whitespace-pre-wrap text-sm pr-10">
                        {parseMarkdownBold(message.content)}
                    </div>
                )}

                {/* Files section */}
                {message.files && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/70 text-sm mb-2">Generated {message.files.length} files:</p>
                        <div className="space-y-1">
                            {message.files.map((file: GeneratedFile, index: number) => (
                                <div key={index} className="text-xs text-white/60 flex items-center gap-2">
                                    <FileText className="w-3 h-3" />
                                    {file.path}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 