'use client';

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
}