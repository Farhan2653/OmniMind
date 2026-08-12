"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { 
  Home, MessageSquare, Briefcase, Code, BookOpen, 
  FileText, FolderKanban, BarChart3, Settings, LogOut, User
} from "lucide-react"

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Interview", href: "/dashboard/interview", icon: Briefcase },
  { name: "Coding", href: "/dashboard/coding", icon: Code },
  { name: "Research", href: "/dashboard/research", icon: BookOpen },
  { name: "Resume", href: "/dashboard/resume", icon: FileText },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#050505] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5 justify-between">
          <span className="text-xl font-bold tracking-tight">OmniMind</span>
          {!user && (
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
              Demo Account
            </span>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href)
                  router.refresh()
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-blue-400" : "text-neutral-500 group-hover:text-neutral-300"
                )} />
                {item.name}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-all group">
            <Settings className="w-5 h-5 text-neutral-500 group-hover:text-neutral-300" />
            Settings
          </Link>

          {user ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs text-neutral-400 truncate border-b border-white/5 mb-2 pb-3">
                {user.email}
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
              >
                <LogOut className="w-5 h-5 text-neutral-500 group-hover:text-red-400" />
                Log Out
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-all group"
            >
              <User className="w-5 h-5 text-neutral-500 group-hover:text-white" />
              Sign In (Save State)
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[url('/grid.svg')] bg-center bg-fixed no-scrollbar">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
