'use client';

import React from 'react';
import { Copy, Check, Sparkles, FileText } from 'lucide-react';
import { Message, GeneratedFile } from './types';

interface ChatMessageProps {
    message: Message;
    copiedMessageId: string | null;
    onCopy: (text: string, messageId: string) => void;
    isStreaming?: boolean;
}

export function ChatMessage({ message, copiedMessageId, onCopy, isStreaming = false }: ChatMessageProps) {
    return (
        <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`group relative max-w-[80%] ${message.type === 'user'
                ? 'bg-blue-600/20 border-blue-400/30'
                : 'bg-white/10 border-white/20'
                } backdrop-blur-xl border rounded-2xl p-4 hover:bg-opacity-80 transition-all duration-200`}>
                {/* Copy Button - appears on hover */}
                <button
                    onClick={() => onCopy(message.content, message.id)}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${copiedMessageId === message.id ? 'opacity-100 bg-green-500/20 border-green-400/30' : ''
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

                {/* Message header for assistant messages */}
                {message.type === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-medium text-sm">Voltaic AI</span>
                    </div>
                )}

                {/* Message content */}
                <p className="text-white whitespace-pre-wrap text-sm pr-8">
                    {message.content}
                    {isStreaming && (
                        <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse"></span>
                    )}
                </p>

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