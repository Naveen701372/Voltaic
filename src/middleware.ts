import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
    let res = NextResponse.next();

    // Skip middleware for API routes - let them handle their own auth
    if (req.nextUrl.pathname.startsWith('/api/')) {
        return res;
    }

    // Skip middleware for auth routes to prevent redirect loops
    if (req.nextUrl.pathname.startsWith('/auth/') || req.nextUrl.pathname === '/') {
        return res;
    }

    // Check for protected routes
    const protectedPaths = ['/create', '/projects', '/dashboard'];
    const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

    if (isProtectedPath) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return req.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        res.cookies.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        res.cookies.set({ name, value: '', ...options });
                    },
                },
            }
        );

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // Redirect to sign-in page with the original URL as a redirect parameter
                const redirectUrl = new URL('/auth/signin', req.url);
                redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
                return NextResponse.redirect(redirectUrl);
            }
        } catch (error) {
            console.error('Middleware auth error:', error);
            // If there's an auth error, redirect to sign-in
            const redirectUrl = new URL('/auth/signin', req.url);
            redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
            return NextResponse.redirect(redirectUrl);
        }
    }

    return res;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}; 