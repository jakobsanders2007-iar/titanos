'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { DEMO_TIMELINE, type TimelineEventType } from '@/lib/demo-intelligence'
import { formatDate } from '@/lib/utils'
import {
  Briefcase, DollarSign, Target, FileText, Plug, Tag, UserPlus, Star,
  LineChart, ShieldAlert, Brain, History,
} from 'lucide-react'

const TYPE_META: Record<TimelineEventType, { icon: React.ElementType; color: string }> = {
  job: { icon: Briefcase, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  payment: { icon: DollarSign, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  goal: { icon: Target, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  document: { icon: FileText, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  connector: { icon: Plug, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  pricing: { icon: Tag, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
  hire: { icon: UserPlus, color: 'text-teal-400 border-teal-500/30 bg-teal-500/10' },
  review: { icon: Star, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
  kpi: { icon: LineChart, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  risk: { icon: ShieldAlert, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  decision: { icon: Brain, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
}

const TYPES: (TimelineEventType | 'All')[] = ['All', 'job', 'payment', 'goal', 'document', 'connector', 'pricing', 'hire', 'review', 'kpi', 'risk', 'decision']

function groupByMonth(events: typeof DEMO_TIMELINE) {
  const groups: Record<string, typeof DEMO_TIMELINE> = {}
  for (const e of events) {
    const key = new Date(e.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  }
  return groups
}

export default function BusinessTimelinePage() {
  const [filter, setFilter] = useState<TimelineEventType | 'All'>('All')

  const sorted = [...DEMO_TIMELINE]
    .filter(e => filter === 'All' || e.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const grouped = groupByMonth(sorted)
  const positive = DEMO_TIMELINE.filter(e => e.impact === 'positive').length
  const negative = DEMO_TIMELINE.filter(e => e.impact === 'negative').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Business Timeline"
        subtitle={`${DEMO_TIMELINE.length} events tracked · ${positive} positive · ${negative} need attention`}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-gray-800 flex-shrink-0 flex-wrap">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors capitalize ${filter === t ? 'bg-gray-800 text-white border-gray-700' : 'text-gray-500 border-gray-800 hover:text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(grouped).map(([month, events]) => (
            <div key={month} className="mb-8 last:mb-0">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">{month}</div>
              <div className="relative pl-6 border-l border-gray-800 space-y-4">
                {events.map(e => {
                  const meta = TYPE_META[e.type]
                  const Icon = meta.icon
                  return (
                    <div key={e.id} className="relative">
                      <div className={`absolute -left-[29px] w-6 h-6 rounded-full border flex items-center justify-center ${meta.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="text-sm font-semibold text-white">{e.title}</div>
                          <div className="text-xs text-gray-600 flex-shrink-0">{formatDate(e.date)}</div>
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed">{e.detail}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-600">
              <History className="w-8 h-8 mb-2" />
              <div>No events match this filter</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
