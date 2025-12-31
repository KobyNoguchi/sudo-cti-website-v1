'use client'

import { FileText, PieChart, BarChart3, TrendingUp, Users, Calendar, Download, Eye } from 'lucide-react'

const reportTypes = [
  {
    title: 'Board-Ready Summaries',
    description: 'High-level threat landscape overviews designed for executive and board presentations.',
    icon: Users,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Risk Dashboards',
    description: 'Visual dashboards showing threat exposure, vulnerability status, and trend analysis.',
    icon: PieChart,
    color: 'from-purple-500 to-pink-600',
  },
  {
    title: 'Compliance Reports',
    description: 'Documentation supporting regulatory requirements like NERC CIP, TSA directives, and more.',
    icon: FileText,
    color: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Trend Analysis',
    description: 'Quarterly and annual reports on evolving threat patterns in your sector.',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-600',
  },
]

export default function ReportingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full mb-6">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">
                Executive Reporting
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Intelligence for Decision Makers
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              Transform complex threat intelligence into clear, actionable reports for executives, 
              boards, and stakeholders. Communicate cyber risk in business terms.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">15+</span>
              </div>
              <p className="text-slate-400 text-sm">Report Templates</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-3xl font-bold text-green-400">Weekly</span>
              </div>
              <p className="text-slate-400 text-sm">Briefing Cadence</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Download className="w-5 h-5 text-purple-400" />
                <span className="text-3xl font-bold text-purple-400">PDF/PPT</span>
              </div>
              <p className="text-slate-400 text-sm">Export Formats</p>
            </div>
          </div>
        </div>
      </section>

      {/* Report Types Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            Report Types
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => {
              const Icon = report.icon
              return (
                <div
                  key={report.title}
                  className="group bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-gradient-to-br ${report.color} rounded-lg flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                        {report.title}
                      </h3>
                      <p className="text-slate-400">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Reporting Features</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Customizable Dashboards</span>
                      <p className="text-slate-400 text-sm">Tailor views to specific stakeholder needs</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Scheduled Reports</span>
                      <p className="text-slate-400 text-sm">Automated delivery on your preferred cadence</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Trend Visualization</span>
                      <p className="text-slate-400 text-sm">Track metrics over time with clear charts</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Multiple Formats</span>
                      <p className="text-slate-400 text-sm">Export to PDF, PowerPoint, or Excel</p>
                    </div>
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

