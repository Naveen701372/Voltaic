'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import PromptInterface to avoid SSR issues
const PromptInterface = dynamic(() => import('@/components/ai/PromptInterface'), {
    ssr: false,
    loading: () => (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
    )
});

export default function CreatePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [initialIdea, setInitialIdea] = useState<string | null>(null);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/signin');
            } else {
                // Check for pending idea from homepage
                const pendingIdea = localStorage.getItem('voltaic_pending_idea');
                if (pendingIdea) {
                    setInitialIdea(pendingIdea);
                    // Clear the pending idea from localStorage
                    localStorage.removeItem('voltaic_pending_idea');
                }
                setIsLoading(false);
            }
        }
    }, [user, loading, router]);

    if (loading || isLoading) {
        return (
            <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect to signin
    }

    return <PromptInterface initialIdea={initialIdea} />;
} 