'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Info, Bot } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AICoachWidgetProps {
  childId: string
  childName: string
  initialCredits: number
}

export default function AICoachWidget({ childId, childName, initialCredits }: AICoachWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState(initialCredits)
  const [conversationId, setConversationId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { error: showError } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || credits < 1) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: childId,
          message: userMsg,
          conversation_id: conversationId
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to get AI response')
      
      if (!conversationId) setConversationId(data.conversation_id)
      setCredits(data.credits_remaining)
      setMessages(prev => [...prev, data.message])
      
    } catch (err: any) {
      showError(err.message)
      // Remove the optimistic user message on failure
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-stone-900 hover:bg-stone-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 group border border-stone-700"
      >
        <div className="relative">
          <Bot size={28} className="text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-stone-900 animate-pulse"></div>
        </div>
        <span className="font-display font-bold hidden md:inline pr-2 text-stone-100">AI Coach</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-md h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
      
      {/* Header */}
      <div className="bg-stone-900 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center border border-stone-700">
            <Bot size={24} className="text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white leading-tight">HoneyBee AI</h3>
            <p className="text-xs text-stone-400">Coach for {childName}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-800 text-stone-400 hover:text-white transition-colors"
        >
          ?
        </button>
      </div>

      {/* Credit & Disclaimer Bar */}
      <div className="bg-stone-50 border-b border-stone-100 p-3 shrink-0 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-stone-600">
          <Sparkles size={14} className="text-amber-500" />
          <span className="font-bold">{credits} Credits remaining</span>
        </div>
        <div className="flex items-center gap-1 group relative cursor-help text-stone-400">
          <Info size={14} />
          <span>Disclaimer</span>
          <div className="absolute top-full right-0 mt-2 w-64 bg-stone-900 text-stone-300 p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
            The AI Coach provides general guidance based on child development frameworks. It does not provide medical advice.
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Bot size={32} className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-stone-800 mb-1">Hi, I'm your AI Parenting Coach!</p>
              <p className="text-sm text-stone-500">Ask me anything about {childName}'s development, learning activities, or behaviors.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <button onClick={() => setInput('What activities are good for fine motor skills?')} className="text-xs bg-white border border-stone-200 px-3 py-1.5 rounded-full text-stone-600 hover:border-amber-300 hover:text-amber-700 transition-colors">Fine Motor Skills</button>
              <button onClick={() => setInput('How can I help with tantrums?')} className="text-xs bg-white border border-stone-200 px-3 py-1.5 rounded-full text-stone-600 hover:border-amber-300 hover:text-amber-700 transition-colors">Tantrums</button>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-[var(--color-fun-purple)] text-white rounded-tr-sm shadow-sm' 
                : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center h-10 shadow-sm">
              <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-stone-100 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={credits > 0 ? "Ask a question..." : "No credits remaining"}
            disabled={loading || credits < 1}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-[var(--color-fun-purple)] focus:bg-white transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || credits < 1}
            className="absolute right-1.5 w-10 h-10 bg-[var(--color-fun-purple)] hover:bg-purple-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send size={16} className="ml-1" />
          </button>
        </form>
      </div>

    </div>
  )
}
