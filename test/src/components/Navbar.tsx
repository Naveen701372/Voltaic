'use client';

interface NavbarProps {
    title?: string;
}

export function Navbar({ title = "SyncroFlow" }: NavbarProps) {
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
            <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white cursor-pointer"
                         onClick={() => scrollToSection('hero')}>
                        {title}
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <button 
                            onClick={() => scrollToSection('hero')}
                            className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            Home
                        </button>
                        <button 
                            onClick={() => scrollToSection('features')}
                            className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            Features
                        </button>
                        <button 
                            onClick={() => scrollToSection('about')}
                            className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            About
                        </button>
                        <button 
                            onClick={() => scrollToSection('contact')}
                            className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            Contact
                        </button>
                    </div>
                    <button className="px-6 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300">
                        Sign Up
                    </button>
                </div>
            </div>
        </nav>
    );
}