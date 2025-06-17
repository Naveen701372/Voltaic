'use client';

interface HeroProps {
    title: string;
}

export function Hero({ title }: HeroProps) {
    return (
        <section className="pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6">
                    {title}
                </h1>
                <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
                    Experience the future of modern web applications with our cutting-edge platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/30 transition-all duration-300">
                        Get Started
                    </button>
                    <button className="px-8 py-4 border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/10 transition-all duration-300">
                        Learn More
                    </button>
                </div>
            </div>
        </section>
    );
}