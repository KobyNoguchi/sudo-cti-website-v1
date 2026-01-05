import type { Metadata } from 'next'
import { FileText, BookOpen, AlertTriangle, Shield, Download, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Resources - Sudo CTI',
  description: 'Access threat intelligence reports, whitepapers, case studies, and other cybersecurity resources.',
}

const resourceCategories = [
  {
    icon: AlertTriangle,
    title: 'Threat Reports',
    description: 'In-depth analysis of emerging threats targeting critical infrastructure and OT environments.',
    items: [
      { title: 'Q4 2025 Ransomware Landscape Report', type: 'PDF', status: 'New' },
      { title: 'APT Groups Targeting U.S. Utilities', type: 'PDF', status: null },
      { title: 'ICS Vulnerability Digest - December 2025', type: 'PDF', status: null },
    ],
  },
  {
    icon: BookOpen,
    title: 'Whitepapers',
    description: 'Strategic insights and best practices for securing critical infrastructure.',
    items: [
      { title: 'Building an OT-Focused Threat Intelligence Program', type: 'PDF', status: 'Featured' },
      { title: 'Zero Trust Architecture for Utility Networks', type: 'PDF', status: null },
      { title: 'Incident Response Playbook for ICS Environments', type: 'PDF', status: null },
    ],
  },
  {
    icon: FileText,
    title: 'Case Studies',
    description: 'Real-world examples of threat detection and response in the utility sector.',
    items: [
      { title: 'Detecting Supply Chain Compromise in SCADA Systems', type: 'PDF', status: null },
      { title: 'Ransomware Prevention: A Regional Utility Success Story', type: 'PDF', status: null },
    ],
  },
]

const quickLinks = [
  { title: 'CISA ICS Advisories', href: 'https://www.cisa.gov/uscert/ics/advisories', external: true },
  { title: 'NERC CIP Standards', href: 'https://www.nerc.com/pa/Stand/Pages/CIPStandards.aspx', external: true },
  { title: 'ICS-CERT', href: 'https://www.cisa.gov/uscert/ics', external: true },
]

export default function ResourcesPage() {
  return (
    <div className="pb-24">
      {/* Hero Section - Dark Theme */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary pt-32 pb-16">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,102,255,0.3),transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary-dark/70 to-primary/90" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary mb-6">
            Intelligence Library
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-balance">
            Resources & <span className="text-secondary">Threat Intelligence</span>
          </h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto mb-8">
            Access our library of threat intelligence reports, whitepapers, case studies, and 
            other cybersecurity resources designed to help you stay informed about the latest 
            threats and best practices.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg" href="/contact">
              Request Custom Report
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Subscribe to Updates
            </Button>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {resourceCategories.map((category) => (
              <div
                key={category.title}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary to-primary-dark">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <category.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{category.title}</h2>
                  </div>
                  <p className="mt-3 text-white/80 text-sm">{category.description}</p>
                </div>
                <div className="p-4">
                  <ul className="space-y-3">
                    {category.items.map((item) => (
                      <li key={item.title}>
                        <a
                          href="#"
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-400 group-hover:text-secondary transition-colors" />
                            <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                              {item.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status && (
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                item.status === 'New' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-secondary/10 text-secondary'
                              }`}>
                                {item.status}
                              </span>
                            )}
                            <Download className="w-4 h-4 text-gray-300 group-hover:text-secondary transition-colors" />
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-secondary" />
              <h2 className="text-2xl font-bold text-white">External Resources</h2>
            </div>
            <p className="text-white/80 mb-8">
              Recommended resources from government agencies and industry organizations for critical infrastructure security.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
                >
                  <span className="text-white font-medium">{link.title}</span>
                  <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-secondary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Need Custom Intelligence?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our analysts can prepare tailored threat reports specific to your organization&apos;s 
            infrastructure, threat landscape, and operational requirements.
          </p>
          <Button variant="primary" size="lg" href="/contact">
            Contact Our Team
          </Button>
        </div>
      </section>
    </div>
  )
}

