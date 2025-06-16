'use client'
import { Menu } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed w-full top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-lg bg-white/10 rounded-full px-6 py-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">
              FitForge Pro
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-white hover:text-white/80 transition-colors">Home</a>
              <a href="#" className="text-white hover:text-white/80 transition-colors">Features</a>
              <a href="#" className="text-white hover:text-white/80 transition-colors">Pricing</a>
              <a href="#" className="text-white hover:text-white/80 transition-colors">Community</a>
              <button className="px-6 py-2 bg-white text-purple-600 rounded-full font-semibold hover:bg-opacity-90 transition-all">
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-white/20">
              <div className="flex flex-col gap-4">
                <a href="#" className="text-white hover:text-white/80 transition-colors">Home</a>
                <a href="#" className="text-white hover:text-white/80 transition-colors">Features</a>
                <a href="#" className="text-white hover:text-white/80 transition-colors">Pricing</a>
                <a href="#" className="text-white hover:text-white/80 transition-colors">Community</a>
                <button className="px-6 py-2 bg-white text-purple-600 rounded-full font-semibold hover:bg-opacity-90 transition-all">
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}