'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import BriefingModal from '@/components/auth/BriefingModal'

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-display font-bold text-primary mb-8">Contact Us</h1>
        <div className="prose prose-lg max-w-none mb-8">
          <p className="text-body text-gray-600 mb-6">
            Get in touch with our team to learn more about how Sudo CTI can help protect your 
            critical infrastructure from cyber threats.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
          Schedule Your Briefing
        </Button>
      </div>

      <BriefingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

