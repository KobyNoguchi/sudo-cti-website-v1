import { NextResponse } from 'next/server'
import { parseStringPromise } from 'xml2js'
import { FEED_SOURCES, FeedItem, FeedSourceResult, ThreatFeedResponse, toPlainText, xmlStr } from '@/lib/threatFeeds'

export const revalidate = 3600

/** Parse an RSS 2.0 or Atom feed XML string into normalized FeedItems. */
async function parseFeed(xml: string, source: typeof FEED_SOURCES[0]): Promise<FeedItem[]> {
  const parsed = await parseStringPromise(xml, {
    explicitArray: false,
    trim: true,
    strict: false,
    tagNameProcessors: [(s) => s.toLowerCase().replace(/^.*:/, '')], // strip namespace prefixes
  })

  const items: FeedItem[] = []

  // --- RSS 2.0 ---
  const channel = parsed?.rss?.channel ?? parsed?.['rdf:rdf']?.channel ?? parsed?.rdf?.channel
  if (channel) {
    const rawItems = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : []
    for (const item of rawItems) {
      const title = xmlStr(item.title)
      const link = xmlStr(item.link) || xmlStr(item.guid)
      const pubDate = xmlStr(item.pubdate) || xmlStr(item.published) || xmlStr(item.date)
      const description = toPlainText(xmlStr(item.description) || xmlStr(item.summary) || xmlStr(item.content))

      if (!title || !link) continue

      items.push({
        id: xmlStr(item.guid) || link,
        title,
        link,
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        description,
        sourceId: source.id,
        sourceName: source.name,
        sourceColor: source.color,
        category: source.category,
      })
    }
    return items
  }

  // --- Atom ---
  const feed = parsed?.feed
  if (feed) {
    const rawEntries = Array.isArray(feed.entry) ? feed.entry : feed.entry ? [feed.entry] : []
    for (const entry of rawEntries) {
      const title = xmlStr(entry.title)

      // Atom link can be a single object or array
      let link = ''
      if (Array.isArray(entry.link)) {
        const alt = entry.link.find((l: any) => l?.$?.rel === 'alternate' || !l?.$?.rel)
        link = alt?.$?.href || xmlStr(entry.link[0])
      } else {
        link = entry.link?.$?.href || xmlStr(entry.link) || xmlStr(entry.id)
      }

      const pubDate = xmlStr(entry.published) || xmlStr(entry.updated)
      const description = toPlainText(
        xmlStr(entry.summary) || xmlStr(entry.content) || xmlStr(entry.description)
      )

      if (!title || !link) continue

      items.push({
        id: xmlStr(entry.id) || link,
        title,
        link,
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        description,
        sourceId: source.id,
        sourceName: source.name,
        sourceColor: source.color,
        category: source.category,
      })
    }
    return items
  }

  return []
}

export async function GET() {
  const results = await Promise.allSettled(
    FEED_SOURCES.map(async (source) => {
      const res = await fetch(source.url, {
        next: { revalidate: 3600 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SudoCTI-FeedReader/1.0)',
          Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const xml = await res.text()
      const items = await parseFeed(xml, source)
      return { source, items }
    })
  )

  const allItems: FeedItem[] = []
  const sourceResults: FeedSourceResult[] = []

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const source = FEED_SOURCES[i]

    if (result.status === 'fulfilled') {
      allItems.push(...result.value.items)
      sourceResults.push({ id: source.id, name: source.name, count: result.value.items.length })
    } else {
      console.error(`[threat-feeds] Failed to fetch ${source.name}:`, result.reason?.message)
      sourceResults.push({ id: source.id, name: source.name, count: 0, error: result.reason?.message })
    }
  }

  // Sort all items newest first
  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  const response: ThreatFeedResponse = {
    items: allItems,
    sources: sourceResults,
    totalCount: allItems.length,
    fetchedAt: new Date().toISOString(),
  }

  return NextResponse.json(response)
}
