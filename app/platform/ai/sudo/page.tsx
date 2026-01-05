'use client'

import { Sparkles, ArrowLeft, Bell } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SudoAIPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
    // In production, you'd save this to your database
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Back Link */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            Back to Platform
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-2xl mb-8 shadow-lg shadow-cyan-500/25">
            <Sparkles className="w-12 h-12 text-white" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 text-sm font-semibold">In Development</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Sudo AI
          </h1>
          <p className="text-xl text-slate-400 mb-4">
            Coming Soon
          </p>

          {/* Description */}
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12">
            Our AI-powered threat analysis engine is currently in development. 
            Sudo AI will revolutionize how you analyze, predict, and respond to 
            cyber threats targeting critical infrastructure.
          </p>

          {/* Features Preview */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="text-3xl mb-3">🔮</div>
              <h3 className="text-white font-semibold mb-2">Predictive Analysis</h3>
              <p className="text-slate-500 text-sm">AI-driven threat prediction for proactive defense</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-white font-semibold mb-2">Automated Reports</h3>
              <p className="text-slate-500 text-sm">Natural language threat briefings generated instantly</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-white font-semibold mb-2">Real-time Intel</h3>
              <p className="text-slate-500 text-sm">Continuous monitoring with intelligent alerting</p>
            </div>
          </div>

          {/* Notify Form */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8 max-w-md mx-auto">
            {subscribed ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
                  <Bell className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">You&apos;re on the list!</h3>
                <p className="text-slate-400 text-sm">
                  We&apos;ll notify you when Sudo AI is ready for early access.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-white font-semibold mb-2">Get Early Access</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Be the first to know when Sudo AI launches.
                </p>
                <form onSubmit={handleNotify} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-lg transition-all text-sm"
                  >
                    Notify Me
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

