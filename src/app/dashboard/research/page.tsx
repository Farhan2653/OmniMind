"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Search, BookOpen, Quote, ExternalLink, Activity } from "lucide-react"

export default function ResearchPage() {
  const [query, setQuery] = React.useState("")
  const [searching, setSearching] = React.useState(false)
  const [results, setResults] = React.useState<any[] | null>(null)
  const [page, setPage] = React.useState(1)
  const [hasMore, setHasMore] = React.useState(false)
  const [loadingMore, setLoadingMore] = React.useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    setPage(1)
    try {
      const res = await fetch("/api/research/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, page: 1 })
      })
      
      const data = await res.json()
      if (res.ok) {
        setResults(data.results)
        setHasMore(data.results.length === 10) // openalex gives 10 per page
      } else {
        console.error(data.error)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    
    try {
      const res = await fetch("/api/research/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, page: nextPage })
      })
      
      const data = await res.json()
      if (res.ok) {
        setResults((prev) => [...(prev || []), ...data.results])
        setPage(nextPage)
        setHasMore(data.results.length === 10)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">AI Research Assistant</h1>
        <p className="text-xs text-neutral-400">Synthesize academic articles, cross-reference data, and build summaries.</p>
      </div>

      <GlassPanel className="p-4 bg-white/5 border border-white/10">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search query (e.g. 'Transformer architecture optimization techniques')..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-sm"
            />
          </div>
          <Button type="submit" variant="primary" className="rounded-xl px-6" disabled={searching}>
            {searching ? "Researching..." : "Search"}
          </Button>
        </form>
      </GlassPanel>

      <div className="space-y-4">
        {searching && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <GlassPanel key={i} className="animate-pulse space-y-3">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/5 rounded w-1/4" />
                <div className="space-y-1.5 pt-2">
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-5/6" />
                </div>
              </GlassPanel>
            ))}
          </div>
        )}

        {!searching && results && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-neutral-300">Top Research Papers</h3>
            {results.map((res, i) => (
              <GlassPanel key={i} className="p-6 space-y-5 border border-white/5 relative group hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 pr-10">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2 leading-tight">
                      <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />
                      {res.url ? (
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-300 transition-colors">
                          {res.title}
                        </a>
                      ) : (
                        res.title
                      )}
                    </h4>
                    <p className="text-sm text-neutral-400 leading-relaxed">{res.authors} — <span className="italic text-neutral-300">{res.journal}</span> ({res.year})</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap flex items-center gap-1.5 font-medium">
                      <Activity className="w-3.5 h-3.5" />
                      {res.citations.toLocaleString()} Citations
                    </span>
                    {res.url && (
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors p-1">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  <Quote className="w-4 h-4 text-neutral-500 mb-1 mr-2 inline" />
                  {res.summary}
                </p>
              </GlassPanel>
            ))}

            {hasMore && (
              <div className="pt-6 flex justify-center">
                <Button onClick={handleLoadMore} disabled={loadingMore} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl px-8 py-2.5">
                  {loadingMore ? "Loading more..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        )}

        {!searching && !results && (
          <GlassPanel className="py-16 text-center text-neutral-500">
            <div className="space-y-2 max-w-xs mx-auto">
              <Search className="w-8 h-8 mx-auto text-neutral-600" />
              <p className="text-xs">Search for topics to research papers and synthesized answers.</p>
            </div>
          </GlassPanel>
        )}
      </div>
    </div>
  )
}
