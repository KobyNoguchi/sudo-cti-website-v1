'use client'

import { Cpu, Network, Shield, Zap, Settings, AlertTriangle, Layers, Lock } from 'lucide-react'

const capabilities = [
  {
    title: 'Protocol Analysis',
    description: 'Deep understanding of industrial protocols including Modbus, DNP3, IEC 61850, and OPC UA.',
    icon: Network,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Asset Intelligence',
    description: 'Comprehensive knowledge of PLCs, RTUs, HMIs, and other OT assets from major vendors.',
    icon: Cpu,
    color: 'from-purple-500 to-pink-600',
  },
  {
    title: 'Attack Surface Mapping',
    description: 'Identify potential attack vectors specific to your OT environment and architecture.',
    icon: Layers,
    color: 'from-orange-500 to-red-600',
  },
  {
    title: 'Safety System Analysis',
    description: 'Specialized focus on threats to safety instrumented systems (SIS) and protection systems.',
    icon: Shield,
    color: 'from-green-500 to-emerald-600',
  },
]

export default function OTAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full mb-6">
              <Cpu className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 text-sm font-semibold tracking-wider uppercase">
                OT-Specific Analysis
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Purpose-Built for OT
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              Threat intelligence designed by OT security experts who understand industrial control systems, 
              SCADA environments, and the unique challenges of securing operational technology.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Network className="w-5 h-5 text-orange-400" />
                <span className="text-3xl font-bold text-white">15+</span>
              </div>
              <p className="text-slate-400 text-sm">ICS Protocols</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span className="text-3xl font-bold text-cyan-400">200+</span>
              </div>
              <p className="text-slate-400 text-sm">OT Asset Types</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span className="text-3xl font-bold text-purple-400">50+</span>
              </div>
              <p className="text-slate-400 text-sm">Vendors Covered</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-3xl font-bold text-red-400">24/7</span>
              </div>
              <p className="text-slate-400 text-sm">OT Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            OT Intelligence Capabilities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((capability) => {
              const Icon = capability.icon
              return (
                <div
                  key={capability.title}
                  className="group bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-orange-500/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-gradient-to-br ${capability.color} rounded-lg flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors mb-2">
                        {capability.title}
                      </h3>
                      <p className="text-slate-400">
                        {capability.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why OT-Specific Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Why OT-Specific Intelligence Matters</h3>
            <div className="grid md:grid-cols-2 gap-8 text-slate-400">
              <div>
                <p className="mb-4">
                  Generic IT threat intelligence often misses the nuances of operational technology 
                  environments. OT systems have different risk tolerances, patching constraints, and 
                  operational requirements.
                </p>
                <p>
                  Our analysts understand concepts like safety instrumented systems, process control 
                  loops, and the real-world consequences of OT compromises.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">OT-Specific Context Includes:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-400" />
                    Impact on physical processes and safety
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-400" />
                    Air-gapped and segmented network considerations
                  </li>
                  <li className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-orange-400" />
                    Legacy system vulnerabilities and constraints
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-400" />
                    Vendor-specific security advisories and patches
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

