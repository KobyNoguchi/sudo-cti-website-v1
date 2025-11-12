'use client'

import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

interface CTAProps {
  title: string
  description: string
  buttonText: string
  buttonHref?: string
  variant?: 'primary' | 'secondary'
}

export default function CTA({
  title,
  description,
  buttonText,
  buttonHref = '#',
  variant = 'primary',
}: CTAProps) {
  const bgGradient =
    variant === 'primary'
      ? 'bg-gradient-to-r from-secondary via-secondary-light to-secondary-dark'
      : 'bg-gradient-to-r from-primary via-primary-dark to-primary'

  return (
    <section className={`py-24 ${bgGradient} relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-display font-bold text-white mb-6 text-balance">
            {title}
          </h2>
          <p className="text-body text-white/90 mb-10 max-w-2xl mx-auto">
            {description}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="secondary"
              size="lg"
              href={buttonHref}
              className="bg-white text-primary hover:bg-gray-100 group"
            >
              {buttonText}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

