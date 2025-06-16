'use client';

import { AppHeader } from '@/components/AppHeader';
import { MainContent } from '@/components/MainContent';
import { GlassCard } from '@/components/glass';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <AppHeader title="Recipe Hub" />
            <main className="container mx-auto px-4 py-8">
                <GlassCard className="max-w-6xl mx-auto" padding="lg">
                    <MainContent features={["user interactions"]} />
                </GlassCard>
            </main>
        </div>
    );
}