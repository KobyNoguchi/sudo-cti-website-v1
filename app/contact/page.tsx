'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    organization: '',
    email: '',
    phoneNumber: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Form submission logic (same as original)
    try {
      const response = await fetch('https://formspree.io/f/xnnbjeep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          message: `New briefing request from ${formData.fullName}
            
Organization: ${formData.organization}
Email: ${formData.email}
Phone: ${formData.phoneNumber || 'Not provided'}
Submitted: ${new Date().toISOString()}`,
          _replyto: formData.email,
          _subject: 'New Briefing Request - Sudo CTI',
          _to: 'koby.noguchi@sudocti.com'
        })
      })

      if (response.ok) {
        alert('Thank you! Your briefing request has been received. We will contact you soon.')
        setFormData({ fullName: '', organization: '', email: '', phoneNumber: '' })
        setIsModalOpen(false)
      } else {
        throw new Error('Failed to send')
      }
    } catch (error) {
      console.error('Error sending form:', error)
      alert('There was an error submitting your request. Please try again or email us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Your Briefing"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="full-name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
              Organization
            </label>
            <input
              type="text"
              id="organization"
              required
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone-number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

