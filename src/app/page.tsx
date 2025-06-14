'use client';

import { Sparkles, Zap, Code, Rocket, ArrowRight, Github, Twitter } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered Development',
      description: 'Generate complete MVPs with intelligent code generation and architecture decisions.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'From idea to deployment in minutes, not weeks. Rapid prototyping at its finest.',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Production Ready',
      description: 'Clean, scalable code with best practices baked in. No technical debt.',
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'One-Click Deploy',
      description: 'Seamless deployment to popular platforms with integrated CI/CD.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 animate-fade-in backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Voltaic</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-white/70 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-white/70 hover:text-white transition-colors">
                  Pricing
                </a>
                <a href="#docs" className="text-white/70 hover:text-white transition-colors">
                  Docs
                </a>
                <button className="glass-button glass-button-primary px-4 py-2 text-sm">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 sm:py-32 pt-28 sm:pt-36">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full glass-card">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm text-white/80">Now in Beta - Join the Revolution</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6">
              Transform Ideas into
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Reality with AI
              </span>
            </h1>

            <p className="text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Voltaic is the next-generation AI-powered MVP generator that transforms your ideas into
              production-ready applications with stunning glass morphism UI in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button className="glass-button min-w-48 whitespace-nowrap px-6 py-3">
                <span className="flex items-center gap-2">
                  Start Building Free
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
              <button className="glass-button glass-button-dark min-w-48 whitespace-nowrap px-6 py-3">
                <span className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  View on GitHub
                </span>
              </button>
            </div>
          </div>

          {/* Demo Card */}
          <div className="max-w-4xl mx-auto animate-slide-up animation-delay-200">
            <div className="glass-card p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Try it out</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <input
                  className="glass-input w-full text-lg py-4"
                  placeholder="Describe your MVP idea... (e.g., A social platform for developers)"
                />
                <div className="flex justify-end">
                  <button className="glass-button whitespace-nowrap px-6 py-3">
                    <span className="flex items-center gap-2">
                      Generate MVP
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Why Choose Voltaic?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Built for developers, by developers. Experience the future of rapid prototyping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="glass-card p-6 h-full">
                  <div className="text-blue-400 mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="glass-card p-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Build the Future?
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Join thousands of developers who are already building faster with AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="glass-button min-w-48 whitespace-nowrap px-6 py-3">
                  Start Free Trial
                </button>
                <button className="glass-button glass-button-dark min-w-48 whitespace-nowrap px-6 py-3">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Voltaic</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <span className="text-white/40 text-sm">© 2024 Voltaic. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
