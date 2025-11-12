'use client'

import { motion } from 'framer-motion'
import { Shield, Search, BarChart3 } from 'lucide-react'
import Card from '@/components/ui/Card'

const features = [
  {
    icon: Shield,
    title: 'Proactive Threat Monitoring',
    description:
      'Stay informed with real-time alerts and insights into emerging threats targeting the Utility sector.',
  },
  {
    icon: Search,
    title: 'Vulnerability Management',
    description:
      'Identify and prioritize vulnerabilities with detailed risk assessments and remediation guidance.',
  },
  {
    icon: BarChart3,
    title: 'Executive Reporting',
    description:
      'Generate clear, concise reports for executives, summarizing key threats and their potential impact.',
  },
]

export default function Features() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-display font-bold text-primary mb-4">
            Comprehensive Threat Intelligence Platform
          </h2>
          <p className="text-body text-gray-600 max-w-3xl mx-auto">
            Our platform combines real-time threat intelligence with deep industry expertise to
            provide the strategic visibility and tactical guidance your organization needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:scale-[1.02] transition-transform duration-300">
                <div className="flex flex-col items-start gap-4">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <feature.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-heading font-semibold text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

