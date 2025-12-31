'use client'

import { Shield, Bell, AlertTriangle, Clock, ArrowUpRight, CheckCircle } from 'lucide-react'

const sampleAlerts = [
  {
    id: 1,
    title: 'Active Exploitation of Siemens SIMATIC Vulnerability',
    date: '2025-12-30',
    status: 'Active',
    severity: 'Critical',
    affected: ['SIMATIC S7-1500', 'SIMATIC S7-1200'],
    summary: 'Threat actors actively exploiting CVE-2024-XXXX in SIMATIC PLCs. Immediate patching recommended.',
  },
  {
    id: 2,
    title: 'Phishing Campaign Targeting Energy Sector',
    date: '2025-12-29',
    status: 'Active',
    severity: 'High',
    affected: ['Energy Utilities', 'Grid Operators'],
    summary: 'Coordinated spear-phishing campaign delivering OT-specific malware to energy sector employees.',
  },
  {
    id: 3,
    title: 'New Ransomware Variant Targeting HMI Systems',
    date: '2025-12-27',
    status: 'Monitoring',
    severity: 'High',
    affected: ['Wonderware', 'Ignition'],
    summary: 'New ransomware family observed targeting human-machine interface applications in manufacturing.',
  },
  {
    id: 4,
    title: 'Supply Chain Compromise in Industrial Software',
    date: '2025-12-22',
    status: 'Resolved',
    severity: 'Critical',
    affected: ['Third-party Libraries'],
    summary: 'Malicious code discovered in widely-used industrial automation library. Vendor has released patch.',
  },
]

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full mb-6">
              <Bell className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm font-semibold tracking-wider uppercase">
                Advisory Alerts
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Security Alerts
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              Time-sensitive notifications about active threats, ongoing campaigns, and 
              emerging vulnerabilities affecting critical infrastructure.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-3xl font-bold text-red-400">3</span>
              </div>
              <p className="text-slate-400 text-sm">Active Alerts</p>
            </div>
            <div className="bg-slate-800/50 border border-orange-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-orange-400" />
                <span className="text-3xl font-bold text-orange-400">2</span>
              </div>
              <p className="text-slate-400 text-sm">This Week</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-3xl font-bold text-green-400">12</span>
              </div>
              <p className="text-slate-400 text-sm">Resolved (30 days)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            Recent Alerts
          </h2>
          
          <div className="space-y-4">
            {sampleAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`group bg-slate-800/50 border rounded-xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer ${
                  alert.status === 'Active' ? 'border-red-500/50' : 
                  alert.status === 'Monitoring' ? 'border-orange-500/50' : 
                  'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        alert.status === 'Active' ? 'bg-red-500/20 text-red-400' :
                        alert.status === 'Monitoring' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {alert.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors mb-2">
                      {alert.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm mb-4">
                      {alert.summary}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {alert.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        {alert.affected.join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Subscribe CTA */}
          <div className="mt-8 p-6 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-xl text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Stay Informed</h3>
            <p className="text-slate-400 text-sm mb-4">
              Subscribe to receive real-time alerts for threats affecting your industry sector.
            </p>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-medium rounded-lg transition-colors">
              Subscribe to Alerts
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

