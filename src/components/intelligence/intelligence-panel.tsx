'use client'

import { useState } from 'react'
import { runIntelligenceWorkflow, saveReportToMemory } from '@/app/actions/hermes'
import type { IntelligenceReport, IntelligenceCard } from '@/lib/ai/hermes/types'
import {
  Sparkles, Brain, Check, Loader2, AlertTriangle, ListChecks, FileText,
  Save, TrendingUp, HelpCircle, Package, Gauge, ShieldCheck, Zap, Wrench,
} from 'lucide-react'

// Shared Hermes intelligence panel: a "Run Titan analysis" affordance that
// executes a workflow server-side and renders the IntelligenceReport as
// intelligence cards (tool timeline, confidence, limitations, next actions).
// Embedded across memory/why/goals/ceo-packet/ai-shopper/research/documents.

const CARD_META: Record<IntelligenceCard['kind'], { icon: React.ElementType; color: string; border: string }> = {
  changed: { icon: TrendingUp, color: 'text-blue-400', border: 'border-blue-500/20' },
  why: { icon: HelpCircle, color: 'text-amber-400', border: 'border-amber-500/20' },
  risk: { icon: AlertTriangle, color: 'text-red-400', border: 'border-red-500/30' },
  action: { icon: ListChecks, color: 'text-emerald-400', border: 'border-emerald-500/20' },
  summary: { icon: FileText, color: 'text-gray-300', border: 'border-gray-700' },
  memory: { icon: Brain, color: 'text-purple-400', border: 'border-purple-500/20' },
  item: { icon: Package, color: 'text-orange-400', border: 'border-orange-500/20' },
  metric: { icon: Gauge, color: 'text-cyan-400', border: 'border-cyan-500/20' },
}

export function IntelligenceReportView({ report }: { report: IntelligenceReport }) {
  const pct = Math.round(report.confidence * 100)
  const tone = pct >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : pct >= 60 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/25 rounded-lg p-4">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-400"><Sparkles className="w-3.5 h-3.5" />{report.title}</div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${tone}`}>{pct}% confidence</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-700 bg-gray-900 text-gray-400">{report.engine === 'hermes' ? 'Hermes · live' : 'Titan engine'}</span>
          </div>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed">{report.narrative}</p>
        {report.limitations && (
          <p className="text-[11px] text-gray-500 mt-2 flex items-start gap-1.5"><ShieldCheck className="w-3 h-3 mt-0.5 flex-shrink-0" />Limitations: {report.limitations}</p>
        )}
      </div>

      {report.toolTimeline.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {report.toolTimeline.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-gray-800 bg-gray-950 text-gray-400">
              <Wrench className="w-2.5 h-2.5 text-amber-400" />{t.tool}
            </span>
          ))}
        </div>
      )}

      {report.cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.cards.map((c, i) => {
            const meta = CARD_META[c.kind] ?? CARD_META.summary
            const Icon = meta.icon
            return (
              <div key={i} className={`bg-gray-900 border rounded-lg p-4 ${meta.border}`}>
                <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${meta.color}`}><Icon className="w-3.5 h-3.5" />{c.title}</div>
                <div className="text-sm text-gray-300 leading-relaxed">{c.body}</div>
                {c.meta && <div className="text-[10px] text-gray-600 mt-2">{c.meta}</div>}
              </div>
            )
          })}
        </div>
      )}

      {report.nextActions.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" />Next best actions</div>
          <div className="space-y-1.5">
            {report.nextActions.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-4 h-4 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>{a}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function IntelligencePanel({
  workflowId, label, description, inputPlaceholder, inputKey = 'question', savable,
}: {
  workflowId: string
  label: string
  description: string
  /** When set, shows a text input whose value is passed as workflow input. */
  inputPlaceholder?: string
  inputKey?: string
  /** Show a "Save to Business Memory" button on the result. */
  savable?: boolean
}) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState<IntelligenceReport | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const run = async () => {
    setBusy(true); setReport(null); setSaved(null)
    try {
      setReport(await runIntelligenceWorkflow(workflowId, value.trim() ? { [inputKey]: value.trim() } : {}))
    } finally { setBusy(false) }
  }

  const save = async () => {
    if (!report) return
    setBusy(true)
    try { setSaved((await saveReportToMemory(report)).note) } finally { setBusy(false) }
  }

  return (
    <div className="bg-gray-900/60 border border-amber-500/20 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{label}</div>
            <div className="text-xs text-gray-500">{description}</div>
          </div>
        </div>
        {!inputPlaceholder && (
          <button onClick={run} disabled={busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 text-xs font-semibold rounded transition-colors flex-shrink-0">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}Run Titan analysis
          </button>
        )}
      </div>

      {inputPlaceholder && (
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') run() }}
            placeholder={inputPlaceholder}
            className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
          />
          <button onClick={run} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 text-xs font-semibold rounded transition-colors flex-shrink-0">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}Ask
          </button>
        </div>
      )}

      {busy && !report && (
        <div className="flex items-center gap-2 text-xs text-gray-500 py-2"><Loader2 className="w-4 h-4 animate-spin text-amber-400" />Titan is thinking across your business…</div>
      )}

      {report && (
        <>
          <IntelligenceReportView report={report} />
          {savable && !saved && (
            <button onClick={save} disabled={busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded transition-colors">
              <Save className="w-3.5 h-3.5" />Save to Business Memory
            </button>
          )}
          {saved && <div className="flex items-center gap-1.5 text-xs text-emerald-400"><Check className="w-3.5 h-3.5" />{saved}</div>}
        </>
      )}
    </div>
  )
}
