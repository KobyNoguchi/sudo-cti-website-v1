'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Shield, Award } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '500+',
    label: 'Fortune 500 Utilities',
    description: 'Trusted by leading utility companies',
  },
  {
    icon: Shield,
    value: '24/7',
    label: 'Threat Monitoring',
    description: 'Continuous surveillance and analysis',
  },
  {
    icon: TrendingUp,
    value: '99%',
    label: 'Accuracy Rate',
    description: 'Precision in threat detection',
  },
  {
    icon: Award,
    value: '4+',
    label: 'Years Experience',
    description: 'Deep industry expertise',
  },
]

export default function Stats() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-display font-bold text-white mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-body text-white/90 max-w-2xl mx-auto">
            Our platform delivers actionable intelligence that helps organizations stay ahead of
            evolving cyber threats.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
              <div className="text-sm text-white/80">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

