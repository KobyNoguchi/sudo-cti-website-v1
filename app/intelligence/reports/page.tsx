'use client'

import { Shield, FileText, Calendar, Tag, Clock, ArrowUpRight } from 'lucide-react'

const sampleReports = [
  {
    id: 1,
    title: 'VOLTZITE: Emerging Threat Actor Targeting US Energy Grid',
    date: '2025-12-28',
    category: 'Threat Actor Profile',
    severity: 'Critical',
    sectors: ['Energy', 'Utilities'],
    summary: 'Analysis of a newly identified threat group targeting SCADA systems in North American power utilities.',
  },
  {
    id: 2,
    title: 'FrostyGoop ICS Malware Technical Analysis',
    date: '2025-12-20',
    category: 'Malware Analysis',
    severity: 'High',
    sectors: ['Energy', 'Manufacturing'],
    summary: 'Deep dive into the FrostyGoop malware family and its capabilities against Modbus-enabled devices.',
  },
  {
    id: 3,
    title: 'Q4 2025 OT Threat Landscape Report',
    date: '2025-12-15',
    category: 'Quarterly Report',
    severity: 'Medium',
    sectors: ['All Sectors'],
    summary: 'Comprehensive quarterly analysis of threats targeting operational technology environments.',
  },
  {
    id: 4,
    title: 'Ransomware Trends in Critical Infrastructure',
    date: '2025-12-10',
    category: 'Trend Analysis',
    severity: 'High',
    sectors: ['Healthcare', 'Energy', 'Water'],
    summary: 'Analysis of ransomware groups increasingly targeting OT networks and safety systems.',
  },
]

export default function ThreatReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full mb-6">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">
                Threat Reports
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Intelligence Reports
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              In-depth analysis of threat actors, malware families, and campaigns targeting 
              critical infrastructure and industrial control systems.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">24</span>
              </div>
              <p className="text-slate-400 text-sm">Total Reports</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-3xl font-bold text-green-400">3</span>
              </div>
              <p className="text-slate-400 text-sm">This Month</p>
            </div>
            <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-400" />
                <span className="text-3xl font-bold text-red-400">5</span>
              </div>
              <p className="text-slate-400 text-sm">Critical Priority</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reports List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            Recent Reports
          </h2>
          
          <div className="space-y-4">
            {sampleReports.map((report) => (
              <div
                key={report.id}
                className="group bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        report.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        report.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {report.severity}
                      </span>
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                        {report.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors mb-2">
                      {report.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm mb-4">
                      {report.summary}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {report.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {report.sectors.join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Placeholder Note */}
          <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700 rounded-lg text-center">
            <p className="text-slate-400 text-sm">
              <strong className="text-slate-300">Note:</strong> This is a preview of our threat reports. 
              Full reports with detailed IOCs and recommendations are available to subscribers.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

