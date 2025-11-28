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

