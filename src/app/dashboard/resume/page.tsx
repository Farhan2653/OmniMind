"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react"

import { supabase } from "@/lib/supabase"

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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setAnalyzing(true)
    setResults(null)
    
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "An error occurred while analyzing the resume")
      }

      const data = await res.json()
      
      // Save the analysis to Supabase
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.user) {
        await supabase.from("resumes").insert({
          user_id: sessionData.session.user.id,
          filename: file.name,
          analysis: data,
          score: data.overallScore || 0
        })
      }

      setResults(data)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "An error occurred while analyzing the resume")
    } finally {
      setAnalyzing(false)
    }
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
          <GlassPanel className="space-y-6 p-6">
            <h3 className="text-sm font-semibold mb-2">Upload Document</h3>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="border border-dashed border-white/10 rounded-xl p-6 text-center hover:border-white/20 transition-colors cursor-pointer relative bg-white/5">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <span className="block text-xs text-neutral-300 truncate px-2">
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
            <div className="space-y-6">
              {/* Overall Score */}
              <GlassPanel>
                <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{file?.name}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        AI Analyzed
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-neutral-400">Overall Score</span>
                    <span className={`text-3xl font-extrabold ${results.overallScore >= 80 ? 'text-emerald-400' : results.overallScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      {results.overallScore}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-white">Impact Analysis</h4>
                  <p className="text-sm text-neutral-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                    {results.impactSummary}
                  </p>
                </div>
              </GlassPanel>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <GlassPanel className="p-4 space-y-2">
                  <span className="text-xs text-neutral-400 font-medium">Skills Score</span>
                  <div className="text-2xl font-bold text-white">{results.skillsScore}/100</div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: `${results.skillsScore}%` }} />
                  </div>
                </GlassPanel>
                
                <GlassPanel className="p-4 space-y-2">
                  <span className="text-xs text-neutral-400 font-medium">Projects Score</span>
                  <div className="text-2xl font-bold text-white">{results.projectsScore}/100</div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full rounded-full" style={{ width: `${results.projectsScore}%` }} />
                  </div>
                </GlassPanel>

                <GlassPanel className="p-4 space-y-2">
                  <span className="text-xs text-neutral-400 font-medium">Experience Score</span>
                  <div className="text-2xl font-bold text-white">{results.experienceScore}/100</div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${results.experienceScore}%` }} />
                  </div>
                </GlassPanel>

                <GlassPanel className="p-4 space-y-2">
                  <span className="text-xs text-neutral-400 font-medium">Writing & Format</span>
                  <div className="text-2xl font-bold text-white">{results.writingScore}/100</div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${results.writingScore}%` }} />
                  </div>
                </GlassPanel>
              </div>

              {/* Strict Feedback */}
              <GlassPanel className="space-y-4 border-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Critical Improvements Needed
                </h4>
                <ul className="space-y-4">
                  {results.improvements.map((imp: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-200 bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                      <span className="leading-relaxed">{imp}</span>
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            </div>
          ) : (
            <GlassPanel className="h-full flex items-center justify-center py-12 text-center text-neutral-500">
              <div className="space-y-2 max-w-xs">
                <FileText className="w-8 h-8 mx-auto text-neutral-600" />
                <p className="text-xs">Upload your resume (PDF) to receive a rigorous AI analysis and statistical breakdown.</p>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  )
}
