'use client'

import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { DEMO_CHAT_EXCHANGES, CHAT_SUGGESTIONS } from '@/lib/demo-intelligence'
import { Sparkles, Send, User } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const FALLBACK = 'Titan is analyzing your connected systems to answer that. Live reasoning across all five brains is coming soon — for now, try one of the suggested questions below to see the kind of answer Titan will give across your entire business.'

function findResponse(prompt: string): string {
  const match = DEMO_CHAT_EXCHANGES.find(e => e.prompt.toLowerCase() === prompt.toLowerCase().trim())
  return match?.response ?? FALLBACK
}

export default function ExecutiveChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'intro', role: 'assistant', text: 'I\'m Titan — think of me as your CFO, COO, analyst, and consultant in one place. Ask me anything about what changed, why it changed, what to do next, or how your business compares to peers.' },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: `u-${nextId.current++}`, role: 'user', text }
    const responseText = findResponse(text)
    const assistantMsg: Message = { id: `a-${nextId.current++}`, role: 'assistant', text: responseText }
    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput('')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Executive Chat"
        subtitle="Ask Titan anything — it reasons across every brain and every connected system"
      />
      <div className="flex-1 overflow-hidden flex flex-col max-w-3xl w-full mx-auto">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'assistant' ? 'bg-amber-500/20' : 'bg-gray-800'}`}>
                {m.role === 'assistant' ? <Sparkles className="w-4 h-4 text-amber-400" /> : <User className="w-4 h-4 text-gray-400" />}
              </div>
              <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                m.role === 'assistant' ? 'bg-gray-900 border border-gray-800 text-gray-300' : 'bg-amber-500 text-gray-950 font-medium'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {messages.length <= 1 && (
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {CHAT_SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-800 flex-shrink-0">
          <form
            onSubmit={e => { e.preventDefault(); send(input) }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about revenue, margin, cash, goals, risk, or your team..."
              className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
            <button type="submit" className="p-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-lg transition-colors flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
