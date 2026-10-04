/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { Send, Bot, User, AlertCircle, Loader2, Zap } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface CoachClientProps {
  childrenList: Array<{ id: string; name: string }>
  initialCredits: number
}

export default function CoachClient({ childrenList, initialCredits }: CoachClientProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [credits, setCredits] = useState<number>(initialCredits)
  
  // We need a stable conversation ID for this session to group logs
  const [conversationId] = useState<string>(() => crypto.randomUUID ? crypto.randomUUID() : '123e4567-e89b-12d3-a456-426614174000')
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    streamProtocol: 'text',
    body: {
      childId: selectedChildId || undefined,
      conversationId: conversationId
    },
    onResponse: (response) => {
      // If we got a successful response stream started, a credit was used.
      if (response.ok) {
        setCredits(c => Math.max(0, c - 1))
      }
    },
    onError: (e) => {
      console.error(e)
    }
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Custom error parsing
  const isInsufficientCredits = error?.message?.includes('402') || error?.message?.includes('Insufficient AI Credits');

  return (
    <div className="flex flex-col h-full relative bg-stone-50/30">
      
      {/* Header with dynamic credits */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 pt-4 pb-2">
        <div>
          <h1 className="text-3xl font-display font-black text-stone-900 mb-2">
            Your AI Coach
          </h1>
          <p className="text-stone-500 text-sm sm:text-base">
            Ask questions about your child&apos;s development, get activity ideas, or seek parenting advice.
          </p>
        </div>
        
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-200 flex flex-col gap-2 min-w-[160px] transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between text-stone-800 font-bold text-sm">
            <span className="flex items-center gap-1.5">
               <Zap size={16} className="fill-amber-500 text-amber-500 animate-pulse" /> 
               Credits
            </span>
            <span className={credits < 5 ? "text-red-500" : "text-amber-600"}>{credits}</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
             <div 
               className={`h-full rounded-full transition-all duration-700 ease-out ${credits < 5 ? 'bg-red-500' : 'bg-amber-500'}`} 
               style={{ width: `${Math.min(100, (credits / 50) * 100)}%` }} 
             />
          </div>
          <span className="text-[10px] text-stone-400 font-medium tracking-wide uppercase text-right">
            {credits < 5 ? 'Low Balance' : 'Available'}
          </span>
        </div>
      </div>

      {/* Header Context Selector */}
      {childrenList.length > 0 && (
        <div className="p-4 border-b border-t border-stone-100 bg-white flex items-center justify-between z-10">
          <span className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
            Focus Context:
          </span>
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-400 outline-none w-48 font-medium"
          >
            <option value="">All Children</option>
            {childrenList.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 flex items-center gap-2 border-b border-red-100 text-sm font-medium">
          <AlertCircle size={16} />
          {isInsufficientCredits 
            ? 'You have run out of AI Credits. Please purchase a new developmental kit to earn more credits!'
            : (error.message || 'An error occurred while connecting to the AI Coach.')}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200">
              <Bot size={40} />
            </div>
            <h2 className="text-2xl font-display font-bold text-stone-900 mb-3">Hi, I'm HoneyBee Coach!</h2>
            <p className="text-stone-500 text-lg leading-relaxed mb-8">
              I can help you interpret your child's learning progress, suggest offline activities, or answer any parenting questions.
              <br/><br/>
              <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1 w-fit mx-auto">
                <Zap size={14} className="fill-amber-500" /> Costs 1 AI Credit per message
              </span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['What games build motor skills?', 'How to handle tantrums?', 'Explain cognitive development'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleInputChange({ target: { value: suggestion } } as any)}
                  className="bg-white border border-stone-200 text-stone-600 px-4 py-2 rounded-full text-sm hover:border-amber-400 hover:text-amber-600 transition-colors shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shrink-0 shadow-sm border border-amber-200">
                  <Bot size={20} />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                m.role === 'user' 
                  ? 'bg-amber-500 text-white rounded-tr-sm' 
                  : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm'
              }`}>
                <div className="prose prose-sm prose-stone max-w-none leading-relaxed">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 shrink-0 border border-stone-200">
                  <User size={20} />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex gap-4 justify-start">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shrink-0">
              <Bot size={20} />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm p-4 flex items-center shadow-sm">
              <Loader2 className="animate-spin text-amber-500" size={20} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-100">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask your AI Coach anything... (Costs 1 credit)"
            className="flex-1 bg-stone-50 border border-stone-200 text-stone-900 rounded-full px-6 py-4 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none font-medium shadow-inner"
            disabled={isLoading || isInsufficientCredits || credits === 0}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isInsufficientCredits || credits === 0}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all shadow-md shrink-0"
          >
            <Send size={20} className={input.trim() ? "translate-x-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  )
}
