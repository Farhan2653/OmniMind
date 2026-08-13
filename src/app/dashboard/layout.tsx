"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { 
  Home, MessageSquare, Briefcase, Code, BookOpen, 
  FileText, FolderKanban, BarChart3, Settings, LogOut, User, Menu, X
} from "lucide-react"

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Interview", href: "/dashboard/interview", icon: Briefcase },
  { name: "Coding", href: "/dashboard/coding", icon: Code },
  { name: "Research", href: "/dashboard/research", icon: BookOpen },
  { name: "Resume", href: "/dashboard/resume", icon: FileText },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = React.useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

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

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#000000] relative">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4">
        <span className="text-xl font-bold tracking-tight text-white">OmniMind</span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 rounded-lg bg-white/5"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 border-r border-white/5 bg-[#050505] flex flex-col fixed md:relative h-[100dvh] z-50 transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-white/5 justify-between">
          <span className="text-xl font-bold tracking-tight hidden md:block">OmniMind</span>
          <span className="text-xl font-bold tracking-tight md:hidden">Menu</span>
          {!user && (
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
              Demo Account
            </span>
          )}
          <button 
            className="md:hidden text-neutral-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
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

        <div className="p-4 border-t border-white/5 space-y-1 pb-safe">
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
      <main className="flex-1 h-[100dvh] overflow-y-auto bg-[url('/grid.svg')] bg-center bg-fixed no-scrollbar relative pt-16 md:pt-0">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
