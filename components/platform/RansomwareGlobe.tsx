'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type GlobeType from 'globe.gl'
import TimelineControls from '@/components/platform/TimelineControls'
import {
  mockRansomwareData,
  PLATFORM_MAX_YEAR,
  PLATFORM_MIN_YEAR,
  severityAltitudes,
  severityColors,
} from '@/data/mock-ransomware'
import type { RansomwareAttack } from '@/types'

type GlobeInstance = ReturnType<GlobeType>

interface RansomwareGlobeProps {
  data?: RansomwareAttack[]
}

interface PointDatum {
  lat: number
  lng: number
  size: number
  color: string
  attack: RansomwareAttack
}

interface ArcDatum {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: [string, string]
  attack: RansomwareAttack
}

const EARTH_TEXTURE = '//unpkg.com/three-globe/example/img/earth-night.jpg'
const BUMP_TEXTURE = '//unpkg.com/three-globe/example/img/earth-topology.png'
const BACKGROUND_IMAGE = '//unpkg.com/three-globe/example/img/night-sky.png'

export default function RansomwareGlobe({ data = mockRansomwareData }: RansomwareGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(2)
  const [currentYear, setCurrentYear] = useState(PLATFORM_MIN_YEAR)
  const [hoveredAttack, setHoveredAttack] = useState<RansomwareAttack | null>(null)

  const sortedData = useMemo(
    () =>
      [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [data]
  )

  const visibleAttacks = useMemo(
    () =>
      sortedData.filter(
        (attack) => new Date(attack.date).getFullYear() <= currentYear
      ),
    [sortedData, currentYear]
  )

  const currentYearIncidents = useMemo(
    () =>
      sortedData.filter(
        (attack) => new Date(attack.date).getFullYear() === currentYear
      ),
    [sortedData, currentYear]
  )

  const pointsData: PointDatum[] = useMemo(
    () =>
      visibleAttacks.map((attack) => ({
        lat: attack.lat,
        lng: attack.lng,
        size: severityAltitudes[attack.severity],
        color: severityColors[attack.severity],
        attack,
      })),
    [visibleAttacks]
  )

  const arcsData: ArcDatum[] = useMemo(
    () =>
      visibleAttacks
        .filter((attack) => attack.attackerOrigin)
        .map((attack) => ({
          startLat: attack.attackerOrigin!.lat,
          startLng: attack.attackerOrigin!.lng,
          endLat: attack.lat,
          endLng: attack.lng,
          color: [severityColors[attack.severity], '#ffffff'],
          attack,
        })),
    [visibleAttacks]
  )

  const ringsData = useMemo(
    () =>
      currentYearIncidents.map((attack) => ({
        lat: attack.lat,
        lng: attack.lng,
        color: severityColors[attack.severity],
        maxR: 5,
        propagationSpeed: 2,
        repeatPeriod: 1200,
      })),
    [currentYearIncidents]
  )

  useEffect(() => {
    let isCancelled = false

    const initGlobe = async () => {
      const { default: Globe } = await import('globe.gl')
      if (!containerRef.current || isCancelled) return

      const globe = Globe()(containerRef.current)
      globe.globeImageUrl(EARTH_TEXTURE)
      globe.bumpImageUrl(BUMP_TEXTURE)
      globe.backgroundImageUrl(BACKGROUND_IMAGE)
      globe.pointAltitude('size')
      globe.pointColor('color')
      globe.pointLabel(({ attack }: PointDatum) => `
        <div class="text-sm">
          <strong>${attack.organization}</strong><br/>
          ${attack.city}, ${attack.state}<br/>
          ${attack.ransomDisplay} • ${attack.ransomwareFamily}<br/>
          ${new Date(attack.date).toLocaleDateString()}
        </div>
      `)
      globe.arcsTransitionDuration(800)
      globe.arcsColor('color')
      globe.arcsAltitude(0.15)
      globe.arcsStroke(0.8)
      globe.ringsMaxRadius('maxR')
      globe.ringsColor('color')
      globe.ringsRepeatPeriod('repeatPeriod')
      globe.ringsPropagationSpeed('propagationSpeed')
      globe.onPointHover((point: PointDatum | null) => {
        setHoveredAttack(point?.attack ?? null)
      })

      const controls = globe.controls()
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.7
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.minDistance = 200
      controls.maxDistance = 800

      globeRef.current = globe
      setIsInitialized(true)
    }

    initGlobe()

    return () => {
      isCancelled = true
      const controls = globeRef.current?.controls()
      if (controls) {
        controls.dispose()
      }
      globeRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!globeRef.current || !isInitialized) return
    globeRef.current.pointsData(pointsData)
    globeRef.current.arcsData(arcsData)
    globeRef.current.ringsData(ringsData)
  }, [pointsData, arcsData, ringsData, isInitialized])

  useEffect(() => {
    if (!isPlaying) return

    const interval = window.setInterval(() => {
      setCurrentYear((prev) => {
        if (prev >= PLATFORM_MAX_YEAR) {
          return PLATFORM_MIN_YEAR
        }
        return prev + 1
      })
    }, Math.max(500, 1600 / speed))

    return () => window.clearInterval(interval)
  }, [isPlaying, speed])

  const summaryStats = useMemo(() => {
    const total = visibleAttacks.length
    const recent = currentYearIncidents.length
    return { total, recent }
  }, [visibleAttacks.length, currentYearIncidents.length])

  return (
    <section className="cyber-gradient relative overflow-hidden rounded-3xl border border-white/5 p-8 shadow-2xl">
      <div className="starfield pointer-events-none" />
      <div className="relative grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div className="min-h-[520px] rounded-2xl bg-black/30 p-4 backdrop-blur">
          <div ref={containerRef} className="h-full w-full" />
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary-light">
              Platform Preview
            </p>
            <h3 className="mt-2 text-3xl font-bold text-white">Live Ransomware Telemetry</h3>
            <p className="mt-4 text-white/70">
              Explore ransomware campaigns targeting U.S. infrastructure between 2013 and 2025.
              Severity-driven colors, pulsing rings, and attack arcs mirror the immersive Kaspersky
              experience—ready to plug into your live dataset.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Cumulative Incidents</span>
              <span className="text-2xl font-semibold text-white">{summaryStats.total}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-white/60">
              <span>Attacks This Year</span>
              <span className="text-lg font-medium text-secondary-light">{summaryStats.recent}</span>
            </div>
          </div>

          <TimelineControls
            currentYear={currentYear}
            minYear={PLATFORM_MIN_YEAR}
            maxYear={PLATFORM_MAX_YEAR}
            isPlaying={isPlaying}
            speed={speed}
            onTogglePlay={() => setIsPlaying((prev) => !prev)}
            onReset={() => {
              setIsPlaying(false)
              setCurrentYear(PLATFORM_MIN_YEAR)
            }}
            onSpeedChange={setSpeed}
            onYearChange={(year) => {
              setIsPlaying(false)
              setCurrentYear(year)
            }}
          />

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            {hoveredAttack ? (
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">Focused Attack</p>
                <p className="mt-2 text-xl font-semibold text-white">{hoveredAttack.organization}</p>
                <p className="text-white/70">
                  {hoveredAttack.city}, {hoveredAttack.state}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/80">
                  <div>
                    <p className="text-white/50">Ransom</p>
                    <p className="font-semibold text-secondary-light">
                      {hoveredAttack.ransomDisplay}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50">Family</p>
                    <p className="font-semibold">{hoveredAttack.ransomwareFamily}</p>
                  </div>
                  <div>
                    <p className="text-white/50">Date</p>
                    <p className="font-semibold">
                      {new Date(hoveredAttack.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50">Severity</p>
                    <p className="font-semibold capitalize">{hoveredAttack.severity}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white/60">
                Hover over any pulse on the globe to inspect organization-level telemetry, ransom
                demands, and malware families in context.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

