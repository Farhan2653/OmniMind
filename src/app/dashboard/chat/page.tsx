"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/Button"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Send, Bot, User, Trash2, Plus, MessageSquare } from "lucide-react"

interface Chat {
  id: string;
  title: string;
  updated_at: string;
}

interface Message {
  id?: string;
  sender: "user" | "ai";
  content: string;
}

export default function ChatPage() {
  const [user, setUser] = React.useState<any>(null)
  const [chats, setChats] = React.useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // 1. Get user session & load chats on mount
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadChats(session.user.id)
      }
    })
  }, [])

  const loadChats = async (userId: string) => {
    const { data, error } = await supabase
      .from("chats")
      .select("id, title, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
    
    if (data) setChats(data)
  }

  // 2. Load messages when active chat changes
  React.useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId)
    } else {
      // Default welcome message for new chat
      setMessages([{ sender: "ai", content: "Hello! I am OmniMind AI. How can I help you today?" }])
    }
  }, [activeChatId])

  const loadMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender, content, created_at")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
    
    if (data) setMessages(data)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // 3. Handle sending messages
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || !user) return

    const userMessageContent = input
    setInput("")
    setLoading(true)

    // Optimistic UI update
    setMessages((prev) => [...prev, { sender: "user", content: userMessageContent }])

    let currentChatId = activeChatId

    try {
      // If no active chat, create one first
      if (!currentChatId) {
        const title = userMessageContent.slice(0, 30) + (userMessageContent.length > 30 ? "..." : "")
        const { data: newChat, error: chatError } = await supabase
          .from("chats")
          .insert({ user_id: user.id, title })
          .select("id")
          .single()
        
        if (chatError) throw chatError
        currentChatId = newChat.id
        setActiveChatId(currentChatId)
        
        // Refresh chat list to show the new one
        loadChats(user.id)
      } else {
        // Update the updated_at timestamp of the chat
        await supabase
          .from("chats")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", currentChatId)
        loadChats(user.id)
      }

      // Save user message to DB
      const { error: messageError } = await supabase
        .from("messages")
        .insert({ chat_id: currentChatId, sender: "user", content: userMessageContent })
      if (messageError) {
        console.error("Message Error:", messageError)
        throw messageError
      }

      // Add 5 minutes (300 seconds) of time spent for this interaction
      const { error: rpcError } = await (supabase as any).rpc('increment_time_spent', { user_uuid: user.id, seconds_to_add: 300 })
      if (rpcError) {
        console.error("RPC Error:", rpcError)
        // don't throw, just log
      }

      // Call real AI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { sender: "user", content: userMessageContent }] }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        const errorMsg = typeof data.error === 'object' && data.error !== null 
          ? (data.error.message || JSON.stringify(data.error)) 
          : (data.error || "Failed to generate AI response");
        throw new Error(errorMsg)
      }
      
      const aiMessageContent = data.content
      
      // Save AI response to DB
      const { error: aiMessageError } = await supabase
        .from("messages")
        .insert({ chat_id: currentChatId, sender: "ai", content: aiMessageContent })
      if (aiMessageError) {
        console.error("AI Message Error:", aiMessageError)
        throw aiMessageError
      }
      
      setMessages((prev) => [...prev, { sender: "ai", content: aiMessageContent }])
      setLoading(false)

    } catch (error: any) {
      console.error("Error saving message:", error)
      // Show error in chat
      setMessages((prev) => [...prev, { sender: "ai", content: `Error: ${error.message || "Something went wrong"}` }])
      setLoading(false)
    }
  }

  const startNewChat = () => {
    setActiveChatId(null)
  }

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    
    if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return
    }
    
    await supabase.from("chats").delete().eq("id", chatId)
    
    if (activeChatId === chatId) {
      setActiveChatId(null)
    }
    loadChats(user.id)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] p-4 max-w-7xl mx-auto gap-4">
      {/* Left Sidebar - Chat History */}
      <GlassPanel className="w-72 flex flex-col h-full border border-white/5 bg-neutral-950/40 p-4 hidden md:flex">
        <Button onClick={startNewChat} variant="secondary" className="w-full flex items-center justify-center mb-6">
          <Plus className="w-4 h-4 mr-2" /> New Chat
        </Button>

        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
          {chats.length === 0 && (
            <p className="text-xs text-neutral-500 text-center mt-4">No previous chats found.</p>
          )}
          {chats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                activeChatId === chat.id 
                  ? "bg-white/10 border-white/20 text-white" 
                  : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                <span className="text-sm truncate">{chat.title}</span>
              </div>
              <button 
                onClick={(e) => deleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
                aria-label="Delete chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {activeChatId ? chats.find(c => c.id === activeChatId)?.title || "AI Chat Assistant" : "New Chat"}
            </h1>
            <p className="text-xs text-neutral-400">Ask anything, generate code, or explore ideas.</p>
          </div>
          {/* Mobile history toggle could go here */}
        </div>

        {/* Messages Window */}
        <GlassPanel className="flex-1 overflow-y-auto mb-4 p-4 md:p-6 space-y-6 flex flex-col no-scrollbar border border-white/5 bg-neutral-950/20">
          <div className="flex-1 space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className={`p-4 rounded-xl border ${
                  msg.sender === "user" 
                    ? "bg-blue-600/10 border-blue-500/20 text-white" 
                    : "bg-white/5 border-white/10 text-neutral-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2 text-xs font-medium text-neutral-400">
                    {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-blue-400" />}
                    <span>{msg.sender === "user" ? "You" : "OmniMind AI"}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3 mr-auto max-w-[85%]">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-neutral-200">
                  <div className="flex items-center gap-2 mb-2 text-xs font-medium text-neutral-400">
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                    <span>OmniMind AI</span>
                  </div>
                  <div className="flex gap-1.5 py-1">
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
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Send a message to OmniMind... (Press Enter to send, Shift+Enter for new line)"
            rows={1}
            style={{ minHeight: '52px', maxHeight: '150px' }}
            className="flex-1 pl-5 pr-24 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all text-sm shadow-xl resize-none no-scrollbar leading-relaxed"
            disabled={!user}
          />
          <Button type="submit" variant="primary" className="absolute right-2 top-2 bottom-2 rounded-xl px-6" disabled={!user || loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
        {!user && (
          <p className="text-xs text-red-400 mt-2 text-center">You must be logged in to send messages.</p>
        )}
      </div>
    </div>
  )
}
