import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services - Sudo CTI',
  description: 'Comprehensive cyber threat intelligence services for utilities and critical infrastructure.',
}

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-display font-bold text-primary mb-8">Our Services</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-body text-gray-600 mb-6">
            Sudo CTI offers comprehensive cyber threat intelligence services tailored for the 
            utility sector and critical infrastructure organizations.
          </p>
        </div>
      </div>
    </div>
  )
}

