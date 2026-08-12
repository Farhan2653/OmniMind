"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Search, BookOpen, Quote, FileText, CheckCircle2 } from "lucide-react"

export default function ResearchPage() {
  const [query, setQuery] = React.useState("")
  const [searching, setSearching] = React.useState(false)
  const [results, setResults] = React.useState<any[] | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    // Mock research processing time
    setTimeout(() => {
      setSearching(false)
      setResults([
        {
          title: "Attention Is All You Need",
          authors: "Vaswani et al. (Google Brain)",
          journal: "NeurIPS 2017",
          summary: "Introduced the Transformer network architecture based entirely on attention mechanisms, replacing recurrent layers.",
          relevance: "High (Primary Core Architecture)"
        },
        {
          title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
          authors: "Devlin et al. (Google AI)",
          journal: "NAACL 2019",
          summary: "Introduced bidirectional representations by joint conditioning on left and right context in all layers.",
          relevance: "Medium"
        }
      ])
    }, 1500)
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
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300">Synthesized Findings</h3>
            {results.map((res, i) => (
              <GlassPanel key={i} className="space-y-4 border border-white/5">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                      {res.title}
                    </h4>
                    <p className="text-xs text-neutral-400">{res.authors} — <span className="italic">{res.journal}</span></p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                    Relevance: {res.relevance}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                  <Quote className="w-3 h-3 text-neutral-500 mb-1 mr-1 inline" />
                  {res.summary}
                </p>
              </GlassPanel>
            ))}
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
