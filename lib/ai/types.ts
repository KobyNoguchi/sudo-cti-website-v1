export interface CisaVulnerability {
  cveID: string
  vendorProject: string
  product: string
  vulnerabilityName: string
  dateAdded: string
  shortDescription: string
  requiredAction: string
  dueDate: string
  knownRansomwareCampaignUse: string
  notes: string
  cwes?: string[]
}

export interface CisaFeed {
  title: string
  catalogVersion: string
  dateReleased: string
  count: number
  vulnerabilities: CisaVulnerability[]
}

export interface GreyNoiseReference {
  text: string | null
  url: string | null
}

export interface ParsedDescription {
  summaryText: string | null
  category: string | null
  intention: string | null
  recommendBlock: boolean | null
  references: GreyNoiseReference[]
  rawHtml: string
}

export interface GreyNoiseItem {
  title: string
  link: string
  pubDate: string
  guid: string
  description: ParsedDescription
}

export interface UploadedFileContext {
  id: string
  name: string
  type: string
  content: string
}

