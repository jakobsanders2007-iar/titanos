'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { DEMO_OPS_FEED, type OpsEventKind } from '@/lib/demo-ops'
import { formatCurrency, formatTime } from '@/lib/utils'
import {
  Bot, Radio, CreditCard, ShieldCheck, Package, Sparkles, PhoneCall,
  AlertTriangle, CheckCircle2, Star, ArrowRight, Activity,
} from 'lucide-react'

const KIND_META: Record<OpsEventKind, { icon: React.ElementType; color: string; ring: string }> = {
  ai_booking: { icon: Bot, color: 'text-amber-400', ring: 'border-amber-500/40 bg-amber-500/10' },
  dispatch: { icon: Radio, color: 'text-cyan-400', ring: 'border-cyan-500/40 bg-cyan-500/10' },
  payment: { icon: CreditCard, color: 'text-emerald-400', ring: 'border-emerald-500/40 bg-emerald-500/10' },
  cash: { icon: ShieldCheck, color: 'text-red-400', ring: 'border-red-500/40 bg-red-500/10' },
  inventory: { icon: Package, color: 'text-orange-400', ring: 'border-orange-500/40 bg-orange-500/10' },
  recommendation: { icon: Sparkles, color: 'text-purple-400', ring: 'border-purple-500/40 bg-purple-500/10' },
  call: { icon: PhoneCall, color: 'text-blue-400', ring: 'border-blue-500/40 bg-blue-500/10' },
  risk: { icon: AlertTriangle, color: 'text-red-400', ring: 'border-red-500/40 bg-red-500/10' },
  completion: { icon: CheckCircle2, color: 'text-emerald-400', ring: 'border-emerald-500/40 bg-emerald-500/10' },
  review: { icon: Star, color: 'text-yellow-400', ring: 'border-yellow-500/40 bg-yellow-500/10' },
}

const FILTERS = ['All', 'Needs Action', 'Money', 'Dispatch', 'AI'] as const

export default function LiveOpsPage() {
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All')
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const events = [...DEMO_OPS_FEED]
    .filter(e => {
      if (filter === 'Needs Action') return e.needsAction
      if (filter === 'Money') return ['payment', 'cash', 'completion'].includes(e.kind)
      if (filter === 'Dispatch') return ['dispatch', 'completion'].includes(e.kind)
      if (filter === 'AI') return ['ai_booking', 'recommendation', 'call'].includes(e.kind)
      return true
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const needsAction = DEMO_OPS_FEED.filter(e => e.needsAction).length
  const collectedToday = DEMO_OPS_FEED.filter(e => ['payment', 'completion'].includes(e.kind)).reduce((s, e) => s + (e.amount ?? 0), 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Live Ops Feed"
        subtitle="The nervous system — every booking, dispatch, dollar, and decision as it happens"
        actions={
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE · {clock}
          </div>
        }
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 flex-shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${filter === f ? 'bg-gray-800 text-white border-gray-700' : 'text-gray-500 border-gray-800 hover:text-gray-300'}`}>
                {f}{f === 'Needs Action' && needsAction > 0 && <span className="ml-1 text-amber-400">{needsAction}</span>}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-emerald-400 font-semibold tabular-nums">{formatCurrency(collectedToday)}</span> moved through the feed today
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl relative pl-8 border-l border-gray-800 space-y-3">
            {events.map(e => {
              const meta = KIND_META[e.kind]
              const Icon = meta.icon
              return (
                <div key={e.id} className="relative">
                  <div className={`absolute -left-[45px] w-7 h-7 rounded-full border flex items-center justify-center ${meta.ring}`}>
                    <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  </div>
                  <Link href={e.href ?? '#'} className={`block bg-gray-900 border rounded-lg p-3 hover:border-gray-700 transition-colors ${e.needsAction ? 'border-amber-500/30' : 'border-gray-800'}`}>
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-500 tabular-nums flex-shrink-0">{formatTime(e.at)}</span>
                        <span className="text-sm font-semibold text-white truncate">{e.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {e.amount ? <span className="text-sm font-semibold text-white tabular-nums">{formatCurrency(e.amount)}</span> : null}
                        {e.needsAction && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">Action</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed">{e.detail}</div>
                    <div className="text-[10px] text-gray-600 mt-1 flex items-center gap-1">{e.actor}<ArrowRight className="w-2.5 h-2.5" /></div>
                  </Link>
                </div>
              )
            })}
            {events.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                <Activity className="w-8 h-8 mb-2" />
                <div>No events in this view</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
