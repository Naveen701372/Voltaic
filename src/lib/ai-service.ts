import { VoltaicPromptBuilder } from './voltaic-prompts';

export interface AIGenerationRequest {
    prompt: string;
    context?: string;
    previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface GeneratedApp {
    name: string;
    description: string;
    files: Array<{
        path: string;
        content: string;
        description: string;
        type: 'component' | 'page' | 'api' | 'config' | 'style';
    }>;
    preview: string;
    dependencies?: string[];
    instructions?: string;
}

export class VoltaicAIService {
    private apiKey: string;
    private model: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '';
        this.model = process.env.NEXT_PUBLIC_OPENAI_MODEL || process.env.NEXT_PUBLIC_ANTHROPIC_MODEL || 'gpt-4';
        this.baseUrl = this.apiKey.startsWith('sk-ant-')
            ? 'https://api.anthropic.com/v1/messages'
            : 'https://api.openai.com/v1/chat/completions';
    }

    async generateApp(request: AIGenerationRequest): Promise<GeneratedApp> {
        try {
            // For now, return a mock response since we need API keys configured
            // In production, this would call the actual AI service
            return this.generateFallbackApp(request.prompt);

        } catch (error) {
            console.error('AI Generation Error:', error);
            throw new Error('Failed to generate app. Please try again.');
        }
    }

    private generateFallbackApp(prompt: string): GeneratedApp {
        const appName = this.extractAppName(prompt);
        const features = this.extractFeatures(prompt);

        return {
            name: appName,
            description: `A modern ${appName.toLowerCase()} with ${features.join(', ')} built with Next.js, TypeScript, and glass morphism UI.`,
            files: this.generateBasicFiles(appName, features),
            preview: this.generateBasicPreview(appName, features),
            dependencies: ['@supabase/supabase-js'],
            instructions: 'App generated successfully! You can customize it further by chatting with the AI.'
        };
    }

    private extractAppName(prompt: string): string {
        if (prompt.toLowerCase().includes('todo')) return 'Todo Master';
        if (prompt.toLowerCase().includes('recipe')) return 'Recipe Hub';
        if (prompt.toLowerCase().includes('fitness')) return 'Fitness Tracker';
        if (prompt.toLowerCase().includes('project')) return 'Project Manager';
        if (prompt.toLowerCase().includes('social')) return 'Social Dashboard';
        if (prompt.toLowerCase().includes('ecommerce') || prompt.toLowerCase().includes('store')) return 'E-Commerce Store';
        if (prompt.toLowerCase().includes('blog')) return 'Blog Platform';
        if (prompt.toLowerCase().includes('chat')) return 'Chat Application';
        if (prompt.toLowerCase().includes('dashboard')) return 'Analytics Dashboard';

        return 'Custom App';
    }

    private extractFeatures(prompt: string): string[] {
        const features = [];
        if (prompt.toLowerCase().includes('auth')) features.push('authentication');
        if (prompt.toLowerCase().includes('real-time')) features.push('real-time updates');
        if (prompt.toLowerCase().includes('payment')) features.push('payment integration');
        if (prompt.toLowerCase().includes('chart') || prompt.toLowerCase().includes('analytics')) features.push('analytics dashboard');
        if (prompt.toLowerCase().includes('comment') || prompt.toLowerCase().includes('rating')) features.push('user interactions');
        if (prompt.toLowerCase().includes('search')) features.push('search functionality');
        if (prompt.toLowerCase().includes('notification')) features.push('notifications');
        if (features.length === 0) features.push('modern UI', 'responsive design');
        return features;
    }

    private generateBasicFiles(appName: string, features: string[]): GeneratedApp['files'] {
        const files = [
            {
                path: 'src/app/page.tsx',
                type: 'page' as const,
                description: 'Main application page',
                content: `'use client';

import { AppHeader } from '@/components/AppHeader';
import { MainContent } from '@/components/MainContent';
import { GlassCard } from '@/components/glass';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <AppHeader title="${appName}" />
            <main className="container mx-auto px-4 py-8">
                <GlassCard className="max-w-6xl mx-auto" padding="lg">
                    <MainContent features={${JSON.stringify(features)}} />
                </GlassCard>
            </main>
        </div>
    );
}`
            },
            {
                path: 'src/components/AppHeader.tsx',
                type: 'component' as const,
                description: 'Application header component',
                content: `'use client';

import { GlassCard, GlassButton } from '@/components/glass';
import { Sparkles, User } from 'lucide-react';

interface AppHeaderProps {
    title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
    return (
        <header className="sticky top-0 z-50 p-4">
            <GlassCard className="max-w-6xl mx-auto" padding="md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">{title}</h1>
                    </div>
                    <GlassButton variant="primary" size="sm">
                        <User className="w-4 h-4 mr-2" />
                        Sign In
                    </GlassButton>
                </div>
            </GlassCard>
        </header>
    );
}`
            },
            {
                path: 'src/components/MainContent.tsx',
                type: 'component' as const,
                description: 'Main content area with dynamic features',
                content: `'use client';

import { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '@/components/glass';
import { Plus, Star, TrendingUp, Search, Bell, Users } from 'lucide-react';

interface MainContentProps {
    features: string[];
}

export function MainContent({ features }: MainContentProps) {
    const [items, setItems] = useState<string[]>([]);
    const [newItem, setNewItem] = useState('');

    const addItem = () => {
        if (newItem.trim()) {
            setItems([...items, newItem]);
            setNewItem('');
        }
    };

    const getFeatureIcon = (feature: string) => {
        if (feature.includes('search')) return <Search className="w-5 h-5" />;
        if (feature.includes('notification')) return <Bell className="w-5 h-5" />;
        if (feature.includes('user')) return <Users className="w-5 h-5" />;
        if (feature.includes('analytics')) return <TrendingUp className="w-5 h-5" />;
        return <Star className="w-5 h-5" />;
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to ${appName}!</h2>
                <p className="text-white/70">Features: {features.join(', ')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <GlassCard padding="md" hover>
                    <div className="flex items-center gap-3 mb-4">
                        <Plus className="w-5 h-5 text-blue-400" />
                        <h3 className="font-semibold text-white">Add New Item</h3>
                    </div>
                    <div className="space-y-3">
                        <GlassInput
                            value={newItem}
                            onChange={setNewItem}
                            placeholder="Enter item name..."
                        />
                        <GlassButton onClick={addItem} variant="primary" className="w-full">
                            Add Item
                        </GlassButton>
                    </div>
                </GlassCard>

                {features.slice(0, 2).map((feature, index) => (
                    <GlassCard key={index} padding="md" hover>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-blue-400">
                                {getFeatureIcon(feature)}
                            </div>
                            <h3 className="font-semibold text-white capitalize">{feature}</h3>
                        </div>
                        <p className="text-white/70 text-sm">
                            Your {feature} functionality will be implemented here.
                        </p>
                    </GlassCard>
                ))}
            </div>

            {items.length > 0 && (
                <GlassCard padding="md">
                    <h3 className="font-semibold text-white mb-4">Your Items ({items.length})</h3>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                                <p className="text-white">{item}</p>
                                <button 
                                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    );
}`
            },
            {
                path: 'src/components/AuthSection.tsx',
                type: 'component' as const,
                description: 'Authentication component',
                content: `'use client';

import { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '@/components/glass';
import { User, LogIn, LogOut } from 'lucide-react';

export function AuthSection() {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [email, setEmail] = useState('');

    const handleAuth = () => {
        if (isSignedIn) {
            setIsSignedIn(false);
            setEmail('');
        } else {
            // Simulate sign in
            setIsSignedIn(true);
        }
    };

    return (
        <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-white">Authentication</h3>
            </div>
            
            {!isSignedIn ? (
                <div className="space-y-3">
                    <GlassInput
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="Enter your email..."
                    />
                    <GlassButton onClick={handleAuth} variant="primary" className="w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                    </GlassButton>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-white/70">Welcome back!</p>
                    <GlassButton onClick={handleAuth} variant="dark" className="w-full">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </GlassButton>
                </div>
            )}
        </GlassCard>
    );
}`
            }
        ];

        // Add authentication component if auth is mentioned
        if (features.some(f => f.includes('auth'))) {
            files.push({
                path: 'src/components/AuthSection.tsx',
                type: 'component' as const,
                description: 'Authentication component',
                content: `'use client';

import { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '@/components/glass';
import { User, LogIn, LogOut } from 'lucide-react';

export function AuthSection() {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [email, setEmail] = useState('');

    const handleAuth = () => {
        if (isSignedIn) {
            setIsSignedIn(false);
            setEmail('');
        } else {
            // Simulate sign in
            setIsSignedIn(true);
        }
    };

    return (
        <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-white">Authentication</h3>
            </div>
            
            {!isSignedIn ? (
                <div className="space-y-3">
                    <GlassInput
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="Enter your email..."
                    />
                    <GlassButton onClick={handleAuth} variant="primary" className="w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                    </GlassButton>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-white/70">Welcome back!</p>
                    <GlassButton onClick={handleAuth} variant="dark" className="w-full">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </GlassButton>
                </div>
            )}
        </GlassCard>
    );
}`
            });
        }

        return files;
    }

    private generateBasicPreview(appName: string, features: string[]): string {
        return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .glass-card { 
            backdrop-filter: blur(16px); 
            background: rgba(255, 255, 255, 0.1); 
            border: 1px solid rgba(255, 255, 255, 0.2); 
            border-radius: 16px; 
        }
        .glass-button { 
            backdrop-filter: blur(8px); 
            background: rgba(59, 130, 246, 0.2); 
            border: 1px solid rgba(59, 130, 246, 0.3); 
            border-radius: 8px; 
            transition: all 0.2s ease;
        }
        .glass-button:hover {
            background: rgba(59, 130, 246, 0.3);
            transform: translateY(-1px);
        }
        .glass-input {
            backdrop-filter: blur(8px);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white">
    <div class="p-4">
        <!-- Header -->
        <div class="glass-card p-6 max-w-6xl mx-auto mb-8">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">✨</div>
                    <h1 class="text-xl font-bold">${appName}</h1>
                </div>
                <button class="glass-button px-4 py-2 text-sm">Sign In</button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="glass-card p-6 max-w-6xl mx-auto">
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold mb-2">Welcome to your app!</h2>
                <p class="text-white/70">Features: ${features.join(', ')}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="glass-card p-4">
                    <h3 class="font-semibold mb-2 flex items-center gap-2">
                        <span>➕</span> Add New Item
                    </h3>
                    <input class="glass-input w-full p-2 text-white placeholder-white/50 mb-3" placeholder="Enter item name...">
                    <button class="glass-button w-full p-2">Add Item</button>
                </div>
                
                ${features.slice(0, 2).map(feature => `
                <div class="glass-card p-4">
                    <h3 class="font-semibold mb-2 capitalize flex items-center gap-2">
                        <span>⭐</span> ${feature}
                    </h3>
                    <p class="text-white/70 text-sm">Your ${feature} functionality will be implemented here.</p>
                </div>
                `).join('')}
            </div>

            <div class="glass-card p-4">
                <h3 class="font-semibold mb-4">Recent Activity</h3>
                <div class="space-y-2">
                    <div class="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p class="text-white">Welcome to ${appName}! Start by exploring the features above.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }
}

// Export singleton instance
export const aiService = new VoltaicAIService();