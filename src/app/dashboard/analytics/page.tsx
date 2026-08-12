"use client"

import * as React from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { BarChart3, TrendingUp, Users, Activity, Target } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Analytics Hub</h1>
        <p className="text-xs text-neutral-400">Track model token usage, task cycle times, and deployment metrics.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Accuracy Rate</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-bold">98.4%</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Average Latency</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-bold">240ms</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Tokens Utilized</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold">84,102</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Active Swarms</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold">3 Swarms</span>
        </div>
      </div>

      <GlassPanel className="p-6 border border-white/5 min-h-[300px] flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold mb-2">Usage Metrics History</h3>
          <p className="text-xs text-neutral-400">Visual representation of daily API tokens utilized by agent swarms.</p>
        </div>
        
        {/* Mock Chart */}
        <div className="flex items-end gap-3 h-48 pt-6 border-b border-white/5">
          {[20, 45, 30, 80, 50, 65, 95, 40, 75, 85, 60, 90].map((val, idx) => (
            <div key={idx} className="flex-1 bg-white/5 rounded-t-sm relative group hover:bg-white/10 transition-colors">
              <div 
                className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm"
                style={{ height: `${val}%` }}
              />
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  )
}
