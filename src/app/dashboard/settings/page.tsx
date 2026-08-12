"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Settings, Shield, User, Sliders, Bell } from "lucide-react"

export default function SettingsPage() {
  const [model, setModel] = React.useState("gpt-4")
  const [temperature, setTemperature] = React.useState(0.7)
  const [notifications, setNotifications] = React.useState(true)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Settings saved successfully!")
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-xs text-neutral-400">Configure global parameters, LLM preferences, and profile tokens.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 text-white">
            <Sliders className="w-4 h-4 text-purple-400" /> Model Preferences
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:bg-white/5 hover:text-white transition-colors">
            <User className="w-4 h-4 text-neutral-500" /> Account Profile
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:bg-white/5 hover:text-white transition-colors">
            <Shield className="w-4 h-4 text-neutral-500" /> Security & API Keys
          </button>
        </div>

        {/* Content Card */}
        <div className="md:col-span-2">
          <GlassPanel className="p-6 border border-white/5 space-y-6">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4 text-neutral-400" /> Configuration Parameters
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">Primary Language Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                >
                  <option value="gpt-4">GPT-4 (Default)</option>
                  <option value="claude-3">Claude 3.5 Sonnet</option>
                  <option value="gemini-1.5">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-medium text-neutral-400">
                  <span>Temperature</span>
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
              </div>

              <div className="flex justify-between items-center py-2 border-t border-b border-white/5">
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-neutral-500" /> System Notifications
                </span>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full rounded-xl text-xs py-2">
                Save Preferences
              </Button>
            </form>
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
