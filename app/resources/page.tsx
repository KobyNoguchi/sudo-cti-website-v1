import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources - Sudo CTI',
  description: 'Access threat intelligence reports, whitepapers, case studies, and other cybersecurity resources.',
}

export default function ResourcesPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-display font-bold text-primary mb-8">Resources</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-body text-gray-600 mb-6">
            Access our library of threat intelligence reports, whitepapers, case studies, and 
            other cybersecurity resources designed to help you stay informed about the latest 
            threats and best practices.
          </p>
        </div>
      </div>
    </div>
  )
}

