'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Zap } from 'lucide-react';
import { GlassButton } from './glass/GlassButton';

interface AppHeaderProps {
    title: string;
    subtitle?: string;
    logoDestination?: 'home' | 'dashboard';
}

export function AppHeader({ title, subtitle, logoDestination = 'dashboard' }: AppHeaderProps) {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleLogoClick = () => {
        if (logoDestination === 'home') {
            router.push('/');
        } else {
            router.push('/dashboard');
        }
    };

    const getUserInitial = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name[0].toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };

    const getUserDisplayName = () => {
        return user?.user_metadata?.full_name || user?.email || 'User';
    };

    return (
        <>
            {/* Floating Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 animate-fade-in backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-card px-4 sm:px-6 py-3">
                        <div className="flex items-center justify-between">
                            {/* Left side - Logo and Page Title */}
                            <div className="flex items-center gap-4">
                                {/* Voltaic Logo - Clickable */}
                                <button
                                    onClick={handleLogoClick}
                                    className="flex items-center gap-3 group hover:scale-105 transition-transform duration-200"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-200">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-200">
                                        Voltaic
                                    </span>
                                </button>

                                {/* Page Title - Desktop only */}
                                <div className="hidden lg:block">
                                    <span className="text-white/70 text-sm">•</span>
                                    <span className="text-white font-medium text-lg ml-3">
                                        {title}
                                    </span>
                                    {subtitle && (
                                        <span className="text-white/50 text-sm ml-2 hidden xl:inline">
                                            {subtitle}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Right side - User info and actions */}
                            <div className="flex items-center gap-3">
                                {user && (
                                    <>
                                        {/* User Avatar and Info - Desktop */}
                                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                                            {/* Avatar */}
                                            {user.user_metadata?.avatar_url ? (
                                                <img
                                                    src={user.user_metadata.avatar_url}
                                                    alt="Profile"
                                                    className="w-5 h-5 rounded-full border border-white/20"
                                                />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs border border-white/20">
                                                    {getUserInitial()}
                                                </div>
                                            )}
                                            <span className="text-sm text-gray-300 truncate max-w-[150px]">
                                                {getUserDisplayName()}
                                            </span>
                                        </div>

                                        {/* Sign out button */}
                                        <GlassButton
                                            onClick={handleSignOut}
                                            variant="light"
                                            className="p-2 hover:bg-red-500/20 hover:border-red-400/30 transition-colors duration-200"
                                            title="Sign out"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </GlassButton>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Page Title Bar */}
            <div className="lg:hidden fixed top-[72px] left-0 right-0 z-40 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
                        <h1 className="text-lg font-bold text-white">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-gray-300 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
} 