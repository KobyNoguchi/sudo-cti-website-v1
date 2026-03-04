export interface FeedSource {
  id: string
  name: string
  url: string
  color: string
  category: 'Threat Research' | 'Threat Intelligence' | 'Vulnerability' | 'Malware Analysis' | 'ICS/OT'
  description: string
}

export interface FeedItem {
  id: string
  title: string
  link: string
  pubDate: string      // ISO string
  description: string  // plain text excerpt, max ~300 chars
  sourceId: string
  sourceName: string
  sourceColor: string
  category: string
}

export interface FeedSourceResult {
  id: string
  name: string
  count: number
  error?: string
}

export interface ThreatFeedResponse {
  items: FeedItem[]
  sources: FeedSourceResult[]
  totalCount: number
  fetchedAt: string
}

export const FEED_SOURCES: FeedSource[] = [
  {
    id: 'checkpoint',
    name: 'Check Point Research',
    url: 'https://research.checkpoint.com/feed/',
    color: '#E31B23',
    category: 'Threat Research',
    description: 'Threat prevention research from Check Point\'s research division',
  },
  {
    id: 'microsoft',
    name: 'Microsoft Security',
    url: 'https://www.microsoft.com/en-us/security/blog/feed/',
    color: '#00A4EF',
    category: 'Threat Intelligence',
    description: 'Microsoft Security Response Center and threat intelligence',
  },
  {
    id: 'google-tag',
    name: 'Google TAG',
    url: 'https://blog.google/threat-analysis-group/rss/',
    color: '#4285F4',
    category: 'Threat Intelligence',
    description: 'Google Threat Analysis Group tracking state-sponsored attackers',
  },
  {
    id: 'talos',
    name: 'Cisco Talos',
    url: 'https://blog.talosintelligence.com/rss',
    color: '#1BA0D7',
    category: 'Threat Research',
    description: 'Threat intelligence and research from Cisco Talos',
  },
  {
    id: 'unit42',
    name: 'Palo Alto Unit 42',
    url: 'https://unit42.paloaltonetworks.com/feed/',
    color: '#FA582D',
    category: 'Threat Research',
    description: 'Threat intelligence and security research from Unit 42',
  },
  {
    id: 'sans',
    name: 'SANS ISC',
    url: 'https://isc.sans.edu/rssfeed.xml',
    color: '#6DBE45',
    category: 'Vulnerability',
    description: 'SANS Internet Storm Center diary entries and vulnerability alerts',
  },
  {
    id: 'securelist',
    name: 'Securelist',
    url: 'https://securelist.com/feed/',
    color: '#006BB4',
    category: 'Malware Analysis',
    description: 'Malware research and APT analysis from Kaspersky',
  },
  {
    id: 'welivesecurity',
    name: 'ESET Research',
    url: 'https://www.welivesecurity.com/en/feed/',
    color: '#1A8CFF',
    category: 'Malware Analysis',
    description: 'ESET security research, malware analysis, and threat reports',
  },
  {
    id: 'mandiant',
    name: 'Mandiant',
    url: 'https://www.mandiant.com/resources/blog/rss.xml',
    color: '#FF6600',
    category: 'Threat Intelligence',
    description: 'Frontline intelligence from Mandiant security research',
  },
  {
    id: 'greynoise',
    name: 'GreyNoise Labs',
    url: 'https://feeds.labs.greynoise.io/index.rss.xml',
    color: '#6E4EFF',
    category: 'Threat Intelligence',
    description: 'Internet noise analysis and threat intelligence from GreyNoise',
  },
]

/** Strip HTML tags and collapse whitespace into a plain text excerpt. */
export function toPlainText(html: string, maxLength = 300): string {
  const stripped = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  return stripped.length > maxLength ? stripped.slice(0, maxLength).replace(/\s\S*$/, '') + '…' : stripped
}

/** Safely extract a string value from xml2js node (handles object/string/array variants). */
export function xmlStr(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'object') {
    if (typeof node._ === 'string') return node._
    if (Array.isArray(node) && node.length > 0) return xmlStr(node[0])
    if (node.$?.href) return node.$.href
  }
  return String(node)
}
