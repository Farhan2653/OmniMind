import Link from "next/link"
import { Background } from "@/components/landing/Background"
import { FadeIn } from "@/components/animations/FadeIn"
import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { Bot, Code2, Search, FileText, BrainCircuit, Mic } from "lucide-react"

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Background />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b-0 border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-bold tracking-tighter">OmniMind AI</div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">Get Started (Demo)</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center min-h-screen justify-center">
        <FadeIn delay={0.2}>
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium glass text-white/80 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
            Introducing OmniMind OS
          </div>
        </FadeIn>
        
        <FadeIn delay={0.3}>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Your AI Operating System
          </h1>
        </FadeIn>
        
        <FadeIn delay={0.4}>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
            A premium suite of AI tools designed to accelerate your workflow. Interview practice, coding mentorship, research, and more in one beautiful platform.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.5}>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="rounded-full px-8 shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                Start Demo Account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="glass" size="lg" className="rounded-full px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need</h2>
            <p className="text-neutral-400">Powered by advanced AI models and a beautifully crafted interface.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Bot className="w-8 h-8 text-blue-400" />}
            title="AI Interview"
            description="Mock interviews with real-time feedback and behavioral analysis."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Code2 className="w-8 h-8 text-purple-400" />}
            title="AI Coding Mentor"
            description="Pair program with an AI that understands your entire codebase."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Search className="w-8 h-8 text-pink-400" />}
            title="AI Research Assistant"
            description="Synthesize millions of papers and articles in seconds."
            delay={0.3}
          />
          <FeatureCard 
            icon={<FileText className="w-8 h-8 text-emerald-400" />}
            title="AI Resume Analyzer"
            description="Optimize your resume for ATS and specific job descriptions."
            delay={0.4}
          />
          <FeatureCard 
            icon={<BrainCircuit className="w-8 h-8 text-amber-400" />}
            title="AI Roadmap Generator"
            description="Personalized learning paths for any skill or career."
            delay={0.5}
          />
          <FeatureCard 
            icon={<Mic className="w-8 h-8 text-cyan-400" />}
            title="AI Voice Assistant"
            description="Interact with OmniMind using natural voice commands."
            delay={0.6}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-neutral-500">
          <p>&copy; 2026 OmniMind AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <ScrollReveal delay={delay}>
      <GlassPanel tilt className="h-full flex flex-col items-start gap-4 cursor-pointer hover:border-white/20 transition-colors">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-neutral-400 text-sm leading-relaxed">
          {description}
        </p>
      </GlassPanel>
    </ScrollReveal>
  )
}
