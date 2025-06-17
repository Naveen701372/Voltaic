'use client';

import { Sparkles, Zap, Shield } from 'lucide-react';

export function Features() {
    const features = [
        {
            icon: Sparkles,
            title: 'Modern Design',
            description: 'Beautiful glass morphism UI with smooth animations'
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Optimized performance for the best user experience'
        },
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Enterprise-grade security and 99.9% uptime'
        }
    ];

    return (
        <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-white text-center mb-16">
                    Why Choose Us
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
                            <feature.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                            <p className="text-white/70">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}