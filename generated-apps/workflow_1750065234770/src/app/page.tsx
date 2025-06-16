import { Hero } from '../components/Hero'
import { Features } from '../components/Features'
import { Navbar } from '../components/Navbar'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="relative z-0 overflow-hidden">
        <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200 via-indigo-200 to-purple-100 opacity-30"></div>
        <Navbar />
        <Hero />
        <Features />
        
        {/* Footer Section */}
        <footer className="mt-20 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center text-gray-600">
              <p>© 2024 TaskFlow Pro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}