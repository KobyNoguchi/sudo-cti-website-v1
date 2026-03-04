'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, subDays, subMonths, startOfYear } from 'date-fns'
import { Calendar, ChevronDown, X } from 'lucide-react'

interface HitachiDateRangeFilterProps {
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  dateField: 'last_update'
  onDateFieldChange: (field: 'last_update') => void
}

const presets = [
  { label: 'Last 7 days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 90 days', getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: 'Last 6 months', getValue: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
  { label: 'This year', getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
]

export default function HitachiDateRangeFilter({ 
  onDateRangeChange, 
  dateField, 
  onDateFieldChange 
}: HitachiDateRangeFilterProps) {
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)
  const [month, setMonth] = useState<Date>(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRangeSelect = (newRange: DateRange | undefined) => {
    setRange(newRange)
    onDateRangeChange({ from: newRange?.from, to: newRange?.to })
  }

  const handlePresetClick = (preset: typeof presets[0]) => {
    const newRange = preset.getValue()
    setRange(newRange)
    setMonth(newRange.from)
    onDateRangeChange(newRange)
  }

  const clearRange = () => {
    setRange(undefined)
    onDateRangeChange({ from: undefined, to: undefined })
  }

  const formatDateDisplay = () => {
    if (!range?.from) return 'Select date range'
    if (!range.to) return format(range.from, 'MMM d, yyyy')
    return `${format(range.from, 'MMM d, yyyy')} - ${format(range.to, 'MMM d, yyyy')}`
  }

  const hasSelection = range?.from !== undefined

  return (
    <div className="space-y-3">
      {/* Date Field Label */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-400">Filter by:</label>
        <div className="flex gap-2">
          <button
            onClick={() => onDateFieldChange('last_update')}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-all bg-red-500/20 text-red-400 border border-red-500/50"
          >
            Last Update
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-400">Date Range:</label>
        
        <div className="relative" ref={containerRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all min-w-[280px] ${
              hasSelection
                ? 'bg-red-500/10 border-red-500/50 text-red-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">{formatDateDisplay()}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Calendar */}
          {isOpen && (
            <div className="absolute z-50 mt-2 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-700">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Two Calendars Side by Side */}
              <DayPicker
                mode="range"
                selected={range}
                onSelect={handleRangeSelect}
                numberOfMonths={2}
                month={month}
                onMonthChange={setMonth}
                showOutsideDays
                classNames={{
                  months: 'flex gap-4',
                  month: 'space-y-2',
                  caption: 'flex justify-center relative items-center h-10',
                  caption_label: 'text-sm font-medium text-slate-200',
                  nav: 'flex items-center gap-1',
                  nav_button: 'h-7 w-7 bg-slate-700/50 hover:bg-slate-700 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors',
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                  table: 'w-full border-collapse',
                  head_row: 'flex',
                  head_cell: 'text-slate-500 w-9 font-medium text-xs',
                  row: 'flex w-full mt-1',
                  cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
                  day: 'h-9 w-9 p-0 font-normal rounded-md hover:bg-slate-700 text-slate-300 transition-colors',
                  day_selected: 'bg-red-500 text-white hover:bg-red-600',
                  day_today: 'bg-slate-700 text-red-400 font-semibold',
                  day_outside: 'text-slate-600 opacity-50',
                  day_disabled: 'text-slate-600 opacity-50',
                  day_range_middle: 'bg-red-500/20 text-red-300 rounded-none',
                  day_range_start: 'bg-red-500 text-white rounded-l-md rounded-r-none',
                  day_range_end: 'bg-red-500 text-white rounded-r-md rounded-l-none',
                  day_hidden: 'invisible',
                }}
                modifiersStyles={{
                  selected: {
                    backgroundColor: 'rgb(239 68 68)',
                    color: 'white',
                  },
                }}
              />

              {/* Selected Range Display */}
              {hasSelection && (
                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    {formatDateDisplay()}
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clear Button */}
        {hasSelection && (
          <button
            onClick={clearRange}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 hover:border-red-500/50 hover:text-red-400 transition-all"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
