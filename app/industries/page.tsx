import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Industries - Sudo CTI',
  description: 'Cyber threat intelligence solutions for energy, utilities, and critical infrastructure industries.',
}

export default function IndustriesPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-display font-bold text-primary mb-8">Industries We Serve</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-body text-gray-600 mb-6">
            Sudo CTI specializes in providing cyber threat intelligence for utilities and critical 
            infrastructure sectors, including energy, water, and transportation.
          </p>
        </div>
      </div>
    </div>
  )
}

