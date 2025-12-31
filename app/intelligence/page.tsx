'use client'

import Link from 'next/link'
import { Shield, FileText, Bell, BarChart3, ChevronRight, Newspaper, TrendingUp } from 'lucide-react'

const intelligenceTypes = [
  {
    id: 'reports',
    name: 'Threat Reports',
    description: 'In-depth analysis of threat actors, campaigns, and malware targeting critical infrastructure',
    icon: FileText,
    color: 'from-cyan-500 to-blue-600',
    stats: { reports: 24, thisMonth: 3 },
    href: '/intelligence/reports',
  },
  {
    id: 'alerts',
    name: 'Advisory Alerts',
    description: 'Time-sensitive notifications about active threats and emerging vulnerabilities',
    icon: Bell,
    color: 'from-red-500 to-orange-600',
    stats: { active: 8, thisWeek: 2 },
    href: '/intelligence/alerts',
  },
  {
    id: 'analysis',
    name: 'Industry Analysis',
    description: 'Sector-specific threat landscape assessments and trend analysis',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-600',
    stats: { sectors: 6, reports: 12 },
    href: '/intelligence/analysis',
  },
]

export default function IntelligencePage() {
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
                Intelligence Center
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Threat Intelligence Hub
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              Access comprehensive threat intelligence resources tailored for critical infrastructure 
              and industrial control systems. Stay ahead of emerging threats with actionable insights.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Newspaper className="w-5 h-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">36</span>
              </div>
              <p className="text-slate-400 text-sm">Intelligence Reports</p>
            </div>
            <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-red-400" />
                <span className="text-3xl font-bold text-red-400">8</span>
              </div>
              <p className="text-slate-400 text-sm">Active Alerts</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-3xl font-bold text-green-400">6</span>
              </div>
              <p className="text-slate-400 text-sm">Sectors Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Types Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            Intelligence Products
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {intelligenceTypes.map((type) => {
              const Icon = type.icon
              return (
                <Link
                  key={type.id}
                  href={type.href}
                  className="group relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all duration-300"
                >
                  {/* Gradient accent */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${type.color} rounded-t-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${type.color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                    {type.name}
                  </h3>
                  
                  <p className="text-slate-400 text-sm mb-6">
                    {type.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
                    {Object.entries(type.stats).map(([key, value], idx) => (
                      <div key={key} className="flex items-center gap-4">
                        {idx > 0 && <div className="h-8 w-px bg-slate-700" />}
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{value}</div>
                          <div className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">About Our Intelligence</h3>
            <div className="grid md:grid-cols-2 gap-6 text-slate-400">
              <div>
                <p className="mb-4">
                  Sudo CTI provides threat intelligence specifically curated for organizations 
                  operating critical infrastructure and industrial control systems.
                </p>
                <p>
                  Our team of analysts monitors threat actors, campaigns, and vulnerabilities 
                  to deliver actionable intelligence that helps you protect your OT environment.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Intelligence Sources:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Government advisories (CISA, ICS-CERT)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Vendor security bulletins
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Open source intelligence (OSINT)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Dark web monitoring
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

