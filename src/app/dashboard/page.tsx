"use client"

import { FadeIn } from "@/components/animations/FadeIn"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Activity, Clock, CheckCircle2, Zap } from "lucide-react"

export default function DashboardHome() {
  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good evening, Alex.</h1>
          <p className="text-neutral-400 mt-1">Here's a summary of your AI workspace.</p>
        </div>
        <div className="flex gap-2">
          {/* Top right actions could go here */}
        </div>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Projects" value="4" icon={<Activity />} delay={0.1} />
        <StatCard title="Focus Hours" value="12.5h" icon={<Clock />} delay={0.2} />
        <StatCard title="Tasks Completed" value="28" icon={<CheckCircle2 />} delay={0.3} />
        <StatCard title="AI Interactions" value="1,204" icon={<Zap />} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2">
          <FadeIn delay={0.5} className="h-full">
            <GlassPanel className="h-full min-h-[300px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
              {/* Mock Graph using pure CSS/divs to represent a bar chart for premium feel */}
              <div className="flex-1 flex items-end gap-2 mt-4 pt-4 border-t border-white/5">
                {[40, 70, 45, 90, 65, 85, 100, 50, 75, 60].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-sm hover:bg-blue-500/50 transition-colors relative group">
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-500 group-hover:from-blue-400 group-hover:to-blue-300" 
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </GlassPanel>
          </FadeIn>
        </div>

        {/* Side Panel - Recent Chats & Tasks */}
        <div className="space-y-6">
          <FadeIn delay={0.6}>
            <GlassPanel tilt>
              <h3 className="text-lg font-semibold mb-4">AI Suggestions</h3>
              <ul className="space-y-3">
                <li className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors cursor-pointer text-sm">
                  <span className="block text-purple-400 font-medium mb-1">Coding Mentor</span>
                  Refactor the user authentication flow for better performance.
                </li>
                <li className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors cursor-pointer text-sm">
                  <span className="block text-blue-400 font-medium mb-1">Interview Prep</span>
                  Schedule a mock system design interview.
                </li>
              </ul>
            </GlassPanel>
          </FadeIn>

          <FadeIn delay={0.7}>
            <GlassPanel tilt>
              <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
              <ul className="space-y-2">
                {["Review React Compiler docs", "Update resume with new skills", "Weekly sync"].map((task, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-neutral-300">
                    <div className="w-4 h-4 rounded-full border border-neutral-600" />
                    {task}
                  </li>
                ))}
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
