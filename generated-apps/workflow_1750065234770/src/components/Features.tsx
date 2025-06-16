import { CheckCircle, Users, Zap, BarChart } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: <CheckCircle className="h-6 w-6 text-blue-500" />,
      title: 'Intuitive Task Organization',
      description: 'Drag-and-drop interface with customizable categories and visual priority tags.',
    },
    {
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      title: 'Seamless Synchronization',
      description: 'Access your tasks from anywhere, on any device with real-time syncing.',
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: 'Real-Time Collaboration',
      description: 'Work together with your team, share updates, and communicate efficiently.',
    },
    {
      icon: <BarChart className="h-6 w-6 text-blue-500" />,
      title: 'Advanced Analytics',
      description: 'Track productivity trends and receive personalized insights.',
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Powerful Features for Enhanced Productivity
          </h2>
          <p className="mt-4 text-gray-600">
            Everything you need to manage tasks effectively and boost your productivity
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm transition-all hover:shadow-lg"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}