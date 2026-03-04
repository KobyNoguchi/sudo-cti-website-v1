'use client'

import { useState, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'
import HitachiDateRangeFilter from './HitachiDateRangeFilter'
import type { HitachiVulnerability } from '@/types'

interface HitachiSearchFilterProps {
  vulnerabilities: HitachiVulnerability[]
  onFilterChange: (filtered: HitachiVulnerability[]) => void
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

// Parse Hitachi date format: "December 23, 2025" or "January 14, 2026"
function parseHitachiDate(dateStr: string): Date | null {
  if (!dateStr) return null
  
  // Try parsing "Month Day, Year" format
  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) {
    return parsed
  }
  
  return null
}

export default function HitachiSearchFilter({ vulnerabilities, onFilterChange }: HitachiSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [cveCountFilter, setCveCountFilter] = useState<'All' | '1-2' | '3-5' | '5+'>('All')
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const [dateField, setDateField] = useState<'last_update'>('last_update')

  const applyFilters = useCallback((
    search: string, 
    cveCount: 'All' | '1-2' | '3-5' | '5+',
    dates: DateRange,
    field: 'last_update'
  ) => {
    let filtered = [...vulnerabilities]

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(vuln => 
        vuln.advisory_id.toLowerCase().includes(searchLower) ||
        vuln.title.toLowerCase().includes(searchLower) ||
        vuln.cve_ids.some(cve => cve.toLowerCase().includes(searchLower)) ||
        vuln.affected_products.some(p => 
          p.product.toLowerCase().includes(searchLower)
        ) ||
        vuln.description.toLowerCase().includes(searchLower)
      )
    }

    // Apply CVE count filter
    if (cveCount !== 'All') {
      filtered = filtered.filter(vuln => {
        const count = vuln.cve_ids.length
        switch (cveCount) {
          case '1-2':
            return count >= 1 && count <= 2
          case '3-5':
            return count >= 3 && count <= 5
          case '5+':
            return count > 5
          default:
            return true
        }
      })
    }

    // Apply date range filter
    if (dates.from || dates.to) {
      filtered = filtered.filter(vuln => {
        const dateStr = vuln.last_update
        if (!dateStr) return false
        
        const vulnDate = parseHitachiDate(dateStr)
        if (!vulnDate) return false
        
        // Normalize to start of day for comparison
        const vulnDateNormalized = new Date(vulnDate.getFullYear(), vulnDate.getMonth(), vulnDate.getDate())
        
        if (dates.from && dates.to) {
          const fromNormalized = new Date(dates.from.getFullYear(), dates.from.getMonth(), dates.from.getDate())
          const toNormalized = new Date(dates.to.getFullYear(), dates.to.getMonth(), dates.to.getDate())
          return vulnDateNormalized >= fromNormalized && vulnDateNormalized <= toNormalized
        } else if (dates.from) {
          const fromNormalized = new Date(dates.from.getFullYear(), dates.from.getMonth(), dates.from.getDate())
          return vulnDateNormalized >= fromNormalized
        } else if (dates.to) {
          const toNormalized = new Date(dates.to.getFullYear(), dates.to.getMonth(), dates.to.getDate())
          return vulnDateNormalized <= toNormalized
        }
        
        return true
      })
    }

    onFilterChange(filtered)
  }, [vulnerabilities, onFilterChange])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    applyFilters(value, cveCountFilter, dateRange, dateField)
  }

  const handleCveCountChange = (value: 'All' | '1-2' | '3-5' | '5+') => {
    setCveCountFilter(value)
    applyFilters(searchTerm, value, dateRange, dateField)
  }

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range)
    applyFilters(searchTerm, cveCountFilter, range, dateField)
  }

  const handleDateFieldChange = (field: 'last_update') => {
    setDateField(field)
    applyFilters(searchTerm, cveCountFilter, dateRange, field)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCveCountFilter('All')
    setDateRange({ from: undefined, to: undefined })
    onFilterChange(vulnerabilities)
  }

  const hasActiveFilters = searchTerm.trim() !== '' || cveCountFilter !== 'All' || dateRange.from !== undefined || dateRange.to !== undefined
  
  const activeFilterCount = 
    (searchTerm.trim() ? 1 : 0) + 
    (cveCountFilter !== 'All' ? 1 : 0) +
    (dateRange.from || dateRange.to ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Advisory ID, CVE, product, or keyword..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-red-500/20 border-red-500 text-red-400'
              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-red-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 hover:border-red-500/50 hover:text-red-400 transition-all"
          >
            <X className="w-5 h-5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg space-y-6">
          {/* CVE Count Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">CVE Count</label>
            <div className="flex flex-wrap gap-2">
              {(['All', '1-2', '3-5', '5+'] as const).map((count) => (
                <button
                  key={count}
                  onClick={() => handleCveCountChange(count)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    cveCountFilter === count
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {count === 'All' ? 'All' : `${count} CVEs`}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="pt-4 border-t border-slate-700">
            <HitachiDateRangeFilter
              onDateRangeChange={handleDateRangeChange}
              dateField={dateField}
              onDateFieldChange={handleDateFieldChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}
