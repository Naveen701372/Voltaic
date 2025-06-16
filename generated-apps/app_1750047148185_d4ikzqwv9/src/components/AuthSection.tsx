'use client';

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
}