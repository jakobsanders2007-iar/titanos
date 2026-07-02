'use client'

import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatusBadge } from '@/components/ui/status-badge'
import { JobCockpit } from '@/components/job/job-cockpit'
import { DEMO_JOBS, DEMO_CUSTOMERS, DEMO_TECHNICIANS } from '@/lib/demo-data'
import { computeJobFlow, jobPriority, type EngineJob } from '@/lib/job-engine'
import { formatCurrency, formatTime } from '@/lib/utils'
import {
  Radio, AlertTriangle, DollarSign, Zap, ArrowRight, MapPin, Clock,
  Activity, ShieldAlert, CircleDollarSign, ListChecks,
} from 'lucide-react'

const customerMap = Object.fromEntries(DEMO_CUSTOMERS.map(c => [c.id, c]))
const techMap = Object.fromEntries(DEMO_TECHNICIANS.map(t => [t.id, t]))

function toEngineJob(j: (typeof DEMO_JOBS)[number]): EngineJob {
  return {
    id: j.id,
    customer_id: j.customer_id,
    technician_id: j.technician_id,
    service_type: j.service_type,
    source: j.source,
    status: j.status,
    address: j.address,
    scheduled_start: j.scheduled_start,
    estimated_price: j.estimated_price,
    final_price: j.final_price,
    amount_collected: j.amount_collected,
    payment_method: j.payment_method,
    payment_status: j.payment_status,
    cash_verification_status: j.cash_verification_status,
    payment_link_sent: j.payment_link_sent,
    parts_cost: j.parts_cost,
    technician_notes: j.technician_notes,
    notes: j.notes,
    updated_at: j.updated_at,
  }
}

const NEXT_DOT: Record<string, string> = {
  critical: 'bg-red-400',
  warning: 'bg-amber-400',
  info: 'bg-blue-400',
}

export default function DispatchCenterPage() {
  const [selected, setSelected] = useState<EngineJob | null>(null)
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const enriched = useMemo(() => {
    return DEMO_JOBS.map(toEngineJob).map(job => {
      const flow = computeJobFlow(job)
      return { job, flow, priority: jobPriority(job, flow) }
    })
  }, [])

  // Buckets
  const liveNow = enriched.filter(e => e.flow.isLive).sort((a, b) => b.priority - a.priority)
  const atRisk = enriched.filter(e => e.flow.risks.some(r => r.level === 'critical')).sort((a, b) => b.priority - a.priority)
  const moneyAtRisk = enriched
    .flatMap(e => e.flow.risks.filter(r => r.amount && (r.message.includes('cash') || r.message.includes('payment') || r.message.includes('link'))).map(r => r.amount || 0))
    .reduce((s, n) => s + n, 0)

  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999)
  const upNext = enriched
    .filter(e => {
      const d = new Date(e.job.scheduled_start)
      return d >= new Date() && d <= endOfDay && ['Scheduled', 'Assigned'].includes(e.job.status)
    })
    .sort((a, b) => new Date(a.job.scheduled_start).getTime() - new Date(b.job.scheduled_start).getTime())

  const needsAction = enriched
    .filter(e => !e.flow.isLive && (e.flow.nextAction.urgency !== 'info' || e.flow.risks.length > 0))
    .sort((a, b) => b.priority - a.priority)

  const queue = enriched.slice().sort((a, b) => b.priority - a.priority).slice(0, 12)

  const openCount = enriched.filter(e => !['Completed', 'Cancelled', 'No Show'].includes(e.job.status)).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Dispatch Center"
        subtitle="Field Service Brain — what's happening now, what's at risk, and the next move on every job"
        actions={
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE · {clock}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Live status strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StripCard icon={Activity} label="Happening Now" value={liveNow.length} sub="techs on active jobs" tone="live" />
          <StripCard icon={ShieldAlert} label="Critical Risks" value={atRisk.length} sub="need attention now" tone={atRisk.length ? 'danger' : 'ok'} />
          <StripCard icon={CircleDollarSign} label="Money at Risk" value={formatCurrency(moneyAtRisk)} sub="uncollected + unverified" tone={moneyAtRisk ? 'danger' : 'ok'} isText />
          <StripCard icon={ListChecks} label="Open Jobs" value={openCount} sub="in the pipeline right now" tone="neutral" />
        </div>

        {/* Happening Now */}
        <Section title="Happening Now" icon={Radio} accent="emerald" count={liveNow.length} empty="No technicians are on active jobs right now.">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {liveNow.map(({ job, flow }) => {
              const c = customerMap[job.customer_id]
              const t = job.technician_id ? techMap[job.technician_id] : null
              return (
                <button key={job.id} onClick={() => setSelected(job)}
                  className="text-left bg-gray-900 border border-emerald-500/30 rounded-lg p-3 hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <StatusBadge status={job.status} />
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{t?.name.split(' ')[0]}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white">{c?.name}</div>
                  <div className="text-xs text-amber-400 mb-2">{job.service_type}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" />{job.address.split(',')[0]}</div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-gray-800">
                    <span className={`w-1.5 h-1.5 rounded-full ${NEXT_DOT[flow.nextAction.urgency]}`} />
                    <span className="text-xs text-gray-300 font-medium truncate">{flow.nextAction.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </Section>

        {/* Needs Your Action — the operating queue */}
        <Section title="Operating Queue — Next Move on Every Job" icon={Zap} accent="amber" count={needsAction.length}
          empty="Nothing needs your attention. Everything is on track.">
          <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
            {queue.map(({ job, flow }) => {
              const c = customerMap[job.customer_id]
              const t = job.technician_id ? techMap[job.technician_id] : null
              const topRisk = flow.risks[0]
              return (
                <button key={job.id} onClick={() => setSelected(job)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800/40 transition-colors flex items-center gap-4">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${NEXT_DOT[flow.nextAction.urgency]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{c?.name}</span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {job.service_type} · {t?.name.split(' ')[0] || 'Unassigned'} · {formatTime(job.scheduled_start)}
                    </div>
                  </div>
                  <div className="hidden md:block min-w-0 flex-1">
                    <div className="text-sm text-gray-200 font-medium truncate">{flow.nextAction.label}</div>
                    {topRisk ? (
                      <div className={`text-xs truncate flex items-center gap-1 ${topRisk.level === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />{topRisk.message}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 truncate">{flow.nextAction.detail}</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-white tabular-nums">{formatCurrency(flow.profit.revenue)}</div>
                    <div className="text-xs text-gray-600">{flow.profit.margin.toFixed(0)}% margin</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </Section>

        {/* Two-up: Money at risk + Up next */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Money at Risk" icon={DollarSign} accent="red" count={atRisk.length}
            empty="No money is stuck. Everything collected and verified.">
            <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
              {atRisk.map(({ job, flow }) => {
                const c = customerMap[job.customer_id]
                const risk = flow.risks.find(r => r.level === 'critical')!
                return (
                  <button key={job.id} onClick={() => setSelected(job)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800/40 transition-colors flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white font-medium truncate">{c?.name} · {job.service_type}</div>
                      <div className="text-xs text-red-400 truncate">{risk.message}</div>
                    </div>
                    {risk.amount ? <div className="text-sm font-semibold text-red-400 tabular-nums flex-shrink-0">{formatCurrency(risk.amount)}</div> : null}
                  </button>
                )
              })}
            </div>
          </Section>

          <Section title="Up Next Today" icon={Clock} accent="blue" count={upNext.length}
            empty="No more jobs scheduled today.">
            <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
              {upNext.map(({ job, flow }) => {
                const c = customerMap[job.customer_id]
                const t = job.technician_id ? techMap[job.technician_id] : null
                return (
                  <button key={job.id} onClick={() => setSelected(job)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800/40 transition-colors flex items-center gap-3">
                    <div className="text-xs text-gray-400 tabular-nums w-14 flex-shrink-0">{formatTime(job.scheduled_start)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white font-medium truncate">{c?.name} · {job.service_type}</div>
                      <div className="text-xs text-gray-500 truncate">{t?.name.split(' ')[0] || <span className="text-amber-400">Needs assignment</span>} · {job.address.split(',')[0]}</div>
                    </div>
                    <div className="text-sm text-gray-400 tabular-nums flex-shrink-0">{formatCurrency(flow.profit.revenue)}</div>
                  </button>
                )
              })}
            </div>
          </Section>
        </div>
      </div>

      {selected && (
        <JobCockpit
          job={selected}
          customer={customerMap[selected.customer_id]}
          technician={selected.technician_id ? techMap[selected.technician_id] : null}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function StripCard({ icon: Icon, label, value, sub, tone, isText }: {
  icon: React.ElementType; label: string; value: string | number; sub: string
  tone: 'live' | 'danger' | 'ok' | 'neutral'; isText?: boolean
}) {
  const toneStyle = {
    live: 'border-emerald-500/30 bg-emerald-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
    ok: 'border-gray-800 bg-gray-900',
    neutral: 'border-gray-800 bg-gray-900',
  }[tone]
  const valueColor = {
    live: 'text-emerald-400', danger: 'text-red-400', ok: 'text-white', neutral: 'text-white',
  }[tone]
  return (
    <div className={`rounded-lg border p-4 ${toneStyle}`}>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide mb-2">
        <Icon className="w-3.5 h-3.5" />{label}
      </div>
      <div className={`font-semibold tabular-nums ${valueColor} ${isText ? 'text-2xl' : 'text-3xl'}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1">{sub}</div>
    </div>
  )
}

function Section({ title, icon: Icon, accent, count, children, empty }: {
  title: string; icon: React.ElementType; accent: 'emerald' | 'amber' | 'red' | 'blue'
  count: number; children: React.ReactNode; empty: string
}) {
  const accentColor = { emerald: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', blue: 'text-blue-400' }[accent]
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${accentColor}`} />
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-xs text-gray-600">{count}</span>
      </div>
      {count === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-6 text-sm text-gray-600 text-center">{empty}</div>
      ) : children}
    </div>
  )
}
