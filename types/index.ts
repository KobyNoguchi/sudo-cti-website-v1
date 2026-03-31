export interface NavItem {
  label: string
  href: string
  megaMenu?: {
    columns: Array<{
      title: string
      links: Array<{ label: string; href: string }>
    }>
  }
}

export interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export interface Stat {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  description: string
}

export type RansomwareSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface RansomwareAttack {
  id: number
  organization: string
  city: string
  state: string
  lat: number
  lng: number
  ransomAmount: number
  ransomDisplay: string
  date: string
  ransomwareFamily: string
  severity: RansomwareSeverity
  attackerOrigin?: { lat: number; lng: number }
}

// Siemens Vulnerability Types
export interface AffectedProduct {
  product: string
  versions: string
  remediation: string
  cve_id?: string | null
}

export interface SiemensVulnerability {
  ssa_id: string
  title: string
  cvss_v3_score: number | null
  cvss_v4_score: number | null
  cve_ids: string[]
  publication_date: string
  last_update: string
  version: string
  summary: string
  affected_products: AffectedProduct[]
  mitigations: string[]
  general_recommendations: string[]
  html_url: string
  csaf_url: string | null
  pdf_url: string | null
  txt_url: string | null
}

export interface VulnerabilityData {
  metadata: {
    source: string
    scraped_at: string
    total_count: number
    url: string
  }
  vulnerabilities: SiemensVulnerability[]
}

export type VulnerabilitySeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Unknown'

// Hitachi Vulnerability Types
export interface HitachiAffectedProduct {
  product: string
  versions: string
  fixed_version: string
  cve_id?: string | null
}export interface HitachiVulnerability {
  advisory_id: string
  title: string
  cve_ids: string[]
  cvss_scores: Record<string, number>
  description: string
  publication_date: string
  last_update: string
  affected_products: HitachiAffectedProduct[]
  fixed_products: string[]
  html_url: string
}export interface HitachiVulnerabilityData {
  metadata: {
    source: string
    scraped_at: string
    total_count: number
    url: string
  }
  vulnerabilities: HitachiVulnerability[]
}