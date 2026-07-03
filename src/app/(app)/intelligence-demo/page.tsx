'use client'

import { useEffect, useRef, useState } from 'react'
import { Header } from '@/components/layout/header'
import { runIntelligenceWorkflow, saveReportToMemory, getEngineStatus } from '@/app/actions/hermes'
import type { IntelligenceReport, IntelligenceCard, ToolTimelineEntry } from '@/lib/ai/hermes/types'
import {
  Sparkles, Brain, Check, Loader2, ArrowRight, AlertTriangle, ListChecks,
  FileText, Save, TrendingUp, HelpCircle, Package, Gauge, ShieldCheck, Zap,
} from 'lucide-react'

// Titan Intelligence Demo — a scripted, cinematic walkthrough of the Hermes
// engine: question → tool timeline → intelligence cards → action plan →
// CEO brief → save to Business Memory.

type Stage = 'idle' | 'thinking' | 'brief' | 'plan' | 'ceo'

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

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const tone = pct >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : pct >= 60 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${tone}`}>{pct}% confidence</span>
}

function ToolTimeline({ entries, revealed }: { entries: ToolTimelineEntry[]; revealed: number }) {
  return (
    <div className="space-y-1.5">
      {entries.slice(0, revealed).map((t, i) => (
        <div key={i} className="flex items-center gap-2.5 text-xs animate-[fadeIn_0.3s_ease-out]" style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-amber-400" />
          </span>
          <span className="font-mono text-amber-400/90">{t.tool}</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-400 truncate flex-1">{t.summary}</span>
          <span className="text-gray-700 tabular-nums flex-shrink-0">{t.ms}ms</span>
        </div>
      ))}
      {revealed < entries.length && (
        <div className="flex items-center gap-2.5 text-xs">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin flex-shrink-0 p-1" />
          <span className="text-gray-500">Titan is thinking across your business…</span>
        </div>
      )}
    </div>
  )
}

function ReportBlock({ report, revealCards }: { report: IntelligenceReport; revealCards: boolean }) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/25 rounded-lg p-5">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />{report.title}
          </div>
          <div className="flex items-center gap-2">
            <ConfidenceBadge value={report.confidence} />
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-700 bg-gray-900 text-gray-400">
              {report.engine === 'hermes' ? 'Hermes Agent · live' : 'Titan engine · demo'}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed">{report.narrative}</p>
        {report.limitations && (
          <p className="text-[11px] text-gray-500 mt-2 flex items-start gap-1.5">
            <ShieldCheck className="w-3 h-3 mt-0.5 flex-shrink-0" />Limitations: {report.limitations}
          </p>
        )}
      </div>

      {revealCards && report.cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.cards.map((c, i) => {
            const meta = CARD_META[c.kind] ?? CARD_META.summary
            const Icon = meta.icon
            return (
              <div key={i} className={`bg-gray-900 border rounded-lg p-4 ${meta.border}`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${meta.color}`}>
                  <Icon className="w-3.5 h-3.5" />{c.title}
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">{c.body}</div>
                {c.meta && <div className="text-[10px] text-gray-600 mt-2">{c.meta}</div>}
              </div>
            )
          })}
        </div>
      )}

      {revealCards && report.nextActions.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" />Next best actions</div>
          <div className="space-y-1.5">
            {report.nextActions.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-4 h-4 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {a}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function IntelligenceDemoPage() {
  const [stage, setStage] = useState<Stage>('idle')
  const [brief, setBrief] = useState<IntelligenceReport | null>(null)
  const [plan, setPlan] = useState<IntelligenceReport | null>(null)
  const [ceo, setCeo] = useState<IntelligenceReport | null>(null)
  const [revealed, setRevealed] = useState(0)
  const [cardsShown, setCardsShown] = useState(false)
  const [busy, setBusy] = useState(false)
  const [savedNote, setSavedNote] = useState<string | null>(null)
  const [engine, setEngine] = useState<{ engine: string; live: boolean } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { getEngineStatus().then(s => setEngine({ engine: s.engine, live: s.live })).catch(() => {}) }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [stage, revealed, cardsShown, plan, ceo, savedNote])

  // Stage 1: ask "What changed yesterday?" → tool timeline reveals sequentially
  const start = async () => {
    setStage('thinking'); setBusy(true); setBrief(null); setPlan(null); setCeo(null); setCardsShown(false); setSavedNote(null); setRevealed(0)
    try {
      const report = await runIntelligenceWorkflow('morning-brief')
      setBrief(report)
      // cinematic sequential reveal of tool calls
      for (let i = 1; i <= report.toolTimeline.length; i++) {
        await new Promise(r => setTimeout(r, 450))
        setRevealed(i)
      }
      await new Promise(r => setTimeout(r, 500))
      setStage('brief')
      await new Promise(r => setTimeout(r, 300))
      setCardsShown(true)
    } finally { setBusy(false) }
  }

  const generatePlan = async () => {
    setBusy(true)
    try {
      const report = await runIntelligenceWorkflow('why-revenue')
      // The "action plan" beat: reuse the morning-brief actions + why-revenue actions as a concrete plan
      setPlan(report)
      setStage('plan')
    } finally { setBusy(false) }
  }

  const generateCeo = async () => {
    setBusy(true)
    try {
      setCeo(await runIntelligenceWorkflow('ceo-packet'))
      setStage('ceo')
    } finally { setBusy(false) }
  }

  const save = async () => {
    if (!ceo) return
    setBusy(true)
    try {
      const r = await saveReportToMemory(ceo)
      setSavedNote(r.note)
    } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Titan Intelligence Demo"
        subtitle="Watch the engine inspect the business, explain the why, and turn it into action"
        actions={
          engine && (
            <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded border ${engine.live ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
              <Brain className="w-3.5 h-3.5" />{engine.engine}
            </div>
          )
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6 pb-12">

          {/* Opening beat */}
          {stage === 'idle' ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500 flex items-center justify-center mb-5 shadow-[0_0_60px_-10px_rgba(245,158,11,0.5)]">
                <Brain className="w-8 h-8 text-gray-950" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ask your business a question.</h2>
              <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">Titan reads jobs, calls, payments, cash, CRM, and goals — then explains what changed, why, and what to do.</p>
              <button onClick={start} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-lg transition-colors text-sm">
                <Sparkles className="w-4 h-4" />&ldquo;What changed yesterday?&rdquo;
              </button>
            </div>
          ) : (
            <>
              {/* The question */}
              <div className="flex justify-end">
                <div className="bg-amber-500 text-gray-950 text-sm font-medium rounded-lg px-4 py-2.5">What changed yesterday?</div>
              </div>

              {/* Tool execution timeline */}
              {brief && (
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-3">Tool execution — Titan checked your business</div>
                  <ToolTimeline entries={brief.toolTimeline} revealed={revealed} />
                </div>
              )}
              {!brief && (
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />Titan is thinking across your business…
                </div>
              )}

              {/* The brief */}
              {stage !== 'thinking' && brief && <ReportBlock report={brief} revealCards={cardsShown} />}

              {/* Beat 2: action plan */}
              {stage === 'brief' && cardsShown && (
                <div className="flex justify-center">
                  <button onClick={generatePlan} disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-semibold rounded-lg transition-colors text-sm">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListChecks className="w-4 h-4" />}Generate action plan
                  </button>
                </div>
              )}
              {plan && (
                <>
                  <div className="flex justify-end"><div className="bg-amber-500 text-gray-950 text-sm font-medium rounded-lg px-4 py-2.5">Generate an action plan.</div></div>
                  <ReportBlock report={plan} revealCards />
                </>
              )}

              {/* Beat 3: CEO brief */}
              {stage === 'plan' && (
                <div className="flex justify-center">
                  <button onClick={generateCeo} disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-semibold rounded-lg transition-colors text-sm">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}Generate CEO brief
                  </button>
                </div>
              )}
              {ceo && (
                <>
                  <div className="flex justify-end"><div className="bg-amber-500 text-gray-950 text-sm font-medium rounded-lg px-4 py-2.5">Generate the CEO brief.</div></div>
                  <ReportBlock report={ceo} revealCards />
                </>
              )}

              {/* Beat 4: save to memory */}
              {stage === 'ceo' && !savedNote && (
                <div className="flex justify-center">
                  <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-amber-500/30 text-amber-400 font-semibold rounded-lg transition-colors text-sm">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save to Business Memory
                  </button>
                </div>
              )}
              {savedNote && (
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3">
                  <Check className="w-4 h-4" />{savedNote}
                  <button onClick={start} className="ml-3 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">Run again <ArrowRight className="w-3 h-3" /></button>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}
