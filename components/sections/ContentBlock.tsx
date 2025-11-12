'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Button from '@/components/ui/Button'

interface ContentBlockProps {
  image: string
  imageAlt: string
  title: string
  content: string
  reverse?: boolean
  buttonText?: string
  buttonHref?: string
}

export default function ContentBlock({
  image,
  imageAlt,
  title,
  content,
  reverse = false,
  buttonText,
  buttonHref,
}: ContentBlockProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col ${
            reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
          } items-center gap-12`}
        >
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h2 className="text-display font-bold text-primary mb-6">{title}</h2>
            <p className="text-body text-gray-600 mb-8 leading-relaxed">{content}</p>
            {buttonText && (
              <Button variant="primary" size="md" href={buttonHref}>
                {buttonText}
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

