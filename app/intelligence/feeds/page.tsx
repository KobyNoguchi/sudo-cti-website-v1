'use client'

import { useEffect, useState, useMemo } from 'react'
import { Rss, ExternalLink, Search, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react'
import { FeedItem, ThreatFeedResponse, FEED_SOURCES } from '@/lib/threatFeeds'

const CATEGORIES = ['All Categories', 'Threat Research', 'Threat Intelligence', 'Vulnerability', 'Malware Analysis', 'ICS/OT']
const PAGE_SIZE = 24

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-slate-600" />
        <div className="h-3 w-24 bg-slate-700 rounded" />
        <div className="ml-auto h-3 w-16 bg-slate-700 rounded" />
      </div>
      <div className="h-4 bg-slate-700 rounded mb-2" />
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-700/50 rounded" />
        <div className="h-3 bg-slate-700/50 rounded w-5/6" />
        <div className="h-3 bg-slate-700/50 rounded w-4/6" />
      </div>
    </div>
  )
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-500 hover:bg-slate-800/80 transition-all duration-200"
    >
      {/* Source + date row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${item.sourceColor}20`,
            color: item.sourceColor,
            border: `1px solid ${item.sourceColor}40`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.sourceColor }} />
          {item.sourceName}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/50">
          {item.category}
        </span>
        <span className="ml-auto text-xs text-slate-500 flex-shrink-0">{timeAgo(item.pubDate)}</span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors leading-snug mb-3 line-clamp-2">
        {item.title}
      </h3>

      {/* Description */}
      {item.description && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 flex-1 mb-4">
          {item.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-cyan-400 transition-colors mt-auto pt-3 border-t border-slate-700/50">
        <ExternalLink className="w-3 h-3" />
        <span>Read article</span>
      </div>
    </a>
  )
}

export default function FeedsPage() {
  const [data, setData] = useState<ThreatFeedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeSource, setActiveSource] = useState('all')
  const [activeCategory, setActiveCategory] = useState('All Categories')
  const [page, setPage] = useState(1)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const fetchFeeds = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/threat-feeds')
      if (!res.ok) throw new Error(`Failed to fetch feeds (${res.status})`)
      const json: ThreatFeedResponse = await res.json()
      setData(json)
      setLastRefreshed(new Date())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFeeds() }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.items.filter((item) => {
      if (activeSource !== 'all' && item.sourceId !== activeSource) return false
      if (activeCategory !== 'All Categories' && item.category !== activeCategory) return false
      if (search) {
        const q = search.toLowerCase()
        return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.sourceName.toLowerCase().includes(q)
      }
      return true
    })
  }, [data, activeSource, activeCategory, search])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < filtered.length

  const workingSources = data?.sources.filter((s) => s.count > 0) ?? []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full mb-6">
              <Rss className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">
                Live Intelligence
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Open Source Threat Intel Feeds
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Aggregated in real-time from leading threat research organizations — Check Point, Google TAG, Talos, Unit 42, Mandiant, and more.
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-white font-bold text-lg">{loading ? '—' : data?.totalCount ?? 0}</span>
              articles
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-white font-bold text-lg">{workingSources.length}</span>
              live sources
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-2 text-slate-400">
              {lastRefreshed
                ? <><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />Updated {timeAgo(lastRefreshed.toISOString())}</>
                : <span className="text-slate-500">Loading…</span>
              }
            </div>
            <button
              onClick={fetchFeeds}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[80px] z-30 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto space-y-3">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles, sources, topics…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition"
            />
          </div>

          {/* Source + Category toggles */}
          <div className="flex flex-wrap gap-2">
            {/* Source filter */}
            <button
              onClick={() => { setActiveSource('all'); setPage(1) }}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                activeSource === 'all'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
              }`}
            >
              All Sources
            </button>
            {FEED_SOURCES.map((src) => {
              const result = data?.sources.find((s) => s.id === src.id)
              const isActive = activeSource === src.id
              return (
                <button
                  key={src.id}
                  onClick={() => { setActiveSource(src.id); setPage(1) }}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    isActive
                      ? 'text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                  }`}
                  style={isActive ? {
                    backgroundColor: `${src.color}25`,
                    borderColor: `${src.color}60`,
                    color: src.color,
                  } : {}}
                >
                  {src.name}
                  {result && result.count > 0 && (
                    <span className="ml-1 opacity-60">({result.count})</span>
                  )}
                </button>
              )
            })}

            {/* Divider */}
            <div className="w-px h-5 bg-slate-700 self-center mx-1" />

            {/* Category filter */}
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1) }}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-600 border-slate-500 text-white'
                    : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feed grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Failed sources notice */}
          {!loading && data && data.sources.some((s) => s.error) && (
            <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6 text-amber-400 text-xs">
              {data.sources.filter((s) => s.error).map((s) => s.name).join(', ')} could not be reached and are excluded from results.
            </div>
          )}

          {/* Results count */}
          {!loading && data && (
            <div className="text-sm text-slate-500 mb-4">
              Showing <span className="text-white font-medium">{Math.min(paginated.length, filtered.length)}</span> of <span className="text-white font-medium">{filtered.length}</span> articles
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <Rss className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium text-slate-400">No articles found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginated.map((item) => (
                  <FeedCard key={`${item.sourceId}-${item.id}`} item={item} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all"
                  >
                    Load more
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Source directory */}
      {!loading && (
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-4">Feed Sources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FEED_SOURCES.map((src) => {
                  const result = data?.sources.find((s) => s.id === src.id)
                  return (
                    <div key={src.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <span className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: src.color }} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{src.name}</span>
                          {result?.error
                            ? <span className="text-xs text-red-400 flex-shrink-0">Unavailable</span>
                            : <span className="text-xs text-slate-500 flex-shrink-0">{result?.count ?? 0} articles</span>
                          }
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{src.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
