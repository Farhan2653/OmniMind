"use client"

import * as React from "react"
import { FadeIn } from "@/components/animations/FadeIn"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Activity, Clock, CheckCircle2, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Greeting } from "@/components/dashboard/Greeting"

export default function DashboardHome() {
  const [session, setSession] = React.useState<any>(null)
  const [stats, setStats] = React.useState({ chats: 0, interviews: 0, resumes: 0, hoursSpent: 0 })
  const [recentChats, setRecentChats] = React.useState<any[]>([])
  const [newsArticles, setNewsArticles] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (session?.user) {
        const [chatsCount, interviewsCount, resumesCount, profileData, recentChatsData] = await Promise.all([
          supabase.from('chats').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
          supabase.from('interviews').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
          supabase.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
          (supabase.from('profiles').select('total_chats_created, time_spent_seconds').eq('id', session.user.id).single() as any),
          supabase.from('chats').select('id, title, updated_at').eq('user_id', session.user.id).order('updated_at', { ascending: false }).limit(5)
        ])
        
        let actualChatsInDB = chatsCount.count || 0
        let profileChatCount = profileData.data?.total_chats_created || 0
        let timeSpentSeconds = profileData.data?.time_spent_seconds || 0

        if (profileData.error && profileData.error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile } = await supabase.from('profiles').insert({ id: session.user.id, total_chats_created: actualChatsInDB, time_spent_seconds: 0 }).select().single()
          if (newProfile) {
            profileChatCount = newProfile.total_chats_created
            timeSpentSeconds = newProfile.time_spent_seconds
          }
        }

        const allTimeChats = Math.max(actualChatsInDB, profileChatCount)

        setStats({
          chats: allTimeChats,
          interviews: interviewsCount.count || 0,
          resumes: resumesCount.count || 0,
          hoursSpent: Number((timeSpentSeconds / 3600).toFixed(1)),
        })

        if (recentChatsData.data) {
          setRecentChats(recentChatsData.data)
        }
      }

      try {
        const res = await fetch("https://dev.to/api/articles?tag=ai&per_page=3")
        if (res.ok) {
          const articles = await res.json()
          setNewsArticles(articles)
        }
      } catch (err) {
        console.error("Failed to fetch AI news:", err)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <Greeting />
          <p className="text-neutral-400 mt-1">Here's a summary of your AI workspace.</p>
        </div>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="All-Time Chats" value={loading ? "..." : stats.chats.toString()} icon={<Activity />} delay={0.1} />
        <StatCard title="Interviews Conducted" value={loading ? "..." : stats.interviews.toString()} icon={<CheckCircle2 />} delay={0.2} />
        <StatCard title="Resumes Generated" value={loading ? "..." : stats.resumes.toString()} icon={<Zap />} delay={0.3} />
        <StatCard title="Hours Spent" value={loading ? "..." : stats.hoursSpent.toString()} icon={<Clock />} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area - Replaced with Real Recent Activity */}
        <div className="lg:col-span-2">
          <FadeIn delay={0.5} className="h-full">
            <GlassPanel className="h-full min-h-[300px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="flex-1 flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
                {recentChats.length === 0 ? (
                  <p className="text-sm text-neutral-500">No recent activity found.</p>
                ) : (
                  recentChats.map((chat, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                      <span className="font-medium text-sm text-neutral-200">{chat.title}</span>
                      <span className="text-xs text-neutral-500">
                        {new Date(chat.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </GlassPanel>
          </FadeIn>
        </div>

        {/* Side Panel - Recent Chats & Tasks */}
        <div className="space-y-6">
          <FadeIn delay={0.6}>
            <GlassPanel tilt>
              <h3 className="text-lg font-semibold mb-4">Latest AI News</h3>
              <ul className="space-y-3">
                {newsArticles.length > 0 ? (
                  newsArticles.map((article: any, i: number) => (
                    <li key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors cursor-pointer text-sm">
                      <a href={article.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                        <span className="block text-purple-400 font-medium mb-1 line-clamp-1">{article.title}</span>
                        <span className="text-neutral-400 text-xs line-clamp-2">{article.description}</span>
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-neutral-400">Loading latest news...</li>
                )}
              </ul>
            </GlassPanel>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, delay }: { title: string, value: string, icon: React.ReactNode, delay: number }) {
  return (
    <FadeIn delay={delay}>
      <GlassPanel tilt className="p-5">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-neutral-400">{title}</p>
          <div className="text-neutral-500">{icon}</div>
        </div>
        <h4 className="text-3xl font-bold tracking-tight">{value}</h4>
      </GlassPanel>
    </FadeIn>
  )
}
