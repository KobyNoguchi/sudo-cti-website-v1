'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { feature, mesh } from 'topojson-client'
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
  const yearTextRef = useRef<d3.Selection<SVGTextElement, unknown, null, undefined> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const [incidentCount, setIncidentCount] = useState(0)
  const [totalIncidents, setTotalIncidents] = useState(0)
  const animationTimerRef = useRef<d3.Timer | null>(null)
  const currentIndexRef = useRef(0)
  const validLocationsRef = useRef<Incident[]>([])

  useEffect(() => {
    if (!mapContainerRef.current) return

    const container = mapContainerRef.current
    const containerWidth = container.clientWidth
    const mapWidth = Math.floor(containerWidth * 0.65) // Map takes 65% of width
    const sidebarWidth = containerWidth - mapWidth
    const height = 700

    // Create SVG
    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${mapWidth} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'block')

    svgRef.current = svg.node()

    const mapGroup = svg.append('g')
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
        const states = feature(us, us.objects['us-states'])
        const pad = 6
        projection.fitExtent(
          [
            [pad, pad],
            [mapWidth - pad, height - pad],
          ],
          states
        )

        // Add states
        mapGroup
          .selectAll('.state')
          .data(states.features)
          .enter()
          .append('path')
          .attr('class', 'state')
          .attr('d', path)
          .attr('fill', '#1A202C')
          .attr('stroke', '#0A2540')
          .attr('stroke-width', '0.5')

        // Add country outline
        mapGroup
          .append('path')
          .datum(mesh(us, us.objects['us-states'], (a, b) => a === b))
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', '#0066FF')
          .attr('stroke-width', '2')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')

        // Add state borders
        mapGroup
          .append('path')
          .datum(mesh(us, us.objects['us-states'], (a, b) => a !== b))
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', '#2D3748')
          .attr('stroke-width', '0.75')

        // Year text
        const bounds = path.bounds(states)
        yearText = svg
          .append('text')
          .attr('class', 'year-text')
          .attr('x', bounds[1][0] - 20)
          .attr('y', bounds[1][1] - 20)
          .attr('text-anchor', 'end')
          .attr('fill', 'rgba(255, 255, 255, 0.2)')
          .style('font-size', '64px')
          .style('font-weight', '700')
          .style('font-family', 'Inter, sans-serif')
        yearTextRef.current = yearText

        // Process incidents
        const parseDate = d3.timeParse('%m/%d/%Y')
        const validLocations: Incident[] = locations
          .filter((d) => {
            const lat = parseFloat(d.latitude)
            const lon = parseFloat(d.longitude)
            return !isNaN(lat) && !isNaN(lon) && d.event_date
          })
          .map((d) => {
            const date = parseDate(d.event_date)
            if (!date) return null
            const lat = parseFloat(d.latitude)
            const lon = parseFloat(d.longitude)
            const proj = projection([lon, lat])
            return {
              latitude: lat,
              longitude: lon,
              date,
              OrgName: d.OrgName || 'Unknown',
              location: d['Location (State)'] || 'Unknown',
              AmtPaid: d.AmtPaid || 'N/A',
              proj: proj || undefined,
            }
          })
          .filter((d): d is Incident => d !== null && d.proj !== undefined)
          .sort((a, b) => a.date.getTime() - b.date.getTime())

        validLocationsRef.current = validLocations
        setTotalIncidents(validLocations.length)

        // Create incident list
        if (incidentListRef.current) {
          const reversedLocations = [...validLocations].reverse()
          reversedLocations.forEach((incident, index) => {
            const row = document.createElement('div')
            row.className =
              'incident-row bg-gray-800 p-4 border-b border-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-700'
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
              if (entry.isIntersecting && !isPlaying && currentIndexRef.current === 0) {
                startAnimation(pointsGroup, yearText, validLocations)
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
  }, [])

  const highlightIncident = (
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
  }

  const unhighlightIncident = (
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
  }

  const scrollToRow = (row: HTMLDivElement) => {
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
  }

  const startAnimation = (
    pointsGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    yearText: d3.Selection<SVGTextElement, unknown, null, undefined>,
    validLocations: Incident[]
  ) => {
    if (animationTimerRef.current) {
      animationTimerRef.current.stop()
    }

    setIsPlaying(true)
    currentIndexRef.current = 0
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
          const circle = pointsGroup
            .append('circle')
            .attr('cx', incident.proj[0])
            .attr('cy', incident.proj[1])
            .attr('r', 3)
            .attr('fill', '#3385FF')
            .attr('opacity', '0.8')
            .style('cursor', 'pointer')

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
        setIsPlaying(false)
      }
    })

    animationTimerRef.current = timer
  }

  const resetAnimation = (
    pointsGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    yearText: d3.Selection<SVGTextElement, unknown, null, undefined>
  ) => {
    if (animationTimerRef.current) {
      animationTimerRef.current.stop()
    }

    currentIndexRef.current = 0
    setIncidentCount(0)
    setCurrentYear(null)
    pointsGroup.selectAll('circle').remove()

    validLocationsRef.current.forEach((incident) => {
      if (incident.incidentRow) {
        incident.incidentRow.style.display = 'none'
      }
      incident.circleElement = undefined
    })

    yearText.text('')
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    if (!pointsGroupRef.current || !yearTextRef.current) return

    if (isPlaying) {
      if (animationTimerRef.current) {
        animationTimerRef.current.stop()
      }
      setIsPlaying(false)
    } else {
      if (currentIndexRef.current >= validLocationsRef.current.length) {
        resetAnimation(pointsGroupRef.current, yearTextRef.current)
      }
      startAnimation(pointsGroupRef.current, yearTextRef.current, validLocationsRef.current)
    }
  }

  const handleReset = () => {
    if (!pointsGroupRef.current || !yearTextRef.current) return
    resetAnimation(pointsGroupRef.current, yearTextRef.current)
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
          className="text-center mb-12"
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

        {/* Map Container */}
        <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="flex flex-col lg:flex-row">
            {/* Map */}
            <div className="flex-1 p-6 bg-gray-950" ref={mapContainerRef} />

            {/* Sidebar */}
            <div className="lg:w-96 bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col">
              {/* Controls */}
              <div className="p-4 border-b border-gray-800 bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={handlePlayPause}
                      className="p-2 bg-secondary hover:bg-secondary-light rounded-lg transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="Reset"
                    >
                      <RotateCcw className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  {currentYear && (
                    <div className="text-2xl font-bold text-white">{currentYear}</div>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  Showing {incidentCount} of {totalIncidents} incidents
                </div>
              </div>

              {/* Incident List */}
              <div
                ref={incidentListRef}
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-gray-800"
                style={{ maxHeight: '600px' }}
              >
                <div className="p-4 bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
                  <div className="grid grid-cols-2 gap-4 text-white text-xs font-semibold">
                    <div>Organization</div>
                    <div className="text-right border-l border-gray-600 pl-4">Date & Amount</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

