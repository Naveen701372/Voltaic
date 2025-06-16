import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="container mx-auto px-6">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="relative space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Simplify Your Tasks,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Amplify Your Productivity
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Transform the way you manage tasks with our intuitive and powerful task management platform. Stay organized, collaborate seamlessly, and achieve more.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <button className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 font-medium text-white hover:text-white">
                <span className="relative rounded-lg bg-white/10 px-6 py-3 transition-all duration-75 ease-in group-hover:bg-opacity-0">
                  Get Started
                  <ArrowRight className="ml-2 inline-block h-4 w-4" />
                </span>
              </button>
              <button className="rounded-lg border border-gray-300 bg-white/50 px-6 py-3 font-medium text-gray-600 backdrop-blur-sm transition-colors hover:bg-gray-50">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Glass morphism decorative elements */}
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl"></div>
    </section>
  )
}