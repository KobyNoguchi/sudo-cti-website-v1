'use client'

import Link from 'next/link'
import { Shield, ChevronRight, Building2, AlertTriangle, Database } from 'lucide-react'

// Import vulnerability data
import siemensData from '@/data/siemens-vulnerabilities.json'
import hitachiData from '@/data/hitachi-vulnerabilities.json'

// Calculate stats from actual data
const siemensStats = {
  advisories: siemensData.vulnerabilities.length,
  critical: siemensData.vulnerabilities.filter((v: any) => {
    const score = v.cvss_v3_score ?? v.cvss_v4_score
    return score !== null && score >= 9.0
  }).length,
  high: siemensData.vulnerabilities.filter((v: any) => {
    const score = v.cvss_v3_score ?? v.cvss_v4_score
    return score !== null && score >= 7.0 && score < 9.0
  }).length,
}

const hitachiStats = {
  advisories: hitachiData.vulnerabilities.length,
  critical: hitachiData.vulnerabilities.filter((v: any) => {
    const scores = Object.values(v.cvss_scores || {}) as number[]
    return scores.some(score => score >= 9.0)
  }).length,
  high: hitachiData.vulnerabilities.filter((v: any) => {
    const scores = Object.values(v.cvss_scores || {}) as number[]
    return scores.some(score => score >= 7.0 && score < 9.0)
  }).length,
}

// Vendor data - add more vendors here as you expand
const vendors = [
  {
    id: 'siemens',
    name: 'Siemens',
    description: 'Industrial automation, energy management, and building technologies',
    logo: '/Assets/vendor-logos/siemens.svg',
    color: 'from-teal-500 to-cyan-600',
    stats: siemensStats,
    industries: ['Energy', 'Manufacturing', 'Building Technologies', 'Healthcare'],
    href: '/vulnerabilities/siemens',
  },
  {
    id: 'hitachi',
    name: 'Hitachi',
    description: 'IT infrastructure, operational technology, and industrial software solutions',
    logo: '/Assets/vendor-logos/hitachi.svg',
    color: 'from-red-500 to-rose-600',
    stats: hitachiStats,
    industries: ['IT Infrastructure', 'Manufacturing', 'Energy', 'Transportation'],
    href: '/vulnerabilities/hitachi',
  },
  // Future vendors can be added here:
  // {
  //   id: 'schneider',
  //   name: 'Schneider Electric',
  //   description: 'Digital transformation of energy management and automation',
  //   color: 'from-green-500 to-emerald-600',
  //   stats: { advisories: 0, critical: 0, high: 0 },
  //   industries: ['Energy', 'Industry', 'Data Centers'],
  //   href: '/vulnerabilities/schneider',
  //   comingSoon: true,
  // },
  // {
  //   id: 'rockwell',
  //   name: 'Rockwell Automation',
  //   description: 'Industrial automation and digital transformation solutions',
  //   color: 'from-red-500 to-orange-600',
  //   stats: { advisories: 0, critical: 0, high: 0 },
  //   industries: ['Manufacturing', 'Oil & Gas', 'Mining'],
  //   href: '/vulnerabilities/rockwell',
  //   comingSoon: true,
  // },
]

export default function VulnerabilitiesPage() {
  const totalAdvisories = vendors.reduce((sum, v) => sum + v.stats.advisories, 0)
  const totalCritical = vendors.reduce((sum, v) => sum + v.stats.critical, 0)
  const totalHigh = vendors.reduce((sum, v) => sum + v.stats.high, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full mb-6">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">
                Vulnerability Intelligence
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              ICS/OT Vulnerability Database
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              Comprehensive security advisory tracking for industrial control systems and 
              operational technology vendors. Stay informed about vulnerabilities affecting 
              critical infrastructure.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">{totalAdvisories}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Advisories</p>
            </div>
            <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-3xl font-bold text-red-400">{totalCritical}</span>
              </div>
              <p className="text-slate-400 text-sm">Critical Severity</p>
            </div>
            <div className="bg-slate-800/50 border border-orange-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <span className="text-3xl font-bold text-orange-400">{totalHigh}</span>
              </div>
              <p className="text-slate-400 text-sm">High Severity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            Vendors
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={vendor.href}
                className="group relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all duration-300"
              >
                {/* Gradient accent */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${vendor.color} rounded-t-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 bg-gradient-to-br ${vendor.color} rounded-lg`}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {vendor.name}
                      </h3>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
                
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {vendor.description}
                </p>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{vendor.stats.advisories}</div>
                    <div className="text-xs text-slate-500">Advisories</div>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">{vendor.stats.critical}</div>
                    <div className="text-xs text-slate-500">Critical</div>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-400">{vendor.stats.high}</div>
                    <div className="text-xs text-slate-500">High</div>
                  </div>
                </div>
                
                {/* Industries */}
                <div className="flex flex-wrap gap-2">
                  {vendor.industries.slice(0, 3).map((industry) => (
                    <span
                      key={industry}
                      className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-md"
                    >
                      {industry}
                    </span>
                  ))}
                  {vendor.industries.length > 3 && (
                    <span className="px-2 py-1 text-slate-500 text-xs">
                      +{vendor.industries.length - 3} more
                    </span>
                  )}
                </div>
              </Link>
            ))}

            {/* Coming Soon Card */}
            <div className="relative bg-slate-800/30 border border-slate-700/50 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
              <div className="p-3 bg-slate-700/50 rounded-lg mb-4">
                <Building2 className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-500 mb-2">
                More Vendors Coming Soon
              </h3>
              <p className="text-slate-600 text-sm">
                Schneider Electric, Rockwell Automation, ABB, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">About This Database</h3>
            <div className="grid md:grid-cols-2 gap-6 text-slate-400">
              <div>
                <p className="mb-4">
                  This vulnerability database aggregates security advisories from major ICS/OT 
                  vendors to provide a centralized view of vulnerabilities affecting critical 
                  infrastructure systems.
                </p>
                <p>
                  Data is sourced directly from vendor CERT portals and CSAF (Common Security 
                  Advisory Framework) feeds to ensure accuracy and timeliness.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Features:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Search and filter by CVE, product, or severity
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Detailed advisory information with remediation guidance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Export to Excel for offline analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Direct links to vendor advisories
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

