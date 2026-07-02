'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { DEMO_MEMORY, type MemoryCategory } from '@/lib/demo-intelligence'
import { formatDate } from '@/lib/utils'
import { Search, Brain, FileText, Target, LineChart, User, ShieldAlert } from 'lucide-react'

const CATEGORY_META: Record<MemoryCategory, { icon: React.ElementType; color: string }> = {
  'Decision': { icon: Brain, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  'Document': { icon: FileText, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  'Goal': { icon: Target, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  'KPI Snapshot': { icon: LineChart, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  'People': { icon: User, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  'Risk': { icon: ShieldAlert, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
}

const CATEGORIES: (MemoryCategory | 'All')[] = ['All', 'Decision', 'Document', 'Goal', 'KPI Snapshot', 'People', 'Risk']

export default function CompanyMemoryPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MemoryCategory | 'All'>('All')

  const filtered = DEMO_MEMORY
    .filter(m => category === 'All' || m.category === category)
    .filter(m => {
      if (!search) return true
      const q = search.toLowerCase()
      return m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q) || m.tags.some(t => t.includes(q))
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Company Memory"
        subtitle="The Memory Brain — every goal, decision, document, and KPI moment Titan remembers"
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-800 flex-shrink-0 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search company memory..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${category === c ? 'bg-gray-800 text-white border-gray-700' : 'text-gray-500 border-gray-800 hover:text-gray-300'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {filtered.map(item => {
              const meta = CATEGORY_META[item.category]
              const Icon = meta.icon
              return (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <div className="text-xs text-gray-600 flex-shrink-0">{formatDate(item.date)}</div>
                    </div>
                    <div className="text-sm text-gray-400 leading-relaxed mb-2">{item.summary}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${meta.color}`}>{item.category}</span>
                      <span className="text-xs text-gray-600">{item.source}</span>
                      {item.tags.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                <Brain className="w-8 h-8 mb-2" />
                <div>Nothing in memory matches your search</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
