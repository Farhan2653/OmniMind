"use client"

import * as React from "react"

import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { Code2, Play, CheckCircle2, Clock, HardDrive, AlertTriangle, ExternalLink, Loader2 } from "lucide-react"

interface RelatedProblem {
  name: string
  platform: string
  url: string
}

interface AnalysisResult {
  timeComplexity: string
  spaceComplexity: string
  optimizationDetails: string
  isOptimized: boolean
  relatedProblems: RelatedProblem[]
}

const languageBoilerplates: Record<string, string> = {
  javascript: "// Write your algorithm here...\n\nfunction solve(arr) {\n  \n}",
  python: "# Write your algorithm here...\n\ndef solve(arr):\n    pass",
  cpp: "// Write your algorithm here...\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve(vector<int>& arr) {\n        \n    }\n};",
  java: "// Write your algorithm here...\nimport java.util.*;\n\nclass Solution {\n    public void solve(int[] arr) {\n        \n    }\n}"
}

export default function CodingPage() {
  const [code, setCode] = React.useState(languageBoilerplates.javascript)
  const [language, setLanguage] = React.useState("javascript")
  const [analyzing, setAnalyzing] = React.useState(false)
  const [result, setResult] = React.useState<AnalysisResult | null>(null)
  const [error, setError] = React.useState("")

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value
    setLanguage(newLang)
    
    const isBoilerplate = Object.values(languageBoilerplates).includes(code)
    if (isBoilerplate || code.trim() === "") {
      setCode(languageBoilerplates[newLang])
    } else {
      if (window.confirm("Changing language will replace your current code. Are you sure?")) {
        setCode(languageBoilerplates[newLang])
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    const value = target.value

    const pairs: Record<string, string> = {
      '{': '}',
      '(': ')',
      '[': ']',
      '"': '"',
      "'": "'"
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      setCode(newValue)
      setTimeout(() => { target.selectionStart = target.selectionEnd = start + 2 }, 0)
    } else if (pairs[e.key]) {
      e.preventDefault()
      const newValue = value.substring(0, start) + e.key + pairs[e.key] + value.substring(end)
      setCode(newValue)
      setTimeout(() => { target.selectionStart = target.selectionEnd = start + 1 }, 0)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const currentLine = value.substring(lineStart, start)
      const match = currentLine.match(/^\s*/)
      const indent = match ? match[0] : ""

      if (value[start - 1] === '{' && value[start] === '}') {
        const newValue = value.substring(0, start) + "\n" + indent + "  " + "\n" + indent + value.substring(end)
        setCode(newValue)
        setTimeout(() => { target.selectionStart = target.selectionEnd = start + indent.length + 3 }, 0)
      } else {
        const newValue = value.substring(0, start) + "\n" + indent + value.substring(end)
        setCode(newValue)
        setTimeout(() => { target.selectionStart = target.selectionEnd = start + indent.length + 1 }, 0)
      }
    }
  }

  const handleAnalyze = async () => {
    if (!code.trim()) return
    setAnalyzing(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/coding/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language })
      })

      if (!res.ok) {
        throw new Error("Failed to analyze code")
      }

      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Code2 className="w-8 h-8 text-blue-500" /> AI Coding Mentor
            </h1>
            <p className="text-neutral-400 mt-2">Write code, analyze complexity, and get optimization tips.</p>
          </div>
          <Button onClick={handleAnalyze} disabled={analyzing} className="flex items-center gap-2 px-6">
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {analyzing ? "Analyzing..." : "Analyze Code"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Editor Panel */}
          <GlassPanel className="p-0 overflow-hidden flex flex-col h-full border border-white/10 rounded-2xl">
            <div className="px-4 py-3 bg-black/40 border-b border-white/5 flex justify-between items-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <select 
                value={language}
                onChange={handleLanguageChange}
                className="bg-transparent text-sm text-neutral-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            <div className="flex-1 p-4 flex flex-col min-h-[450px]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 w-full bg-transparent text-neutral-200 font-mono text-[15px] leading-relaxed resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
          </GlassPanel>

          {/* Results Panel */}
          <GlassPanel className="p-6 h-full overflow-y-auto flex flex-col border border-white/10 rounded-2xl">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                {error}
              </div>
            )}
            
            {!result && !analyzing && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                <Code2 className="w-12 h-12 mb-4 opacity-20" />
                <p>Run analysis to see time and space complexity.</p>
              </div>
            )}

            {analyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                <p className="animate-pulse">Evaluating algorithm...</p>
              </div>
            )}

            {result && !analyzing && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Complexity Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-neutral-400 mb-2">
                      <Clock className="w-4 h-4 text-orange-400" /> Time Complexity
                    </div>
                    <div className="text-2xl font-mono text-white">{result.timeComplexity}</div>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-neutral-400 mb-2">
                      <HardDrive className="w-4 h-4 text-purple-400" /> Space Complexity
                    </div>
                    <div className="text-2xl font-mono text-white">{result.spaceComplexity}</div>
                  </div>
                </div>

                {/* Optimization Status */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${result.isOptimized ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                  {result.isOptimized ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />}
                  <div>
                    <h3 className="font-bold mb-1">{result.isOptimized ? "Fully Optimized" : "Optimization Possible"}</h3>
                    <div className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap">
                      {result.optimizationDetails}
                    </div>
                  </div>
                </div>

                {/* Related Problems */}
                {result.relatedProblems && result.relatedProblems.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wider">Related Practice Problems</h3>
                    <div className="space-y-3">
                      {result.relatedProblems.map((prob, i) => (
                        <a 
                          key={i} 
                          href={prob.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors group"
                        >
                          <div>
                            <div className="font-medium text-blue-400 group-hover:text-blue-300 transition-colors">{prob.name}</div>
                            <div className="text-xs text-neutral-500 mt-1">{prob.platform}</div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
