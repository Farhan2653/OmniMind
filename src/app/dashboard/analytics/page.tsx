"use client"

import * as React from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { BarChart3, TrendingUp, Users, Activity, Target, Zap, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AnalyticsPage() {
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState({
    totalActivities: 0,
    avgInterviewScore: 0,
    avgResumeScore: 0,
    featuresUsed: 0
  })
  const [chartData, setChartData] = React.useState<{date: string, count: number, percent: number}[]>([])

  React.useEffect(() => {
    async function fetchData() {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session?.user) return

      const userId = sessionData.session.user.id

      // Fetch data
      const [
        { data: chats },
        { data: interviews },
        { data: resumes },
        { data: research }
      ] = await Promise.all([
        supabase.from('chats').select('created_at').eq('user_id', userId),
        supabase.from('interviews').select('score, created_at').eq('user_id', userId),
        supabase.from('resumes').select('score, created_at').eq('user_id', userId),
        supabase.from('research_queries').select('created_at').eq('user_id', userId)
      ])

      const c = chats || []
      const i = interviews || []
      const r = resumes || []
      const req = research || []

      const totalActs = c.length + i.length + r.length + req.length
      
      const interviewScores = i.map((item: any) => item.score).filter(Boolean)
      const avgInt = interviewScores.length > 0 ? interviewScores.reduce((a: number,b: number)=>a+b, 0) / interviewScores.length : 0

      const resumeScores = r.map((item: any) => item.score).filter(Boolean)
      const avgRes = resumeScores.length > 0 ? resumeScores.reduce((a: number,b: number)=>a+b, 0) / resumeScores.length : 0

      let feats = 0
      if (c.length > 0) feats++
      if (i.length > 0) feats++
      if (r.length > 0) feats++
      if (req.length > 0) feats++

      setStats({
        totalActivities: totalActs,
        avgInterviewScore: Math.round(avgInt),
        avgResumeScore: Math.round(avgRes),
        featuresUsed: feats
      })

      // Generate Chart Data (Last 12 Days)
      const days = 12
      const now = new Date()
      const datesArray = Array.from({ length: days }, (_, idx) => {
        const d = new Date()
        d.setDate(now.getDate() - (days - 1 - idx))
        d.setHours(0,0,0,0)
        return d
      })

      const allDates = [
        ...c.map((x: any) => new Date(x.created_at)),
        ...i.map((x: any) => new Date(x.created_at)),
        ...r.map((x: any) => new Date(x.created_at)),
        ...req.map((x: any) => new Date(x.created_at))
      ]

      const counts = datesArray.map(date => {
        const nextDate = new Date(date)
        nextDate.setDate(date.getDate() + 1)
        
        return allDates.filter(d => d >= date && d < nextDate).length
      })

      const maxCount = Math.max(...counts, 1) // prevent div by zero
      
      const formattedChart = counts.map((count, idx) => ({
        date: datesArray[idx].toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count,
        percent: count === 0 ? 0 : (count / maxCount) * 100
      }))

      setChartData(formattedChart)
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Analytics Hub</h1>
        <p className="text-xs text-neutral-400">Track your AI usage and evaluate your performance over time.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Total AI Activities</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-bold">{loading ? "..." : stats.totalActivities}</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Avg Interview Score</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-bold">{loading ? "..." : `${stats.avgInterviewScore}%`}</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Avg Resume Score</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold">{loading ? "..." : `${stats.avgResumeScore}/100`}</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Features Used</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold">{loading ? "..." : `${stats.featuresUsed}/4`}</span>
        </div>
      </div>

      <GlassPanel className="p-6 border border-white/5 min-h-[300px] flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold mb-2">Activity History (Last 12 Days)</h3>
          <p className="text-xs text-neutral-400">Visual representation of your interactions with all AI tools.</p>
        </div>
        
        {/* Real Chart */}
        <div className="flex flex-col mt-6">
          <div className="flex items-end gap-3 h-48 border-b border-white/5 pb-2">
            {chartData.length === 0 ? (
               <div className="w-full flex items-center justify-center text-neutral-500 h-full">
                 <div className="animate-pulse">Loading chart data...</div>
               </div>
            ) : (
              chartData.map((data, idx) => (
                <div key={idx} className="flex-1 bg-white/5 rounded-t-sm relative group hover:bg-white/10 transition-colors h-full flex items-end" title={`${data.count} activities`}>
                  <div 
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm relative flex justify-center transition-all duration-1000 ease-out"
                    style={{ height: `${Math.max(data.percent, 2)}%`, opacity: data.count === 0 ? 0 : 1 }}
                  >
                    {data.count > 0 && (
                       <span className="absolute -top-6 text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         {data.count}
                       </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-3 pt-3">
             {chartData.map((data, idx) => (
               <div key={idx} className="flex-1 text-center text-[9px] text-neutral-500 hidden sm:block whitespace-nowrap">
                 {data.date}
               </div>
             ))}
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
