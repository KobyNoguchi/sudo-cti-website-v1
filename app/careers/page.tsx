'use client'

import { Clock } from 'lucide-react'

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-[70vh] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto w-full">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-full mb-6">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-slate-400 text-sm font-semibold tracking-wider uppercase">
                Coming Soon
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Careers at Sudo CTI
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
              We&apos;re building a team of passionate security professionals dedicated to protecting 
              critical infrastructure. Check back soon for open positions.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}


