'use client'

import { Building2, Users, Shield, Target } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full mb-6">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">
                Our Story
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              About Sudo CTI
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
              Sudo CTI is a specialized cyber threat intelligence platform designed specifically for 
              utilities and critical infrastructure organizations. Founded by experienced threat 
              intelligence analysts, we understand the unique challenges facing the utility sector.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Our mission is to provide actionable intelligence that helps organizations stay ahead 
              of evolving cyber threats targeting critical infrastructure. We combine real-time 
              threat monitoring with deep industry expertise to deliver strategic visibility and 
              tactical guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">What Drives Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="inline-flex p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Protection</h3>
              <p className="text-slate-400 text-sm">
                Dedicated to safeguarding the critical infrastructure that powers our communities.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Expertise</h3>
              <p className="text-slate-400 text-sm">
                Built by analysts who understand OT environments and the threats they face.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="inline-flex p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Precision</h3>
              <p className="text-slate-400 text-sm">
                Actionable intelligence tailored to your specific industry and risk profile.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
