'use client'

import { useState, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'
import type { SiemensVulnerability, VulnerabilitySeverity } from '@/types'

interface SearchFilterProps {
  vulnerabilities: SiemensVulnerability[]
  onFilterChange: (filtered: SiemensVulnerability[]) => void
}

export default function SearchFilter({ vulnerabilities, onFilterChange }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<VulnerabilitySeverity | 'All'>('All')
  const [showFilters, setShowFilters] = useState(false)

  const getSeverity = (vuln: SiemensVulnerability): VulnerabilitySeverity => {
    const score = vuln.cvss_v3_score ?? vuln.cvss_v4_score
    if (score === null) return 'Unknown'
    if (score >= 9.0) return 'Critical'
    if (score >= 7.0) return 'High'
    if (score >= 4.0) return 'Medium'
    return 'Low'
  }

  const applyFilters = useCallback((search: string, severity: VulnerabilitySeverity | 'All') => {
    let filtered = [...vulnerabilities]

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(vuln => 
        vuln.ssa_id.toLowerCase().includes(searchLower) ||
        vuln.title.toLowerCase().includes(searchLower) ||
        vuln.cve_ids.some(cve => cve.toLowerCase().includes(searchLower)) ||
        vuln.affected_products.some(p => 
          p.product.toLowerCase().includes(searchLower)
        ) ||
        vuln.summary.toLowerCase().includes(searchLower)
      )
    }

    // Apply severity filter
    if (severity !== 'All') {
      filtered = filtered.filter(vuln => getSeverity(vuln) === severity)
    }

    onFilterChange(filtered)
  }, [vulnerabilities, onFilterChange])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    applyFilters(value, severityFilter)
  }

  const handleSeverityChange = (value: VulnerabilitySeverity | 'All') => {
    setSeverityFilter(value)
    applyFilters(searchTerm, value)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSeverityFilter('All')
    onFilterChange(vulnerabilities)
  }

  const hasActiveFilters = searchTerm.trim() !== '' || severityFilter !== 'All'

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SSA ID, CVE, product, or keyword..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-cyan-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {(searchTerm.trim() ? 1 : 0) + (severityFilter !== 'All' ? 1 : 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 hover:border-red-500/50 hover:text-red-400 transition-all"
          >
            <X className="w-5 h-5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Severity</label>
              <div className="flex flex-wrap gap-2">
                {(['All', 'Critical', 'High', 'Medium', 'Low', 'Unknown'] as const).map((severity) => (
                  <button
                    key={severity}
                    onClick={() => handleSeverityChange(severity)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      severityFilter === severity
                        ? getSeverityButtonActiveStyle(severity)
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getSeverityButtonActiveStyle(severity: VulnerabilitySeverity | 'All'): string {
  switch (severity) {
    case 'Critical':
      return 'bg-red-500/20 text-red-400 border border-red-500/50'
    case 'High':
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
    case 'Medium':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
    case 'Low':
      return 'bg-green-500/20 text-green-400 border border-green-500/50'
    case 'Unknown':
      return 'bg-slate-500/20 text-slate-400 border border-slate-500/50'
    default:
      return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
  }
}

