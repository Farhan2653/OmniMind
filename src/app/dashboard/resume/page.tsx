"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react"

export default function ResumePage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [analyzing, setAnalyzing] = React.useState(false)
  const [results, setResults] = React.useState<any | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResults(null)
    }
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setAnalyzing(true)
    // Mock resume analysis duration
    setTimeout(() => {
      setAnalyzing(false)
      setResults({
        score: 82,
        impactSummary: "Strong technical skills listed, but action verbs and metrics in the work history section could be enhanced.",
        improvements: [
          "Include quantifiable metrics (e.g., 'Improved database speed by 35%')",
          "Shorten summary section to maximum 3 sentences",
          "Add Docker and Kubernetes keywords to target ATS parser patterns"
        ],
        atsFriendly: true
      })
    }, 2000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">AI Resume Analyzer</h1>
        <p className="text-xs text-neutral-400">Optimize your resume against ATS search systems and industry rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Column */}
        <div className="md:col-span-1">
          <GlassPanel className="space-y-4">
            <h3 className="text-sm font-semibold">Upload Document</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border border-dashed border-white/10 rounded-xl p-6 text-center hover:border-white/20 transition-colors cursor-pointer relative bg-white/5">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <span className="block text-xs text-neutral-300">
                  {file ? file.name : "Select PDF or Word doc"}
                </span>
                <span className="block text-[10px] text-neutral-500 mt-1">Max file size 5MB</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full rounded-xl"
                disabled={!file || analyzing}
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                  </>
                ) : (
                  "Analyze Resume"
                )}
              </Button>
            </form>
          </GlassPanel>
        </div>

        {/* Results Column */}
        <div className="md:col-span-2">
          {results ? (
            <GlassPanel className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{file?.name}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ATS Verified
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-neutral-400">Score</span>
                  <span className="text-2xl font-extrabold text-blue-400">{results.score}/100</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-white">Impact Analysis</h4>
                <p className="text-xs text-neutral-300 leading-relaxed">{results.impactSummary}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-white">Suggested Fixes</h4>
                <ul className="space-y-2.5">
                  {results.improvements.map((imp: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-300">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassPanel>
          ) : (
            <GlassPanel className="h-full flex items-center justify-center py-12 text-center text-neutral-500">
              <div className="space-y-2 max-w-xs">
                <FileText className="w-8 h-8 mx-auto text-neutral-600" />
                <p className="text-xs">Upload your resume to view full details and analysis output.</p>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  )
}
