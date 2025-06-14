import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Legacy client for non-auth operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Browser client for client-side auth
export const createSupabaseBrowserClient = () => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Auth configuration
export const authConfig = {
    providers: {
        google: {
            enabled: true,
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
        email: {
            enabled: true,
            confirmEmail: true,
            magicLink: true,
        },
    },
    redirects: {
        signIn: '/auth/signin',
        signUp: '/auth/signup',
        signOut: '/',
        callback: '/auth/callback',
        error: '/auth/error',
    },
    ui: {
        theme: 'dark',
        className: 'glass-auth',
    },
}; 