'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassButton } from '@/components/glass/GlassButton';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await signIn(email, password);
            // Redirect will be handled by the auth context
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-300">Sign in to your Voltaic account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <GlassInput
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={setEmail}
                            required
                        />

                        <div className="relative">
                            <GlassInput
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={setPassword}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <GlassButton
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </GlassButton>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-300">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="text-center">
                            <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                                ← Back to home
                            </Link>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
} 