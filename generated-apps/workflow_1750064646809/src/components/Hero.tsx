import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Transform Your Fitness Journey
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Personalized Plans & Community Support to Reach Your Health Goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white/20 text-white rounded-full font-semibold hover:bg-white/30 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}