"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Send, Bot, User, Trash2 } from "lucide-react"

interface Message {
  id?: string;
  sender: "user" | "ai";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    { sender: "ai", content: "Hello! I am OmniMind AI. How can I help you today?" }
  ])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = { sender: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Simple mock AI response timer for chat flow
      setTimeout(() => {
        const aiMessage: Message = {
          sender: "ai",
          content: `I've analyzed your query about: "${userMessage.content}". Here is how we can address this...`
        }
        setMessages((prev) => [...prev, aiMessage])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([{ sender: "ai", content: "Chat cleared. What can I assist with next?" }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Chat Assistant</h1>
          <p className="text-xs text-neutral-400">Ask anything, generate code, or explore ideas.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-red-400 hover:text-red-300 hover:bg-red-950/20">
          <Trash2 className="w-4 h-4 mr-2" /> Clear Chat
        </Button>
      </div>

      {/* Messages Window */}
      <GlassPanel className="flex-1 overflow-y-auto mb-4 p-4 space-y-4 flex flex-col no-scrollbar border border-white/5 bg-neutral-950/20">
        <div className="flex-1 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 max-w-[80%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${
                msg.sender === "user" 
                  ? "bg-blue-600/10 border-blue-500/20 text-white" 
                  : "bg-white/5 border-white/10 text-neutral-200"
              }`}>
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-neutral-400">
                  {msg.sender === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  <span>{msg.sender === "user" ? "You" : "OmniMind AI"}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3 mr-auto max-w-[80%]">
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg text-neutral-200">
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-neutral-400">
                  <Bot className="w-3 h-3" />
                  <span>OmniMind AI</span>
                </div>
                <div className="flex gap-1 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </GlassPanel>

      {/* Input Row */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-sm"
        />
        <Button type="submit" variant="primary" className="rounded-xl px-5">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
