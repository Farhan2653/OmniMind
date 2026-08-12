"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"

export default function LoginPage() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleGoogleAuth = async () => {
    setLoading(true)
    setErrorMsg("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setErrorMsg(err.message || "Google Authentication failed")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black text-white p-4">
      {/* Background Aurora / Gradients */}
      <div className="absolute inset-0 z-[-1] bg-black" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      
      <GlassPanel className="w-full max-w-md border border-white/10" tilt={false}>
        <div className="flex flex-col space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-400">
              Sign in with Google to access your dashboard
            </p>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/20 p-2.5 rounded-lg">
              {errorMsg}
            </p>
          )}

          <Button onClick={handleGoogleAuth} variant="secondary" className="w-full py-6 flex items-center justify-center" disabled={loading}>
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? "Connecting..." : "Continue with Google"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-xs text-neutral-500">
              By continuing, you agree to OmniMind AI's terms of service and privacy policy.
            </p>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}
