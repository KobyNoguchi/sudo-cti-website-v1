'use client'

import { Shield, BarChart3, Building2, TrendingUp, ArrowUpRight } from 'lucide-react'

const sectors = [
  {
    id: 'energy',
    name: 'Energy & Utilities',
    description: 'Power generation, transmission, and distribution including renewables',
    threatLevel: 'High',
    reports: 8,
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Industrial manufacturing, automotive, and discrete production',
    threatLevel: 'High',
    reports: 6,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'water',
    name: 'Water & Wastewater',
    description: 'Water treatment, distribution, and wastewater management',
    threatLevel: 'Medium',
    reports: 4,
    color: 'from-cyan-500 to-teal-600',
  },
  {
    id: 'oil-gas',
    name: 'Oil & Gas',
    description: 'Upstream, midstream, and downstream operations',
    threatLevel: 'Critical',
    reports: 5,
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'transportation',
    name: 'Transportation',
    description: 'Rail, maritime, aviation, and logistics systems',
    threatLevel: 'Medium',
    reports: 3,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Hospitals, medical devices, and pharmaceutical manufacturing',
    threatLevel: 'High',
    reports: 4,
    color: 'from-green-500 to-emerald-600',
  },
]

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full mb-6">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">
                Industry Analysis
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Sector Intelligence
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              Sector-specific threat landscape assessments and trend analysis for 
              critical infrastructure industries.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span className="text-3xl font-bold text-white">6</span>
              </div>
              <p className="text-slate-400 text-sm">Sectors Covered</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span className="text-3xl font-bold text-cyan-400">30</span>
              </div>
              <p className="text-slate-400 text-sm">Analysis Reports</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-3xl font-bold text-green-400">Q4</span>
              </div>
              <p className="text-slate-400 text-sm">Latest Quarter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            Industry Sectors
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector) => (
              <div
                key={sector.id}
                className="group relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                {/* Gradient accent */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${sector.color} rounded-t-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${sector.color} rounded-lg`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                  {sector.name}
                </h3>
                
                <p className="text-slate-400 text-sm mb-4">
                  {sector.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div>
                    <span className="text-xs text-slate-500">Threat Level</span>
                    <div className={`font-semibold ${
                      sector.threatLevel === 'Critical' ? 'text-red-400' :
                      sector.threatLevel === 'High' ? 'text-orange-400' :
                      'text-yellow-400'
                    }`}>
                      {sector.threatLevel}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Reports</span>
                    <div className="font-semibold text-white">{sector.reports}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">About Sector Analysis</h3>
            <div className="grid md:grid-cols-2 gap-6 text-slate-400">
              <div>
                <p className="mb-4">
                  Our sector-specific analysis provides tailored intelligence based on the unique 
                  threat landscape, regulatory requirements, and operational characteristics of 
                  each critical infrastructure sector.
                </p>
                <p>
                  Reports include threat actor targeting patterns, common attack vectors, and 
                  sector-specific recommendations for improving OT security posture.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Analysis Includes:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    Sector-specific threat actor profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    Common vulnerability patterns
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    Regulatory compliance mapping
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    Quarterly trend reports
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

