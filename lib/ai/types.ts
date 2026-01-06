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

export interface TransformedGreyNoiseFeed {
  feedTitle: string
  feedLink: string
  feedDescription: string
  items: GreyNoiseItem[]
}

export interface UploadedFileContext {
  id: string
  name: string
  type: string
  content: string
}

// NVD Types
export interface NvdCveDescription {
  lang: string
  value: string
}

export interface NvdCve {
  id: string
  sourceIdentifier?: string
  published: string
  lastModified: string
  vulnStatus?: string
  descriptions: NvdCveDescription[]
  metrics?: {
    cvssMetricV31?: Array<{
      cvssData: {
        baseScore: number
        baseSeverity: string
      }
    }>
    cvssMetricV2?: Array<{
      cvssData: {
        baseScore: number
      }
      baseSeverity: string
    }>
  }
  references?: Array<{
    url: string
    source?: string
    tags?: string[]
  }>
}

export interface NvdVulnerability {
  cve: NvdCve
}

// MITRE Types
export interface Technique {
  id: string
  name: string
}

export interface Tactic {
  name: string
  techniques: Technique[]
}

