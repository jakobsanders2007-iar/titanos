'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { executeWorkflow } from '@/app/actions/agent'
import { DEMO_AI_CALLS } from '@/lib/demo-extended'
import type { WorkflowResult } from '@/lib/agent/types'
import { formatDateTime } from '@/lib/utils'
import {
  Phone, PhoneMissed, Mic, Bot, Loader2, ArrowRight, Wrench, PlayCircle, AlertTriangle,
} from 'lucide-react'

export default function VoicePage() {
  const [busy, setBusy] = useState<string | null>(null)
  const [result, setResult] = useState<WorkflowResult | null>(null)

  const run = async (id: string) => {
    setBusy(id); setResult(null)
    try { setResult(await executeWorkflow(id)) } finally { setBusy(null) }
  }

  const calls = DEMO_AI_CALLS.slice(0, 8)
  const booked = DEMO_AI_CALLS.filter(c => c.job_created).length
  const missed = DEMO_AI_CALLS.filter(c => c.outcome.startsWith('Missed')).length
  const escalations = DEMO_AI_CALLS.filter(c => c.escalation_needed).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Voice"
        subtitle="AI receptionist, call transcription, and summaries — Vapi, Telnyx & Gladia"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="AI Receptionist" value="Live" subtitle="Ava is answering" highlight />
          <StatCard title="Jobs Booked" value={booked} format="number" />
          <StatCard title="Missed Calls" value={missed} format="number" warning={missed > 0} />
          <StatCard title="Escalations" value={escalations} format="number" warning={escalations > 0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={() => run('wf-receptionist')} disabled={!!busy} className="text-left bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors disabled:opacity-50">
            <div className="flex items-center gap-2 mb-1"><Bot className="w-4 h-4 text-amber-400" /><span className="text-sm font-semibold text-white">Simulate a receptionist booking</span>{busy === 'wf-receptionist' && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500 ml-auto" />}</div>
            <div className="text-xs text-gray-500">Vapi answers a lockout call, qualifies urgency, and books the job.</div>
          </button>
          <button onClick={() => run('wf-transcript')} disabled={!!busy} className="text-left bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors disabled:opacity-50">
            <div className="flex items-center gap-2 mb-1"><Mic className="w-4 h-4 text-amber-400" /><span className="text-sm font-semibold text-white">Transcribe & summarize a call</span>{busy === 'wf-transcript' && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500 ml-auto" />}</div>
            <div className="text-xs text-gray-500">Gladia transcribes a recording and extracts action items.</div>
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 border border-amber-500/20 rounded-lg p-4 space-y-2">
            <div className="text-sm font-semibold text-white flex items-center gap-2"><PlayCircle className="w-4 h-4 text-amber-400" />{result.title}</div>
            <div className="text-sm text-gray-300 leading-relaxed">{result.answer}</div>
            <div className="flex flex-wrap gap-1.5">
              {result.toolsUsed.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-gray-800 bg-gray-950 text-gray-400"><Wrench className="w-2.5 h-2.5 text-amber-400" />{t}</span>
              ))}
            </div>
            <div className="flex items-start gap-1.5 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded px-3 py-2"><ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /><span>Next: {result.nextAction}</span></div>
          </div>
        )}

        {/* Call log */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-800 text-sm font-semibold text-white">Recent Calls</div>
          <div className="divide-y divide-gray-800">
            {calls.map(c => (
              <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                {c.outcome.startsWith('Missed') ? <PhoneMissed className="w-4 h-4 text-red-400 flex-shrink-0" /> : <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white font-medium truncate">{c.caller_name} · {c.service_type}</div>
                  <div className="text-xs text-gray-500 truncate">{c.summary}</div>
                </div>
                {c.escalation_needed && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                <div className="text-xs text-gray-600 flex-shrink-0 hidden md:block">{formatDateTime(c.received_at)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
