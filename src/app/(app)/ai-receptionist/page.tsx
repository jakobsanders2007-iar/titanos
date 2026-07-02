'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { DEMO_AI_CALLS, type AICall } from '@/lib/demo-extended'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { PhoneCall, PhoneMissed, AlertTriangle, Bot, CheckCircle2, X, Clock } from 'lucide-react'

const OUTCOME_STYLES: Record<string, string> = {
  'Job Booked': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Quote Requested': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Info Only': 'bg-gray-800 text-gray-400 border-gray-700',
  'Escalated': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Missed — Recovered': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Missed — Lost': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Spam': 'bg-gray-800 text-gray-600 border-gray-700',
}

const URGENCY_STYLES: Record<string, string> = {
  'Emergency': 'text-red-400',
  'Same Day': 'text-amber-400',
  'This Week': 'text-blue-400',
  'Flexible': 'text-gray-500',
}

const TABS = ['All Calls', 'Booked Jobs', 'Missed Calls', 'Escalations'] as const

export default function AIReceptionistPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('All Calls')
  const [selected, setSelected] = useState<AICall | null>(null)

  const calls = DEMO_AI_CALLS
  const booked = calls.filter(c => c.job_created)
  const missed = calls.filter(c => c.outcome.startsWith('Missed'))
  const recovered = calls.filter(c => c.outcome === 'Missed — Recovered')
  const escalations = calls.filter(c => c.escalation_needed)
  const revenueBooked = booked.reduce((s, c) => s + (c.quoted_estimate || 0), 0)
  const answered = calls.filter(c => c.outcome !== 'Missed — Lost' && c.outcome !== 'Missed — Recovered')
  const avgConfidence = answered.length
    ? answered.filter(c => c.ai_confidence > 0).reduce((s, c) => s + c.ai_confidence, 0) / answered.filter(c => c.ai_confidence > 0).length
    : 0

  const visible = calls.filter(c => {
    if (tab === 'Booked Jobs') return c.job_created
    if (tab === 'Missed Calls') return c.outcome.startsWith('Missed')
    if (tab === 'Escalations') return c.escalation_needed
    return true
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="AI Receptionist"
        subtitle="Ava answers every call, 24/7 — books jobs, qualifies urgency, escalates what matters"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ava is answering · Twilio integration coming
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          <StatCard title="Calls Handled (30d)" value={calls.length} format="number" />
          <StatCard title="Jobs Booked by AI" value={booked.length} format="number" highlight />
          <StatCard title="Revenue Booked" value={revenueBooked} format="currency" highlight />
          <StatCard title="Missed Calls Recovered" value={`${recovered.length}/${missed.length}`} />
          <StatCard title="Escalations Pending" value={escalations.length} format="number" warning={escalations.length > 0} />
          <StatCard title="Avg AI Confidence" value={avgConfidence * 100} format="percent" />
        </div>

        {escalations.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <div className="text-sm font-medium text-amber-400">Escalations needing your review</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {escalations.map(c => (
                <button key={c.id} onClick={() => setSelected(c)} className="text-left bg-gray-900 border border-amber-500/20 rounded p-3 hover:border-amber-500/40 transition-colors">
                  <div className="text-sm font-semibold text-white">{c.caller_name}</div>
                  <div className="text-xs text-amber-400 mb-1">{c.service_type}{c.quoted_estimate ? ` · ${formatCurrency(c.quoted_estimate)}` : ''}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{c.summary}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <div className="flex rounded overflow-hidden border border-gray-800">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs transition-colors ${tab === t ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{t}</button>
              ))}
            </div>
            <div className="text-xs text-gray-500">{visible.length} calls</div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Caller', 'Service', 'Urgency', 'Received', 'Duration', 'Estimate', 'Outcome', 'Confidence'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(c => (
                <tr key={c.id} onClick={() => setSelected(c)} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{c.caller_name}</div>
                    <div className="text-xs text-gray-500">{c.caller_phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300">{c.service_type}</div>
                    <div className="text-xs text-gray-600">{c.vertical}</div>
                  </td>
                  <td className={`px-4 py-3 text-xs font-medium ${URGENCY_STYLES[c.urgency]}`}>{c.urgency}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDateTime(c.received_at)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs tabular-nums">{c.duration_sec ? `${Math.floor(c.duration_sec / 60)}:${String(c.duration_sec % 60).padStart(2, '0')}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-300 tabular-nums">{c.quoted_estimate ? formatCurrency(c.quoted_estimate) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${OUTCOME_STYLES[c.outcome]}`}>{c.outcome}</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.ai_confidence > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${c.ai_confidence >= 0.85 ? 'bg-emerald-500' : c.ai_confidence >= 0.7 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.ai_confidence * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 tabular-nums">{Math.round(c.ai_confidence * 100)}%</span>
                      </div>
                    ) : <span className="text-xs text-gray-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <PhoneMissed className="w-8 h-8 mb-2" />
              <div>No calls in this view</div>
            </div>
          )}
        </div>
      </div>

      {/* Call drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md bg-gray-950 border-l border-gray-800 h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-lg font-semibold text-white">{selected.caller_name}</div>
                <div className="text-sm text-gray-500">{selected.caller_phone}</div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded border ${OUTCOME_STYLES[selected.outcome]}`}>{selected.outcome}</span>
                <span className={`text-xs px-2 py-0.5 rounded border border-gray-700 ${URGENCY_STYLES[selected.urgency]}`}>{selected.urgency}</span>
                <span className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-400">{selected.vertical}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-gray-500 mb-0.5">Service</div><div className="text-gray-200">{selected.service_type}</div></div>
                <div><div className="text-xs text-gray-500 mb-0.5">Estimate</div><div className="text-gray-200">{selected.quoted_estimate ? formatCurrency(selected.quoted_estimate) : '—'}</div></div>
                <div><div className="text-xs text-gray-500 mb-0.5">Received</div><div className="text-gray-200 flex items-center gap-1"><Clock className="w-3 h-3 text-gray-500" />{formatDateTime(selected.received_at)}</div></div>
                <div><div className="text-xs text-gray-500 mb-0.5">Job Created</div><div className="text-gray-200">{selected.job_created ? <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Yes</span> : 'No'}</div></div>
              </div>

              {selected.address && (
                <div><div className="text-xs text-gray-500 mb-0.5">Address</div><div className="text-sm text-gray-200">{selected.address}</div></div>
              )}

              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Bot className="w-3.5 h-3.5" />AI Summary</div>
                <div className="text-sm text-gray-300 bg-gray-900 border border-gray-800 rounded p-3 leading-relaxed">{selected.summary}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Transcript Preview</div>
                <pre className="text-xs text-gray-400 bg-gray-900 border border-gray-800 rounded p-3 whitespace-pre-wrap font-mono leading-relaxed">{selected.transcript_preview}</pre>
              </div>

              {selected.escalation_needed && (
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">Schedule Site Visit</button>
                  <button className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded border border-gray-700 transition-colors">Dismiss Escalation</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
