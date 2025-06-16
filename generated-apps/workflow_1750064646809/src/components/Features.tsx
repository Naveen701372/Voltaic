import { Activity, Users, ChartBar, Utensils } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Personalized Workout Plans",
      description: "Custom fitness routines tailored to your goals and progress"
    },
    {
      icon: <ChartBar className="w-8 h-8" />,
      title: "Real-Time Progress Tracking",
      description: "Monitor your improvements with detailed analytics and insights"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Forum",
      description: "Connect with like-minded individuals on your fitness journey"
    },
    {
      icon: <Utensils className="w-8 h-8" />,
      title: "Nutrition Guides",
      description: "Comprehensive meal plans to complement your workouts"
    }
  ]

  return (
    <section className="px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="backdrop-blur-lg bg-white/10 rounded-xl p-6 shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-white mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/80">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}