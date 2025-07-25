'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { Zap } from 'lucide-react';

export default function SignInPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signInWithGoogle } = useAuth();
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        // Get the next parameter from URL to preserve redirect after signin
        const searchParams = new URLSearchParams(window.location.search);
        const next = searchParams.get('next') || '/dashboard';

        const { error } = await signInWithGoogle(next);

        if (error) {
            setError(error.message);
            setLoading(false);
        }
        // Don't set loading to false here as user will be redirected
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">Voltaic</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome to Voltaic</h1>
                    <p className="text-white/70">Sign in to start building the future</p>
                </div>

                <GlassCard className="p-8">
                    {/* Google Sign In */}
                    <GlassButton
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full mb-6 bg-white/10 hover:bg-white/20"
                    >
                        <div className="flex items-center justify-center gap-3">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            {loading ? 'Signing in...' : 'Continue with Google'}
                        </div>
                    </GlassButton>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 mb-6">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Terms and Privacy */}
                    <p className="text-xs text-white/50 text-center mb-6">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Privacy Policy
                        </Link>
                    </p>

                    {/* Back to home link */}
                    <div className="text-center">
                        <Link
                            href="/"
                            className="text-sm text-white/60 hover:text-white/80 transition-colors"
                        >
                            ← Back to home
                        </Link>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
} 