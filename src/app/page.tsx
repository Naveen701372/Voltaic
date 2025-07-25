'use client';

import { Sparkles, Zap, Code, Rocket, ArrowRight, Github, Twitter, Menu, LogOut } from 'lucide-react';
import { setupChunkErrorHandler } from '@/lib/chunk-error-handler';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  // Initialize chunk error handler
  useEffect(() => {
    setupChunkErrorHandler();
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ideaInput, setIdeaInput] = useState('');
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // User will stay on homepage after signing out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGenerateMVP = () => {
    if (!ideaInput.trim()) {
      const inputElement = document.querySelector('.homepage-idea-input') as HTMLInputElement;
      inputElement?.focus();
      return;
    }

    localStorage.setItem('voltaic_pending_idea', ideaInput.trim());

    if (user) {
      router.push('/create');
    } else {
      router.push('/auth/signin?next=/create');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGenerateMVP();
    }
  };

  const getUserInitial = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email || 'User';
  };

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
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 animate-fade-in backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-white">Voltaic</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-white/70 hover:text-white transition-colors">
                  Features
                </a>

                {!loading && (
                  <>
                    {user ? (
                      // Authenticated user - show avatar and sign out
                      <>
                        <button
                          onClick={() => router.push('/dashboard')}
                          className="text-white/70 hover:text-white transition-colors"
                        >
                          Dashboard
                        </button>

                        {/* User Avatar and Info */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                          {user.user_metadata?.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              alt="Profile"
                              className="w-5 h-5 rounded-full border border-white/20"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs border border-white/20">
                              {getUserInitial()}
                            </div>
                          )}
                          <span className="text-sm text-gray-300 truncate max-w-[150px]">
                            {getUserDisplayName()}
                          </span>
                        </div>

                        <button
                          onClick={handleSignOut}
                          className="flex items-center justify-center w-9 h-9 text-white/70 hover:text-white hover:bg-red-500/20 rounded-lg border border-white/20 hover:border-red-400/30 transition-all duration-200"
                          title="Sign out"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      // Non-authenticated user - show sign in options
                      <>
                        <a href="/auth/signin" className="text-white/70 hover:text-white transition-colors">
                          Sign In
                        </a>
                        <a href="/auth/signin">
                          <button className="glass-button glass-button-primary px-4 py-2 text-sm">
                            Get Started
                          </button>
                        </a>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden glass-button p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-white/20">
                <div className="flex flex-col space-y-3">
                  <a href="#features" className="text-white/70 hover:text-white transition-colors py-2">
                    Features
                  </a>

                  {!loading && (
                    <>
                      {user ? (
                        // Authenticated user mobile menu
                        <>
                          <button
                            onClick={() => router.push('/dashboard')}
                            className="text-white/70 hover:text-white transition-colors py-2 text-left"
                          >
                            Dashboard
                          </button>

                          {/* Mobile User Info */}
                          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                            {user.user_metadata?.avatar_url ? (
                              <img
                                src={user.user_metadata.avatar_url}
                                alt="Profile"
                                className="w-5 h-5 rounded-full border border-white/20"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs border border-white/20">
                                {getUserInitial()}
                              </div>
                            )}
                            <span className="text-sm text-gray-300 truncate">
                              {getUserDisplayName()}
                            </span>
                          </div>

                          <button
                            onClick={handleSignOut}
                            className="flex items-center justify-center w-9 h-9 text-white/70 hover:text-white hover:bg-red-500/20 rounded-lg border border-white/20 hover:border-red-400/30 transition-all duration-200"
                            title="Sign out"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        // Non-authenticated user mobile menu
                        <>
                          <a href="/auth/signin" className="text-white/70 hover:text-white transition-colors py-2">
                            Sign In
                          </a>
                          <a href="/auth/signin">
                            <button className="glass-button glass-button-primary px-4 py-2 text-sm mt-2">
                              Get Started
                            </button>
                          </a>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 py-20 sm:py-24 lg:py-40 pt-28 sm:pt-32 lg:pt-40">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 mb-8 sm:mb-12 rounded-full glass-card">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-xs sm:text-sm text-white/80">Now in Beta - Join the Revolution</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-white mb-8 sm:mb-12 leading-tight max-w-6xl mx-auto">
              Transform Ideas into
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Reality with AI
              </span>
            </h1>

            <p className="text-lg sm:text-2xl text-white/70 mb-12 sm:mb-16 max-w-4xl mx-auto leading-relaxed px-4">
              Voltaic is the next-generation AI-powered MVP generator that transforms your ideas into
              production-ready applications with stunning glass morphism UI in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-20 sm:mb-24 px-4">
              <a href="/auth/signin" className="w-full sm:w-auto">
                <button className="glass-button w-full sm:min-w-56 whitespace-nowrap px-8 py-4 text-lg">
                  <span className="flex items-center justify-center gap-2">
                    Start Building Free
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </button>
              </a>
              <a href="https://github.com/Naveen701372/Voltaic" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <button className="glass-button glass-button-dark w-full sm:min-w-56 whitespace-nowrap px-8 py-4 text-lg">
                  <span className="flex items-center justify-center gap-2">
                    <Github className="w-5 h-5" />
                    View on GitHub
                  </span>
                </button>
              </a>
            </div>
          </div>

          {/* Demo Card */}
          <div className="max-w-5xl mx-auto animate-slide-up animation-delay-200">
            <div className="glass-card p-6 sm:p-10">
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Try it out</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <input
                  className="glass-input w-full text-base sm:text-xl py-4 sm:py-5 homepage-idea-input"
                  placeholder="Describe your MVP idea... (e.g., A social platform for developers)"
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                />
                <div className="flex justify-end">
                  <button
                    className="glass-button whitespace-nowrap px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                    onClick={handleGenerateMVP}
                  >
                    <span className="flex items-center gap-2">
                      Generate MVP
                      <Sparkles className="w-5 h-5" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
              Why Choose Voltaic?
            </h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto px-4">
              Built for developers, by developers. Experience the future of rapid prototyping.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="glass-card p-6 sm:p-8 h-full text-center">
                  <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
                    <div className="text-blue-400">{feature.icon}</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-white/70 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="glass-card p-8 sm:p-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 whitespace-nowrap">
                Ready to Build the Future?
              </h2>
              <p className="text-base sm:text-lg text-white/70 mb-8 sm:mb-10 max-w-2xl mx-auto">
                Join thousands of developers who are already building faster with AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <a href="/auth/signin" className="w-full sm:w-auto">
                  <button className="glass-button w-full sm:min-w-56 whitespace-nowrap px-8 py-4 text-lg">
                    Start Free Trial
                  </button>
                </a>
                <a href="/auth/signin" className="w-full sm:w-auto">
                  <button className="glass-button glass-button-dark w-full sm:min-w-56 whitespace-nowrap px-8 py-4 text-lg">
                    Schedule Demo
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-4 sm:px-6 py-8 sm:py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-6 sm:space-y-0 sm:flex-row sm:justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">Voltaic</span>
            </div>

            {/* Social Links and Copyright */}
            <div className="flex flex-col items-center space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-6">
              <div className="flex items-center space-x-6">
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
              <span className="text-white/40 text-sm text-center">© 2024 Voltaic. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
