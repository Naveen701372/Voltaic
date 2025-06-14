import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Voltaic - AI-Powered MVP Generator',
  description: 'Transform your ideas into production-ready MVPs with AI-powered development, stunning glass morphism UI, and seamless deployment.',
  keywords: ['AI', 'MVP', 'Generator', 'Development', 'Glass Morphism', 'Next.js'],
  authors: [{ name: 'Voltaic Team' }],
  creator: 'Voltaic',
  publisher: 'Voltaic',
  metadataBase: new URL('http://localhost:3000'),
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Voltaic - AI-Powered MVP Generator',
    description: 'Transform your ideas into production-ready MVPs with AI-powered development.',
    type: 'website',
    locale: 'en_US',
    url: 'http://localhost:3000',
    siteName: 'Voltaic',
    images: [
      {
        url: '/logo-512.png',
        width: 512,
        height: 512,
        alt: 'Voltaic Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voltaic - AI-Powered MVP Generator',
    description: 'Transform your ideas into production-ready MVPs with AI-powered development.',
    images: ['/logo-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased font-sans bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <div className="relative min-h-screen">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />

              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-10 opacity-50">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply animate-pulse" />
                  <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply animate-pulse animation-delay-2000" />
                  <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply animate-pulse animation-delay-4000" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
