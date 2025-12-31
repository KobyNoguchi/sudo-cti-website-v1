'use client'

import { Siren, Clock, Phone, FileSearch, Shield, Users, Zap, CheckCircle } from 'lucide-react'

const services = [
  {
    title: 'Threat Hunting',
    description: 'Proactive searches for indicators of compromise in your OT environment.',
    icon: FileSearch,
    color: 'from-red-500 to-orange-600',
  },
  {
    title: 'Incident Analysis',
    description: 'Expert analysis of security events with OT-specific context and impact assessment.',
    icon: Shield,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Response Guidance',
    description: 'Step-by-step playbooks tailored for OT environments and safety considerations.',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Analyst Support',
    description: 'Direct access to our OT security analysts during active incidents.',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
  },
]

export default function IncidentResponsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full mb-6">
              <Siren className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm font-semibold tracking-wider uppercase">
                Incident Response
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              When Every Second Counts
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              Rapid incident response support with deep OT expertise. Get the intelligence and 
              guidance you need to contain, investigate, and recover from security incidents.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-3xl font-bold text-red-400">&lt;1hr</span>
              </div>
              <p className="text-slate-400 text-sm">Response Time</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Phone className="w-5 h-5 text-cyan-400" />
                <span className="text-3xl font-bold text-cyan-400">24/7</span>
              </div>
              <p className="text-slate-400 text-sm">Hotline Available</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-3xl font-bold text-green-400">Expert</span>
              </div>
              <p className="text-slate-400 text-sm">OT Analysts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            Response Capabilities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.title}
                  className="group bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-red-500/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-gradient-to-br ${service.color} rounded-lg flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors mb-2">
                        {service.title}
                      </h3>
                      <p className="text-slate-400">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Response Process</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-400 font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Alert</h4>
                <p className="text-slate-400 text-sm">Contact our 24/7 incident hotline</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-400 font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Triage</h4>
                <p className="text-slate-400 text-sm">Rapid assessment and prioritization</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-cyan-400 font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Investigate</h4>
                <p className="text-slate-400 text-sm">Deep analysis with OT context</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-400 font-bold text-lg">4</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Recover</h4>
                <p className="text-slate-400 text-sm">Guided remediation and lessons learned</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/30 rounded-2xl p-8 text-center">
            <Zap className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Experiencing an Incident?
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Our incident response team is available 24/7. Don&apos;t wait—get expert OT security 
              support when you need it most.
            </p>
            <button className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-lg transition-colors">
              Contact Incident Response
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

