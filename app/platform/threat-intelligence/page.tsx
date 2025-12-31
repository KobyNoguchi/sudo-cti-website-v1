'use client'

import { Shield, Globe, AlertTriangle, Activity, Target, Zap, TrendingUp, Clock } from 'lucide-react'

export default function ThreatIntelligencePage() {
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
                Threat Intelligence
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              OT/ICS Threat Intelligence
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              Real-time threat intelligence tailored for operational technology environments. 
              Monitor emerging threats targeting critical infrastructure and industrial control systems.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <span className="text-3xl font-bold text-white">47</span>
              </div>
              <p className="text-slate-400 text-sm">Active Threat Groups</p>
            </div>
            <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-3xl font-bold text-red-400">12</span>
              </div>
              <p className="text-slate-400 text-sm">Active Campaigns</p>
            </div>
            <div className="bg-slate-800/50 border border-orange-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-orange-400" />
                <span className="text-3xl font-bold text-orange-400">156</span>
              </div>
              <p className="text-slate-400 text-sm">IOCs Tracked</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span className="text-3xl font-bold text-green-400">24/7</span>
              </div>
              <p className="text-slate-400 text-sm">Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">
            Intelligence Capabilities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg w-fit mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Threat Actor Tracking</h3>
              <p className="text-slate-400">
                Monitor APT groups and threat actors specifically targeting OT/ICS environments, 
                including TTPs and attribution analysis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg w-fit mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Alerts</h3>
              <p className="text-slate-400">
                Instant notifications for emerging threats, zero-day exploits, and active campaigns 
                targeting your industry sector.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg w-fit mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Trend Analysis</h3>
              <p className="text-slate-400">
                Historical and predictive analysis of threat landscape evolution specific to 
                critical infrastructure sectors.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg w-fit mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">IOC Feeds</h3>
              <p className="text-slate-400">
                Curated indicators of compromise including IPs, domains, hashes, and YARA rules 
                relevant to OT environments.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg w-fit mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">MITRE ATT&CK Mapping</h3>
              <p className="text-slate-400">
                All threats mapped to MITRE ATT&CK for ICS framework for standardized 
                understanding and defensive planning.
              </p>
            </div>

            {/* Feature 6 - Coming Soon */}
            <div className="bg-slate-800/30 border border-slate-700/50 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-slate-700/50 rounded-lg mb-4">
                <Clock className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-500 mb-2">More Coming Soon</h3>
              <p className="text-slate-600 text-sm">
                Additional intelligence features in development
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to enhance your threat intelligence?
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Schedule a briefing with our analysts to learn how Sudo CTI can provide 
              actionable intelligence for your critical infrastructure environment.
            </p>
            <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg transition-colors">
              Schedule Briefing
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

