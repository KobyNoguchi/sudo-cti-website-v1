'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Clock, Database } from 'lucide-react'
import SearchFilter from '@/components/vulnerabilities/SearchFilter'
import VulnerabilityTable from '@/components/vulnerabilities/VulnerabilityTable'
import ExportButton from '@/components/vulnerabilities/ExportButton'
import type { SiemensVulnerability, VulnerabilityData } from '@/types'

// Import the JSON data
import vulnerabilityData from '@/data/siemens-vulnerabilities.json'

export default function SiemensVulnerabilitiesPage() {
  const data = vulnerabilityData as VulnerabilityData
  const allVulnerabilities = data.vulnerabilities
  const [filteredVulnerabilities, setFilteredVulnerabilities] = useState<SiemensVulnerability[]>(allVulnerabilities)

  // Stats
  const criticalCount = allVulnerabilities.filter(v => {
    const score = v.cvss_v3_score ?? v.cvss_v4_score
    return score !== null && score >= 9.0
  }).length

  const highCount = allVulnerabilities.filter(v => {
    const score = v.cvss_v3_score ?? v.cvss_v4_score
    return score !== null && score >= 7.0 && score < 9.0
  }).length

  const totalCVEs = allVulnerabilities.reduce((sum, v) => sum + v.cve_ids.length, 0)

  const lastUpdated = data.metadata.scraped_at 
    ? new Date(data.metadata.scraped_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Unknown'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">
                  Vulnerability Intelligence
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Siemens Security Advisories
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl">
                Comprehensive database of security vulnerabilities affecting Siemens industrial products. 
                Data sourced from{' '}
                <a 
                  href="https://cert-portal.siemens.com/productcert/html/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                >
                  Siemens ProductCERT
                </a>.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700 rounded-lg">
                  <Database className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{allVulnerabilities.length}</div>
                  <div className="text-sm text-slate-400">Total Advisories</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
                  <div className="text-sm text-slate-400">Critical</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">{highCount}</div>
                  <div className="text-sm text-slate-400">High Severity</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{totalCVEs}</div>
                  <div className="text-sm text-slate-400">CVE IDs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Search and Export Row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <SearchFilter 
                vulnerabilities={allVulnerabilities}
                onFilterChange={setFilteredVulnerabilities}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">
                {filteredVulnerabilities.length} of {allVulnerabilities.length} shown
              </span>
              <ExportButton 
                vulnerabilities={filteredVulnerabilities}
                filename="siemens_vulnerabilities_export"
              />
            </div>
          </div>

          {/* Table */}
          <VulnerabilityTable vulnerabilities={filteredVulnerabilities} />

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
            <p className="text-sm text-slate-400">
              <strong className="text-slate-300">Disclaimer:</strong> This data is aggregated from publicly available 
              Siemens ProductCERT security advisories for informational purposes. Always refer to the 
              official{' '}
              <a 
                href="https://cert-portal.siemens.com/productcert/html/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                Siemens CERT Portal
              </a>
              {' '}for the most current and authoritative information.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

