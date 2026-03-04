'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { feature, mesh } from 'topojson-client'
import { FeatureCollection } from 'geojson'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react'

interface Incident {
  latitude: number
  longitude: number
  date: Date
  OrgName: string
  location: string
  AmtPaid: string
  proj?: [number, number]
  circleElement?: d3.Selection<SVGCircleElement, unknown, null, undefined>
  incidentRow?: HTMLDivElement
}

export default function RansomwareMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const incidentListRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const pointsGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null)
  const arcsGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null)
  const yearTextRef = useRef<d3.Selection<SVGTextElement, unknown, null, undefined> | null>(null)
  const lastProjectedRef = useRef<[number, number] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const [incidentCount, setIncidentCount] = useState(0)
  const [totalIncidents, setTotalIncidents] = useState(0)
  const animationTimerRef = useRef<d3.Timer | null>(null)
  const currentIndexRef = useRef(0)
  const validLocationsRef = useRef<Incident[]>([])
  const isPlayingRef = useRef(false) // ref version of isPlaying for stable closure use

  const scrollToRow = useCallback((row: HTMLDivElement) => {
    const container = incidentListRef.current
    if (!container || !row) return

    const containerRect = container.getBoundingClientRect()
    const rowRect = row.getBoundingClientRect()

    const isAbove = rowRect.top < containerRect.top
    const isBelow = rowRect.bottom > containerRect.bottom

    if (isAbove || isBelow) {
      const offset = isAbove ? -10 : 10
      container.scrollTo({
        top: container.scrollTop + (rowRect.top - containerRect.top) + offset,
        behavior: 'smooth',
      })
    }
  }, [])

  const highlightIncident = useCallback((
    incident: Incident,
    pointsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  ) => {
    if (incident.circleElement) {
      incident.circleElement
        .classed('highlighted', true)
        .attr('fill', '#0066FF')
        .attr('r', 6)
        .style('filter', 'drop-shadow(0 0 8px #0066FF)')
    }

    if (incident.incidentRow) {
      incident.incidentRow.style.backgroundColor = '#0066FF'
      incident.incidentRow.style.transform = 'scale(1.02)'
      const ransomEl = incident.incidentRow.querySelector('.ransom-amount')
      if (ransomEl) {
        ;(ransomEl as HTMLElement).style.color = '#FFFFFF'
      }
      scrollToRow(incident.incidentRow)
    }
  }, [scrollToRow])

  const unhighlightIncident = useCallback((
    incident: Incident,
    pointsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  ) => {
    if (incident.circleElement) {
      incident.circleElement
        .classed('highlighted', false)
        .attr('fill', '#3385FF')
        .attr('r', 3)
        .style('filter', 'none')
    }

    if (incident.incidentRow) {
      incident.incidentRow.style.backgroundColor = ''
      incident.incidentRow.style.transform = ''
      const ransomEl = incident.incidentRow.querySelector('.ransom-amount')
      if (ransomEl) {
        ;(ransomEl as HTMLElement).style.color = '#0066FF'
      }
    }
  }, [])

  const drawArc = useCallback((
    arcsGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    from: [number, number],
    to: [number, number]
  ) => {
    // Midpoint with vertical offset for a curved arc
    const mx = (from[0] + to[0]) / 2
    const my = (from[1] + to[1]) / 2 - Math.hypot(to[0] - from[0], to[1] - from[1]) * 0.35

    const pathData = `M${from[0]},${from[1]} Q${mx},${my} ${to[0]},${to[1]}`

    const arcPath = arcsGroup
      .append('path')
      .attr('d', pathData)
      .attr('fill', 'none')
      .attr('stroke', '#3385FF')
      .attr('stroke-width', '0.8')
      .attr('opacity', '0.35')

    // Animate draw-on using stroke-dashoffset
    const length = (arcPath.node() as SVGPathElement).getTotalLength()
    arcPath
      .attr('stroke-dasharray', length)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0)

    // Fade out older arcs to keep the map readable
    arcsGroup.selectAll('path')
      .filter(function() { return this !== arcPath.node() })
      .transition()
      .duration(3000)
      .attr('opacity', 0)
      .remove()
  }, [])

  const addPulseRipple = useCallback((
    pointsGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number
  ) => {
    // Expanding ring that fades out when a new dot appears
    const ripple = pointsGroup
      .append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 3)
      .attr('fill', 'none')
      .attr('stroke', '#3385FF')
      .attr('stroke-width', '1.5')
      .attr('opacity', '0.9')
      .style('pointer-events', 'none')

    ripple
      .transition()
      .duration(800)
      .ease(d3.easeCircleOut)
      .attr('r', 14)
      .attr('opacity', 0)
      .remove()
  }, [])

  const startAnimation = useCallback((
    pointsGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    yearText: d3.Selection<SVGTextElement, unknown, null, undefined>,
    validLocations: Incident[],
    arcsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  ) => {
    if (animationTimerRef.current) {
      animationTimerRef.current.stop()
    }

    isPlayingRef.current = true
    setIsPlaying(true)
    currentIndexRef.current = 0
    lastProjectedRef.current = null
    setIncidentCount(0)

    const timeScale = d3
      .scaleTime()
      .domain(d3.extent(validLocations, (d) => d.date) as [Date, Date])
      .range([0, 20000]) // 20 second animation

    const timer = d3.timer((elapsed) => {
      const currentDate = timeScale.invert(elapsed)
      const year = currentDate.getFullYear()
      setCurrentYear(year)
      yearText.text(year.toString())

      while (
        currentIndexRef.current < validLocations.length &&
        validLocations[currentIndexRef.current].date <= currentDate
      ) {
        const incident = validLocations[currentIndexRef.current]
        if (incident.proj) {
          // Draw connecting arc from last incident
          if (lastProjectedRef.current) {
            drawArc(arcsGroup, lastProjectedRef.current, incident.proj)
          }
          lastProjectedRef.current = incident.proj

          // Pulse ripple effect
          addPulseRipple(pointsGroup, incident.proj[0], incident.proj[1])

          const circle = pointsGroup
            .append('circle')
            .attr('cx', incident.proj[0])
            .attr('cy', incident.proj[1])
            .attr('r', 0)
            .attr('fill', '#3385FF')
            .attr('opacity', '0.8')
            .style('cursor', 'pointer')

          // Pop-in animation
          circle
            .transition()
            .duration(300)
            .ease(d3.easeBackOut)
            .attr('r', 3)

          incident.circleElement = circle

          circle
            .on('mouseenter', () => highlightIncident(incident, pointsGroup))
            .on('mouseleave', () => unhighlightIncident(incident, pointsGroup))

          if (incident.incidentRow) {
            incident.incidentRow.style.display = 'block'
          }

          setIncidentCount((prev) => prev + 1)
        }
        currentIndexRef.current++
      }

      if (currentIndexRef.current >= validLocations.length) {
        timer.stop()
        isPlayingRef.current = false
        setIsPlaying(false)
      }
    })

    animationTimerRef.current = timer
  }, [highlightIncident, unhighlightIncident, drawArc, addPulseRipple])

  useEffect(() => {
    if (!mapContainerRef.current) return

    const container = mapContainerRef.current
    const containerWidth = container.clientWidth
    const height = container.clientHeight || 580

    // Create SVG — full width, transparent so section gradient shows through
    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${containerWidth} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'block')

    svgRef.current = svg.node()

    const mapGroup = svg.append('g')
    const arcsGroup = svg.append('g')   // arcs sit between map and dots
    arcsGroupRef.current = arcsGroup
    const pointsGroup = svg.append('g')
    pointsGroupRef.current = pointsGroup
    let yearText: d3.Selection<SVGTextElement, unknown, null, undefined>

    const projection = d3.geoAlbersUsa()
    const path = d3.geoPath().projection(projection)

    // Load data
    Promise.all([
      d3.json('/Assets/us-10m-v1-json-data/2061c02cb3c747daf6ea7c406a5151f4-5d4c901bbf597838fbb8e34922d33c48c8aad7d8/us-states.topojson'),
      d3.csv('/Assets/locations.csv'),
    ])
      .then(([usData, locationsData]) => {
        if (!usData || !locationsData) return

        const us = usData as any
        const locations = locationsData as any[]

        // Render map
        const states = feature(us, us.objects['us-states']) as unknown as FeatureCollection
        const pad = 20
        projection.fitExtent(
          [
            [pad, pad],
            [containerWidth - pad, height - pad],
          ],
          states
        )

        // Add states — slightly lighter than section background so they read cleanly
        mapGroup
          .selectAll('.state')
          .data(states.features)
          .enter()
          .append('path')
          .attr('class', 'state')
          .attr('d', path)
          .attr('fill', '#0D2F4A')
          .attr('stroke', 'rgba(255,255,255,0.18)')
          .attr('stroke-width', '0.7')

        // Country outline — subtle blue glow
        mapGroup
          .append('path')
          .datum(mesh(us, us.objects['us-states'], (a, b) => a === b))
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', '#3385FF')
          .attr('stroke-width', '1.5')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('opacity', '0.7')

        // State internal borders
        mapGroup
          .append('path')
          .datum(mesh(us, us.objects['us-states'], (a, b) => a !== b))
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(255,255,255,0.15)')
          .attr('stroke-width', '0.6')

        // Year text — hidden (year shown in sidebar counter instead)
        yearText = svg
          .append('text')
          .attr('class', 'year-text')
          .attr('display', 'none')
        yearTextRef.current = yearText

        // Process incidents
        const parseDate = d3.timeParse('%m/%d/%Y')
        const validLocations = locations
          .filter((d) => {
            const lat = parseFloat(d.latitude)
            const lon = parseFloat(d.longitude)
            return !isNaN(lat) && !isNaN(lon) && d.event_date
          })
          .map((d): Incident | null => {
            const date = parseDate(d.event_date)
            if (!date) return null
            const lat = parseFloat(d.latitude)
            const lon = parseFloat(d.longitude)
            const proj = projection([lon, lat])
            if (!proj) return null
            return {
              latitude: lat,
              longitude: lon,
              date,
              OrgName: d.OrgName || 'Unknown',
              location: d['Location (State)'] || 'Unknown',
              AmtPaid: d.AmtPaid || 'N/A',
              proj: proj,
            }
          })
          .filter((d): d is Incident => d !== null)
          .sort((a, b) => a.date.getTime() - b.date.getTime())

        validLocationsRef.current = validLocations
        setTotalIncidents(validLocations.length)

        // Create incident list
        if (incidentListRef.current) {
          const reversedLocations = [...validLocations].reverse()
          reversedLocations.forEach((incident, index) => {
            const row = document.createElement('div')
            row.className =
              'incident-row p-4 border-b border-white/5 cursor-pointer transition-all duration-200 hover:bg-white/5'
            row.style.display = 'none'

            const dateString = incident.date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })

            row.innerHTML = `
              <div class="grid grid-cols-2 gap-4 text-white">
                <div>
                  <div class="font-semibold text-sm mb-1">${incident.OrgName}</div>
                  <div class="text-gray-400 text-xs">${incident.location}</div>
                </div>
                <div class="border-l border-gray-600 pl-4 text-right">
                  <div class="text-gray-300 text-xs mb-1">${dateString}</div>
                  <div class="ransom-amount font-bold text-secondary text-sm">${incident.AmtPaid}</div>
                </div>
              </div>
            `

            incident.incidentRow = row

            row.addEventListener('mouseenter', () => {
              highlightIncident(incident, pointsGroup)
            })
            row.addEventListener('mouseleave', () => {
              unhighlightIncident(incident, pointsGroup)
            })

            incidentListRef.current?.appendChild(row)
          })
        }

        // Intersection Observer - auto-start when visible
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !isPlayingRef.current && currentIndexRef.current === 0) {
                startAnimation(pointsGroup, yearText, validLocations, arcsGroup)
              }
            })
          },
          { threshold: 0.3 }
        )

        observer.observe(container)
      })
      .catch((error) => {
        console.error('Error loading map data:', error)
      })

    return () => {
      if (animationTimerRef.current) {
        animationTimerRef.current.stop()
      }
      d3.select(container).selectAll('*').remove()
    }
  }, [highlightIncident, startAnimation])

  const resetAnimation = (
    pointsGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    yearText: d3.Selection<SVGTextElement, unknown, null, undefined>,
    arcsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  ) => {
    if (animationTimerRef.current) {
      animationTimerRef.current.stop()
    }

    currentIndexRef.current = 0
    lastProjectedRef.current = null
    setIncidentCount(0)
    setCurrentYear(null)
    pointsGroup.selectAll('circle').remove()
    arcsGroup.selectAll('path').remove()

    validLocationsRef.current.forEach((incident) => {
      if (incident.incidentRow) {
        incident.incidentRow.style.display = 'none'
      }
      incident.circleElement = undefined
    })

    yearText.text('')
    isPlayingRef.current = false
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    if (!pointsGroupRef.current || !yearTextRef.current || !arcsGroupRef.current) return

    if (isPlaying) {
      if (animationTimerRef.current) {
        animationTimerRef.current.stop()
      }
      isPlayingRef.current = false
      setIsPlaying(false)
    } else {
      if (currentIndexRef.current >= validLocationsRef.current.length) {
        resetAnimation(pointsGroupRef.current, yearTextRef.current, arcsGroupRef.current)
      }
      startAnimation(pointsGroupRef.current, yearTextRef.current, validLocationsRef.current, arcsGroupRef.current)
    }
  }

  const handleReset = () => {
    if (!pointsGroupRef.current || !yearTextRef.current || !arcsGroupRef.current) return
    resetAnimation(pointsGroupRef.current, yearTextRef.current, arcsGroupRef.current)
  }

  return (
    <section className="py-24 bg-gradient-to-br from-primary-dark via-primary to-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <AlertTriangle className="w-5 h-5 text-secondary" />
            <span className="text-white text-sm font-medium">Critical Infrastructure Threats</span>
          </div>
          <h2 className="text-display font-bold text-white mb-4">
            US Critical Infrastructure Ransomware Timeline
          </h2>
          <p className="text-body text-white/80 max-w-3xl mx-auto">
            An interactive visualization of ransomware attacks targeting critical infrastructure across
            the United States, showing the escalating threat landscape over time.
          </p>
        </motion.div>

        {/* Map + Sidebar — no outer box, sits directly on section gradient */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">

          {/* Map — transparent, fills its container */}
          <div
            className="flex-1"
            ref={mapContainerRef}
            style={{ height: '580px' }}
          />

          {/* Sidebar — glass card, same height as map */}
          <div
            className="lg:w-80 flex flex-col rounded-xl overflow-hidden"
            style={{
              height: '580px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Controls */}
            <div
              className="p-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 bg-secondary hover:bg-secondary-light rounded-lg transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Reset"
                  >
                    <RotateCcw className="w-4 h-4 text-white/60" />
                  </button>
                </div>
                {currentYear && (
                  <div className="text-xl font-bold text-white tabular-nums">{currentYear}</div>
                )}
              </div>
              <div className="text-xs text-white/40 font-medium tracking-wide uppercase">
                {incidentCount} of {totalIncidents} incidents
              </div>
            </div>

            {/* Column headers */}
            <div
              className="px-4 py-2 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="grid grid-cols-2 gap-4 text-white/40 text-xs font-semibold uppercase tracking-wider">
                <div>Organization</div>
                <div className="text-right">Date / Amount</div>
              </div>
            </div>

            {/* Incident List */}
            <div
              ref={incidentListRef}
              className="flex-1 overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,102,255,0.4) transparent',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

