"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Play, Pause, Plus, Trash2, Cpu, Settings, Activity } from "lucide-react"

interface Agent {
  id: string;
  name: string;
  role: string;
  status: "idle" | "working" | "paused";
  tasksCount: number;
}

export default function ProjectsPage() {
  const [agents, setAgents] = React.useState<Agent[]>([
    { id: "1", name: "Alpha", role: "Code Optimizer", status: "working", tasksCount: 12 },
    { id: "2", name: "Beta", role: "Docs Generator", status: "idle", tasksCount: 4 },
    { id: "3", name: "Gamma", role: "Security Auditor", status: "paused", tasksCount: 0 }
  ])

  const [newName, setNewName] = React.useState("")
  const [newRole, setNewRole] = React.useState("Code Optimizer")

  const addAgent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newAgent: Agent = {
      id: Date.now().toString(),
      name: newName,
      role: newRole,
      status: "idle",
      tasksCount: 0
    }

    setAgents((prev) => [...prev, newAgent])
    setNewName("")
  }

  const toggleStatus = (id: string) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === id) {
          const nextStatus = 
            agent.status === "working" ? "paused" :
            agent.status === "paused" ? "idle" : "working"
          return { ...agent, status: nextStatus }
        }
        return agent
      })
    )
  }

  const deleteAgent = (id: string) => {
    setAgents((prev) => prev.filter((agent) => agent.id !== id))
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Agent Workspace</h1>
          <p className="text-xs text-neutral-400">Deploy, configure, and monitor autonomous agents running in parallel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Creator Panel */}
        <div className="md:col-span-1">
          <GlassPanel className="space-y-4">
            <h3 className="text-sm font-semibold">Deploy New Agent</h3>
            <form onSubmit={addAgent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sentinel-1"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400">Specialized Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-xs"
                >
                  <option value="Code Optimizer">Code Optimizer</option>
                  <option value="Docs Generator">Docs Generator</option>
                  <option value="Security Auditor">Security Auditor</option>
                  <option value="Analytics Researcher">Analytics Researcher</option>
                </select>
              </div>

              <Button type="submit" variant="primary" className="w-full rounded-xl text-xs py-2">
                <Plus className="w-4 h-4 mr-1.5" /> Deploy Agent
              </Button>
            </form>
          </GlassPanel>
        </div>

        {/* Workspace Active List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-300">Active Agent Swarm</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <GlassPanel key={agent.id} className="space-y-4 border border-white/5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/5 border border-white/10 text-neutral-400 rounded-lg">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{agent.name}</h4>
                      <p className="text-[10px] text-neutral-400">{agent.role}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                    agent.status === "working" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    agent.status === "paused" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-neutral-500" />
                    {agent.tasksCount} Tasks
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => toggleStatus(agent.id)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 text-white transition-colors"
                    >
                      {agent.status === "working" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md border border-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
