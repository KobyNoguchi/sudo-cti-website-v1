import type { Metadata } from 'next'
import RansomwareGlobe from '@/components/platform/RansomwareGlobe'
import Button from '@/components/ui/Button'
import { mockRansomwareData } from '@/data/mock-ransomware'

export const metadata: Metadata = {
  title: 'Platform - Immersive Threat Intelligence Globe | Sudo CTI',
  description:
    'Preview the Sudo CTI platform experience with an interactive ransomware globe that mirrors the polish of Kaspersky’s cyber map while focusing on U.S. critical infrastructure.',
}

const capabilityHighlights = [
  {
    title: 'Executive-Ready Storytelling',
    description:
      'Animated arcs, severity pulses, and hover panels transform complex ransomware telemetry into a briefing artifact your board will actually understand.',
  },
  {
    title: 'Operational Signal Fusion',
    description:
      'Blend OT telemetry, extortion economics, and ransomware family behavior into a single immersive canvas—ready for your live data or sandboxed proof-of-concepts.',
  },
  {
    title: 'Future-Proof Architecture',
    description:
      'Built with Next.js, Three.js, and globe.gl to ensure smooth performance on static hosting, while remaining modular for streaming data sources later.',
  },
]

export default function PlatformPage() {
  return (
    <div className="pt-32 pb-24">
      <section className="mx-auto max-w-5xl px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
          Platform Preview
        </p>
        <h1 className="mt-6 text-5xl font-bold text-primary text-balance">
          A Globe-Native View Of Ransomware Targeting U.S. Infrastructure
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          We rebuilt the spirit of Kaspersky’s cyberthreat live map with data that matters to utilities,
          LNG, rail, and OT operators. This proof of concept runs entirely on mock data so you can evaluate
          the experience before wiring in production telemetry.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button variant="primary" size="lg" href="/contact">
            Schedule Platform Briefing
          </Button>
          <Button variant="outline" size="lg" href="/resources">
            Explore Intelligence Assets
          </Button>
        </div>
      </section>

      <section className="mt-16 px-4">
        <div className="mx-auto max-w-6xl">
          <RansomwareGlobe data={mockRansomwareData} />
        </div>
      </section>

      <section className="mt-16 px-4">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl bg-white p-8 shadow-2xl lg:grid-cols-3">
          {capabilityHighlights.map((highlight) => (
            <div key={highlight.title} className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-primary">{highlight.title}</h3>
              <p className="mt-3 text-gray-600">{highlight.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

