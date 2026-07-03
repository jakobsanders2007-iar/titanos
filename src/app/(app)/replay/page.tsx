'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { DEMO_REPLAYS, type OpsEventKind } from '@/lib/demo-ops'
import { formatCurrency } from '@/lib/utils'
import {
  Bot, Radio, CreditCard, ShieldCheck, Package, Sparkles, PhoneCall,
  AlertTriangle, CheckCircle2, Star, Play, ChevronLeft, ChevronRight, Film,
} from 'lucide-react'

const KIND_ICON: Record<OpsEventKind, { icon: React.ElementType; color: string }> = {
  ai_booking: { icon: Bot, color: 'text-amber-400' },
  dispatch: { icon: Radio, color: 'text-cyan-400' },
  payment: { icon: CreditCard, color: 'text-emerald-400' },
  cash: { icon: ShieldCheck, color: 'text-red-400' },
  inventory: { icon: Package, color: 'text-orange-400' },
  recommendation: { icon: Sparkles, color: 'text-purple-400' },
  call: { icon: PhoneCall, color: 'text-blue-400' },
  risk: { icon: AlertTriangle, color: 'text-red-400' },
  completion: { icon: CheckCircle2, color: 'text-emerald-400' },
  review: { icon: Star, color: 'text-yellow-400' },
}

export default function BusinessReplayPage() {
  const [dayIndex, setDayIndex] = useState(1) // default to yesterday — a full day
  const [step, setStep] = useState<number>(-1) // -1 = show all

  const replay = DEMO_REPLAYS[dayIndex]
  const visibleMoments = step === -1 ? replay.moments : replay.moments.slice(0, step + 1)

  const changeDay = (idx: number) => { setDayIndex(idx); setStep(-1) }

  const playStep = () => {
    setStep(prev => {
      if (prev === -1) return 0
      if (prev >= replay.moments.length - 1) return -1
      return prev + 1
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Business Replay"
        subtitle="Watch any business day unfold — calls, jobs, money, and the bottleneck that shaped it"
        actions={
          <div className="flex items-center gap-1">
            <button onClick={() => changeDay(Math.min(DEMO_REPLAYS.length - 1, dayIndex + 1))} disabled={dayIndex >= DEMO_REPLAYS.length - 1}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs text-gray-300 w-28 text-center">{replay.label}</span>
            <button onClick={() => changeDay(Math.max(0, dayIndex - 1))} disabled={dayIndex <= 0}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Headline */}
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Film className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-amber-400 uppercase tracking-wide mb-1">{replay.label} — The Story</div>
            <p className="text-sm text-gray-300 leading-relaxed">{replay.headline}</p>
          </div>
        </div>

        {/* Day stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Calls In', String(replay.stats.callsIn)],
            ['Jobs Booked', String(replay.stats.jobsBooked)],
            ['Calls Missed', String(replay.stats.callsMissed)],
            ['Collected', formatCurrency(replay.stats.collected)],
            ['Outstanding', formatCurrency(replay.stats.outstanding)],
            ['Cash Pending', formatCurrency(replay.stats.cashPending)],
            ['Avg Ticket', formatCurrency(replay.stats.avgTicket)],
            ['Est. Profit', formatCurrency(replay.stats.estProfit)],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{label}</div>
              <div className="text-lg font-semibold text-white tabular-nums">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Timeline replay */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">How the day unfolded</div>
              <button onClick={playStep}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
                <Play className="w-3 h-3" />
                {step === -1 ? 'Step through' : step >= replay.moments.length - 1 ? 'Show all' : `Next (${step + 1}/${replay.moments.length})`}
              </button>
            </div>
            <div className="p-4">
              <div className="relative pl-7 border-l border-gray-800 space-y-3">
                {visibleMoments.map((m, i) => {
                  const meta = KIND_ICON[m.kind]
                  const Icon = meta.icon
                  const isLatest = step !== -1 && i === visibleMoments.length - 1
                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[41px] w-6 h-6 rounded-full border flex items-center justify-center bg-gray-950 ${isLatest ? 'border-amber-500/60' : 'border-gray-800'}`}>
                        <Icon className={`w-3 h-3 ${meta.color}`} />
                      </div>
                      <div className={`flex items-center gap-3 rounded px-3 py-2 ${isLatest ? 'bg-amber-500/5 border border-amber-500/20' : ''}`}>
                        <span className="text-xs text-gray-500 tabular-nums w-16 flex-shrink-0">{m.time}</span>
                        <span className="text-sm text-gray-300">{m.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tech lines + bottleneck */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-800 text-sm font-semibold text-white">Technician lines</div>
              <div className="divide-y divide-gray-800">
                {replay.techLines.map(t => (
                  <div key={t.name} className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.jobs} jobs</div>
                    </div>
                    <div className="text-sm font-semibold text-white tabular-nums">{formatCurrency(t.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-red-400 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />Biggest bottleneck
              </div>
              <div className="text-sm text-gray-300 leading-relaxed">{replay.bottleneck}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
