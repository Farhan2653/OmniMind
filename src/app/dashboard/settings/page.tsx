"use client"

import * as React from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Database, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage() {
  const clearData = async (table: string) => {
    if (!confirm(`Are you sure you want to clear all your ${table} data? This cannot be undone.`)) return
    
    const { data: session } = await supabase.auth.getSession()
    if (session.session?.user) {
      const { error } = await supabase.from(table).delete().eq('user_id', session.session.user.id)
      if (!error) {
        alert(`${table} data cleared successfully.`)
      } else {
        alert(`Failed to clear ${table} data.`)
      }
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-xs text-neutral-400">Manage your workspace data.</p>
      </div>

      <GlassPanel className="p-6 border border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-white">
          <Database className="w-4 h-4 text-purple-400" /> Data Management
        </h3>
        
        <p className="text-xs text-neutral-400">
          Manage your stored workspace history. Clearing data cannot be undone.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
            <div>
              <h4 className="text-xs font-semibold text-white">Clear Chat History</h4>
              <p className="text-[10px] text-neutral-400">Delete all your conversational data.</p>
            </div>
            <button onClick={() => clearData('chats')} className="p-2 hover:bg-red-500/20 text-red-400 rounded-md transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
            <div>
              <h4 className="text-xs font-semibold text-white">Clear Interview Records</h4>
              <p className="text-[10px] text-neutral-400">Delete your mock interview transcripts and scores.</p>
            </div>
            <button onClick={() => clearData('interviews')} className="p-2 hover:bg-red-500/20 text-red-400 rounded-md transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
            <div>
              <h4 className="text-xs font-semibold text-white">Clear Resume Data</h4>
              <p className="text-[10px] text-neutral-400">Delete all uploaded resumes and their ATS analysis.</p>
            </div>
            <button onClick={() => clearData('resumes')} className="p-2 hover:bg-red-500/20 text-red-400 rounded-md transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
