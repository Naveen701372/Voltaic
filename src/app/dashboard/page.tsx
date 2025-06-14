'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';

export default function Dashboard() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/signin');
            } else {
                setIsLoading(false);
            }
        }
    }, [user, loading, router]);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect to signin
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-10 opacity-50">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply animate-pulse" />
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply animate-pulse animation-delay-2000" />
                    <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply animate-pulse animation-delay-4000" />
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Welcome to Voltaic
                        </h1>
                        <p className="text-gray-300">
                            Hello, {user.user_metadata?.full_name || user.email}!
                        </p>
                    </div>
                    <GlassButton
                        onClick={handleSignOut}
                        variant="dark"
                        className="px-6 py-3"
                    >
                        Sign Out
                    </GlassButton>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* User Profile Card */}
                    <GlassCard className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                            {user.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                                    {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-semibold text-white">
                                    {user.user_metadata?.full_name || 'User'}
                                </h3>
                                <p className="text-gray-300 text-sm">{user.email}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-400">
                            <p><span className="font-medium">Provider:</span> {user.app_metadata?.provider || 'email'}</p>
                            <p><span className="font-medium">Joined:</span> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                            <p><span className="font-medium">Last Sign In:</span> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </GlassCard>

                    {/* Quick Actions Card */}
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <GlassButton
                                onClick={() => router.push('/projects')}
                                className="w-full justify-start"
                                variant="light"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                My Projects
                            </GlassButton>
                            <GlassButton
                                onClick={() => router.push('/create')}
                                className="w-full justify-start"
                                variant="primary"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New MVP
                            </GlassButton>
                            <GlassButton
                                onClick={() => router.push('/settings')}
                                className="w-full justify-start"
                                variant="light"
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                            </GlassButton>
                        </div>
                    </GlassCard>

                    {/* Stats Card */}
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Your Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Projects Created</span>
                                <span className="text-2xl font-bold text-white">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">MVPs Deployed</span>
                                <span className="text-2xl font-bold text-white">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">AI Generations</span>
                                <span className="text-2xl font-bold text-white">0</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-400 text-center">
                                Ready to build your first MVP?
                            </p>
                        </div>
                    </GlassCard>
                </div>

                {/* Coming Soon Section */}
                <div className="mt-12">
                    <GlassCard className="p-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            🚀 More Features Coming Soon
                        </h2>
                        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                            We're working hard to bring you the complete AI-powered MVP generation experience.
                            Stay tuned for project management, AI agents, deployment tools, and much more!
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                            <span className="px-3 py-1 bg-white/5 rounded-full">AI Agent Framework</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full">Project Management</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full">Code Generation</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full">Deployment Pipeline</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full">Team Collaboration</span>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
} 