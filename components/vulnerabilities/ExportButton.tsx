'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import type { SiemensVulnerability } from '@/types'

interface ExportButtonProps {
  vulnerabilities: SiemensVulnerability[]
  filename?: string
}

export default function ExportButton({ vulnerabilities, filename = 'siemens_vulnerabilities' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const getSeverity = (vuln: SiemensVulnerability): string => {
    const score = vuln.cvss_v3_score ?? vuln.cvss_v4_score
    if (score === null) return 'Unknown'
    if (score >= 9.0) return 'Critical'
    if (score >= 7.0) return 'High'
    if (score >= 4.0) return 'Medium'
    return 'Low'
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    
    try {
      // Dynamic import of xlsx library
      const XLSX = await import('xlsx')
      
      // Sheet 1: Overview
      const overviewData = vulnerabilities.map(vuln => ({
        'SSA ID': vuln.ssa_id,
        'Title': vuln.title,
        'CVSS v3.1': vuln.cvss_v3_score ?? '',
        'CVSS v4.0': vuln.cvss_v4_score ?? '',
        'Severity': getSeverity(vuln),
        'CVE IDs': vuln.cve_ids.join(', '),
        'Publication Date': vuln.publication_date,
        'Last Update': vuln.last_update,
        'Version': vuln.version,
        'Summary': vuln.summary.substring(0, 500) + (vuln.summary.length > 500 ? '...' : ''),
      }))

      // Sheet 2: Affected Products
      const productsData: Record<string, unknown>[] = []
      vulnerabilities.forEach(vuln => {
        vuln.affected_products.forEach(product => {
          productsData.push({
            'SSA ID': vuln.ssa_id,
            'Product': product.product,
            'Affected Versions': product.versions,
            'Remediation': product.remediation,
            'CVE ID': product.cve_id ?? '',
          })
        })
      })

      // Sheet 3: CVE Mapping
      const cveData: Record<string, unknown>[] = []
      vulnerabilities.forEach(vuln => {
        vuln.cve_ids.forEach(cve => {
          cveData.push({
            'SSA ID': vuln.ssa_id,
            'CVE ID': cve,
            'Title': vuln.title,
            'CVSS v3.1': vuln.cvss_v3_score ?? '',
            'Severity': getSeverity(vuln),
          })
        })
      })

      // Sheet 4: Links
      const linksData = vulnerabilities.map(vuln => ({
        'SSA ID': vuln.ssa_id,
        'HTML URL': vuln.html_url,
        'CSAF URL': vuln.csaf_url ?? '',
        'PDF URL': vuln.pdf_url ?? '',
        'TXT URL': vuln.txt_url ?? '',
      }))

      // Create workbook
      const wb = XLSX.utils.book_new()
      
      // Add sheets
      const wsOverview = XLSX.utils.json_to_sheet(overviewData)
      XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview')

      if (productsData.length > 0) {
        const wsProducts = XLSX.utils.json_to_sheet(productsData)
        XLSX.utils.book_append_sheet(wb, wsProducts, 'Affected Products')
      }

      if (cveData.length > 0) {
        const wsCVE = XLSX.utils.json_to_sheet(cveData)
        XLSX.utils.book_append_sheet(wb, wsCVE, 'CVE Mapping')
      }

      const wsLinks = XLSX.utils.json_to_sheet(linksData)
      XLSX.utils.book_append_sheet(wb, wsLinks, 'Links')

      // Set column widths
      const setColumnWidths = (ws: XLSX.WorkSheet, widths: number[]) => {
        ws['!cols'] = widths.map(w => ({ wch: w }))
      }

      setColumnWidths(wsOverview, [15, 60, 10, 10, 12, 40, 15, 15, 10, 80])
      if (productsData.length > 0) {
        const wsProducts = wb.Sheets['Affected Products']
        setColumnWidths(wsProducts, [15, 40, 30, 60, 20])
      }
      if (cveData.length > 0) {
        const wsCVE = wb.Sheets['CVE Mapping']
        setColumnWidths(wsCVE, [15, 20, 60, 10, 12])
      }
      setColumnWidths(wsLinks, [15, 70, 70, 70, 70])

      // Generate and download file
      const timestamp = new Date().toISOString().split('T')[0]
      XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`)
      
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={exportToExcel}
      disabled={isExporting || vulnerabilities.length === 0}
      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg shadow-emerald-900/20"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-5 h-5" />
          <span>Export to Excel</span>
          <Download className="w-4 h-4" />
        </>
      )}
    </button>
  )
}

