'use client'

import { Play, Pause, RotateCcw } from 'lucide-react'
import clsx from 'clsx'

interface TimelineControlsProps {
  currentYear: number
  minYear: number
  maxYear: number
  isPlaying: boolean
  speed: number
  onTogglePlay: () => void
  onReset: () => void
  onSpeedChange: (value: number) => void
  onYearChange: (value: number) => void
}

const speedOptions = [1, 2, 5, 10]

export default function TimelineControls({
  currentYear,
  minYear,
  maxYear,
  isPlaying,
  speed,
  onTogglePlay,
  onReset,
  onSpeedChange,
  onYearChange,
}: TimelineControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-white transition hover:bg-secondary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-light"
            aria-label={isPlaying ? 'Pause timeline animation' : 'Play timeline animation'}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            aria-label="Reset timeline animation"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        <div className="text-white/80 text-sm uppercase tracking-widest">
          {minYear} – {maxYear}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Current Year</span>
          <span className="text-lg font-semibold text-white">{currentYear}</span>
        </div>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={currentYear}
          onChange={(event) => onYearChange(Number(event.target.value))}
          className="accent-secondary"
          aria-label="Timeline year slider"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {speedOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSpeedChange(option)}
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              option === speed
                ? 'bg-white text-primary focus-visible:outline-white'
                : 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white/60'
            )}
            aria-pressed={option === speed}
          >
            {option}×
          </button>
        ))}
      </div>
    </div>
  )
}

