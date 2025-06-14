import { GlassCard } from '@/components/glass/GlassCard';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8 text-white hover:text-purple-300 transition-colors">
                        <Zap className="w-8 h-8" />
                        <span className="text-2xl font-bold">Voltaic</span>
                    </Link>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-gray-300">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    <GlassCard className="p-8">
                        <div className="prose prose-invert max-w-none">
                            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                            <p className="text-gray-300 mb-6">
                                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-300 mb-6">
                                We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
                            <p className="text-gray-300 mb-6">
                                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                            <p className="text-gray-300 mb-6">
                                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">5. Google OAuth</h2>
                            <p className="text-gray-300 mb-6">
                                When you sign in with Google, we receive basic profile information including your name, email address, and profile picture. This information is used solely for authentication and account management purposes.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking</h2>
                            <p className="text-gray-300 mb-6">
                                We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns. You can control cookie settings through your browser.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
                            <p className="text-gray-300 mb-6">
                                You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">8. Changes to This Policy</h2>
                            <p className="text-gray-300 mb-6">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
                            <p className="text-gray-300 mb-6">
                                If you have any questions about this Privacy Policy, please contact us at privacy@voltaic.app
                            </p>
                        </div>
                    </GlassCard>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
} 