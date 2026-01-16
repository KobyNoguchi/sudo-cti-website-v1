'use client'

import { Download } from 'lucide-react'
import type { HitachiVulnerability } from '@/types'

interface HitachiExportButtonProps {
  vulnerabilities: HitachiVulnerability[]
  filename?: string
}

export default function HitachiExportButton({ vulnerabilities, filename = 'hitachi_vulnerabilities' }: HitachiExportButtonProps) {
  const handleExport = () => {
    // Create CSV content
    const headers = [
      'Advisory ID',
      'Title',
      'CVE IDs',
      'Description',
      'Last Update',
      'Affected Products',
      'Fixed Products',
      'URL'
    ]

    const rows = vulnerabilities.map(v => [
      v.advisory_id,
      `"${v.title.replace(/"/g, '""')}"`,
      v.cve_ids.join('; '),
      `"${v.description.replace(/"/g, '""')}"`,
      v.last_update,
      v.affected_products.map(p => `${p.product} (${p.versions})`).join('; '),
      v.fixed_products.join('; '),
      v.html_url
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 hover:border-slate-600 transition-colors"
    >
      <Download className="w-4 h-4" />
      <span>Export CSV</span>
    </button>
  )
}
