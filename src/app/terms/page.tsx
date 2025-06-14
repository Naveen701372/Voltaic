import { GlassCard } from '@/components/glass/GlassCard';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
                        Terms of Service
                    </h1>
                    <p className="text-xl text-gray-300">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    <GlassCard className="p-8">
                        <div className="prose prose-invert max-w-none">
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-300 mb-6">
                                By accessing and using Voltaic ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                            <p className="text-gray-300 mb-6">
                                Voltaic is an AI-powered MVP generator platform that helps users create and deploy minimum viable products quickly and efficiently.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                            <p className="text-gray-300 mb-6">
                                To access certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
                            <p className="text-gray-300 mb-6">
                                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
                            </p>
                            <ul className="text-gray-300 mb-6 list-disc list-inside space-y-2">
                                <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
                                <li>To generate harmful, offensive, or inappropriate content</li>
                                <li>To interfere with or disrupt the Service or servers or networks connected to the Service</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
                            <p className="text-gray-300 mb-6">
                                The Service and its original content, features, and functionality are and will remain the exclusive property of Voltaic and its licensors. The Service is protected by copyright, trademark, and other laws.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">6. Privacy Policy</h2>
                            <p className="text-gray-300 mb-6">
                                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
                            <p className="text-gray-300 mb-6">
                                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer</h2>
                            <p className="text-gray-300 mb-6">
                                The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to Terms</h2>
                            <p className="text-gray-300 mb-6">
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                            </p>

                            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Information</h2>
                            <p className="text-gray-300 mb-6">
                                If you have any questions about these Terms of Service, please contact us at support@voltaic.app
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