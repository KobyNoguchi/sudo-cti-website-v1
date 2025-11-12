import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Sudo CTI',
  description: 'Learn about Sudo CTI and our mission to provide purpose-built cyber threat intelligence for critical infrastructure.',
}

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-display font-bold text-primary mb-8">About Sudo CTI</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-body text-gray-600 mb-6">
            Sudo CTI is a specialized cyber threat intelligence platform designed specifically for 
            utilities and critical infrastructure organizations. Founded by experienced threat 
            intelligence analysts, we understand the unique challenges facing the utility sector.
          </p>
          <p className="text-body text-gray-600 mb-6">
            Our mission is to provide actionable intelligence that helps organizations stay ahead 
            of evolving cyber threats targeting critical infrastructure. We combine real-time 
            threat monitoring with deep industry expertise to deliver strategic visibility and 
            tactical guidance.
          </p>
        </div>
      </div>
    </div>
  )
}

