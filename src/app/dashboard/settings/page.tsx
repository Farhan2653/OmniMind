"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Settings, Shield, User, Sliders, Bell, Database, Trash2, Key } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Tab = "models" | "profile" | "data"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>("models")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Settings State
  const [model, setModel] = React.useState("gpt-4o")
  const [apiKey, setApiKey] = React.useState("")
  const [temperature, setTemperature] = React.useState(0.7)
  const [displayName, setDisplayName] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [bio, setBio] = React.useState("")

  React.useEffect(() => {
    async function fetchSettings() {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user) return

      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', session.session.user.id)
        .single()

      if (data) {
        setModel(data.model || "gpt-4o")
        setApiKey(data.api_key || "")
        setTemperature(data.temperature || 0.7)
        setDisplayName(data.display_name || "")
        setTitle(data.title || "")
        setBio(data.bio || "")
      }
      setLoading(false)
    }

    fetchSettings()
  }, [])

  const handleSaveModels = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: session } = await supabase.auth.getSession()
    if (session.session?.user) {
      await supabase.from('user_settings').upsert({
        id: session.session.user.id,
        model,
        api_key: apiKey,
        temperature
      })
      alert("Model settings saved!")
    }
    setSaving(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: session } = await supabase.auth.getSession()
    if (session.session?.user) {
      await supabase.from('user_settings').upsert({
        id: session.session.user.id,
        display_name: displayName,
        title,
        bio
      })
      alert("Profile settings saved!")
    }
    setSaving(false)
  }

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

  if (loading) {
    return <div className="p-6 text-white">Loading settings...</div>
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-xs text-neutral-400">Configure global parameters, LLM preferences, and your account profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-2 col-span-1">
          <button 
            onClick={() => setActiveTab("models")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "models" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Sliders className={`w-4 h-4 ${activeTab === "models" ? "text-purple-400" : "text-neutral-500"}`} /> AI Models
          </button>
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "profile" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === "profile" ? "text-purple-400" : "text-neutral-500"}`} /> Account Profile
          </button>
          <button 
            onClick={() => setActiveTab("data")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "data" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Database className={`w-4 h-4 ${activeTab === "data" ? "text-purple-400" : "text-neutral-500"}`} /> Data Management
          </button>
        </div>

        {/* Content Card */}
        <div className="md:col-span-3">
          
          {activeTab === "models" && (
            <GlassPanel className="p-6 border border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-white">
                <Sliders className="w-4 h-4 text-purple-400" /> AI Model Preferences
              </h3>
              
              <p className="text-xs text-neutral-400">
                Choose the default AI engine for workspace tools and provide your own API key if you want to bypass system limits.
              </p>

              <form onSubmit={handleSaveModels} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400">Primary Language Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  >
                    <option value="gpt-4o">GPT-4o (Default)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="llama-3">Llama 3</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400 flex justify-between">
                    <span>Bring Your Own Key (Optional)</span>
                    <Key className="w-3.5 h-3.5 text-neutral-500" />
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-xs"
                  />
                  <p className="text-[10px] text-neutral-500 pt-1">Stored securely in your database row. Overrides the system API key.</p>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex justify-between items-center text-xs font-medium text-neutral-400">
                    <span>System Temperature (Creativity)</span>
                    <span>{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full rounded-xl text-xs py-2 mt-4" disabled={saving}>
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </form>
            </GlassPanel>
          )}

          {activeTab === "profile" && (
            <GlassPanel className="p-6 border border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-white">
                <User className="w-4 h-4 text-purple-400" /> Account Profile
              </h3>
              
              <p className="text-xs text-neutral-400">
                Personalize your workspace. These details help the Interview and Resume agents give you tailored feedback.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400">Display Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400">Current or Target Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400">Short Bio / Goals</label>
                  <textarea
                    placeholder="Briefly describe your career goals..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-xs resize-none"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full rounded-xl text-xs py-2 mt-4" disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </GlassPanel>
          )}

          {activeTab === "data" && (
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
          )}

        </div>
      </div>
    </div>
  )
}
