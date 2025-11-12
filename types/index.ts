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

