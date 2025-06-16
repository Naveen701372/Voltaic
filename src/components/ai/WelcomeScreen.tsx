'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
    showSuggestions: boolean;
    onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
    "A todo app with user authentication and real-time sync",
    "A recipe sharing platform with ratings and comments",
    "A fitness tracker with workout plans and progress charts",
    "A project management tool with team collaboration",
    "A social media dashboard with analytics",
    "An e-commerce store with payment integration"
];

export function WelcomeScreen({ showSuggestions, onSuggestionClick }: WelcomeScreenProps) {
    return (
        <div className={`flex-1 flex items-center justify-center px-8 transition-all duration-800 ease-out ${!showSuggestions ? 'opacity-0 transform translate-y-[-30px] scale-95' : 'opacity-100 transform translate-y-0 scale-100'
            }`}
            style={{
                animationDelay: `${1 * 150}ms`,
                animation: !showSuggestions ? 'fadeOutUp 0.8s ease-out forwards' : 'none'
            }}
        >
            <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Voltaic AI</h1>
                        <p className="text-white/60">App Generator</p>
                    </div>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">What would you like to build?</h2>
                <p className="text-gray-300 mb-8">Describe your app idea and watch our AI agents bring it to life</p>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {SUGGESTIONS.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => onSuggestionClick(suggestion)}
                            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all duration-200 border border-white/20 hover:border-white/30"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
} 