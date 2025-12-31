'use client'

import { Scale, FileCheck, Shield, CheckCircle, AlertTriangle, BookOpen, ClipboardList, Award } from 'lucide-react'

const frameworks = [
  {
    name: 'NERC CIP',
    description: 'Critical Infrastructure Protection standards for the electric utility industry.',
    status: 'Full Coverage',
    icon: Shield,
  },
  {
    name: 'TSA Pipeline Security',
    description: 'Security directives for pipeline owners and operators.',
    status: 'Full Coverage',
    icon: FileCheck,
  },
  {
    name: 'NIST CSF',
    description: 'Cybersecurity Framework for critical infrastructure.',
    status: 'Full Coverage',
    icon: ClipboardList,
  },
  {
    name: 'IEC 62443',
    description: 'International standard for industrial automation security.',
    status: 'Full Coverage',
    icon: Award,
  },
]

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full mb-6">
              <Scale className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm font-semibold tracking-wider uppercase">
                Regulatory Compliance
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Compliance-Ready Intelligence
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              Threat intelligence mapped to regulatory frameworks. Demonstrate due diligence and 
              support audit requirements with documentation designed for compliance.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                <span className="text-3xl font-bold text-white">8+</span>
              </div>
              <p className="text-slate-400 text-sm">Frameworks Supported</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                <span className="text-3xl font-bold text-cyan-400">100%</span>
              </div>
              <p className="text-slate-400 text-sm">Audit-Ready Reports</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileCheck className="w-5 h-5 text-purple-400" />
                <span className="text-3xl font-bold text-purple-400">Auto</span>
              </div>
              <p className="text-slate-400 text-sm">Mapping Updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Frameworks Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            Supported Frameworks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {frameworks.map((framework) => {
              const Icon = framework.icon
              return (
                <div
                  key={framework.name}
                  className="group bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                          {framework.name}
                        </h3>
                        <p className="text-slate-400">
                          {framework.description}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full whitespace-nowrap">
                      {framework.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Compliance Benefits</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Evidence Generation</span>
                      <p className="text-slate-400 text-sm">Automated documentation for audit requirements</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Gap Analysis</span>
                      <p className="text-slate-400 text-sm">Identify compliance gaps in your security posture</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Control Mapping</span>
                      <p className="text-slate-400 text-sm">Intelligence mapped to specific control requirements</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Regulatory Updates</span>
                      <p className="text-slate-400 text-sm">Stay informed on evolving compliance requirements</p>
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

