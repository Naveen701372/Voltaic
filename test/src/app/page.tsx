'use client';

import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Navbar } from '../components/Navbar';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <Navbar />
            <section id="hero">
                <Hero title="SyncroFlow" />
            </section>
            <section id="features">
                <Features />
            </section>
        </div>
    );
}