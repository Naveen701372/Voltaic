'use client';

import React, { useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface FloatingInputProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isGenerating: boolean;
    isBottom?: boolean;
    placeholder?: string;
    currentProject?: any;
}

export function FloatingInput({
    prompt,
    setPrompt,
    onSubmit,
    isGenerating,
    isBottom = false,
    placeholder = "Describe your app idea in detail...",
    currentProject
}: FloatingInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
        }
    };

    return (
        <div className={`fixed ${isBottom ? 'bottom-8' : 'bottom-6'} left-0 right-0 px-6 z-50 transition-all duration-700 ease-in-out ${currentProject && !isBottom ? 'transform translate-x-[-25%] scale-90' : ''
            }`}>
            <div className={`${isBottom ? 'max-w-2xl' : currentProject ? 'max-w-lg' : 'max-w-2xl'
                } mx-auto transition-all duration-700 ease-in-out`}>
                <form onSubmit={onSubmit}>
                    <div className="relative">
                        <div className="relative backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl shadow-2xl shadow-purple-500/5 overflow-hidden hover:shadow-purple-500/10 transition-all duration-300 hover:bg-white/12 focus-within:bg-white/15 focus-within:border-white/30 focus-within:shadow-purple-500/20">
                            <textarea
                                key="prompt-input"
                                ref={textareaRef}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={placeholder}
                                className="w-full resize-none bg-transparent px-6 py-4 text-white placeholder-gray-500 focus:outline-none min-h-[60px] max-h-[120px] focus:placeholder-gray-400 transition-all duration-200"
                                rows={2}
                                disabled={isGenerating}
                            />
                            <button
                                type="submit"
                                disabled={!prompt.trim() || isGenerating}
                                className="absolute right-3 bottom-3 p-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
} 