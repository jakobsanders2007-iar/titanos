'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { executeWorkflow, askTitan } from '@/app/actions/agent'
import { IntelligencePanel } from '@/components/intelligence/intelligence-panel'
import type { AgentRunResult } from '@/lib/agent/types'
import { Search, Globe, Users, Package, Building2, Loader2, ArrowRight, Wrench, Save } from 'lucide-react'

type Mode = 'search' | 'crawl' | 'competitors' | 'vendors' | 'industry'

const MODES: { id: Mode; label: string; icon: React.ElementType; placeholder: string; prompt: (q: string) => string }[] = [
  { id: 'search', label: 'Web Search', icon: Search, placeholder: 'Search the web…', prompt: q => `search the web for ${q}` },
  { id: 'crawl', label: 'Crawl URL', icon: Globe, placeholder: 'example.com', prompt: q => `summarize this website: ${q}` },
  { id: 'competitors', label: 'Competitors', icon: Users, placeholder: 'locksmith Houston', prompt: q => `find competitors: ${q}` },
  { id: 'vendors', label: 'Vendors', icon: Package, placeholder: 'rekey supplies', prompt: q => `find vendors for ${q}` },
  { id: 'industry', label: 'Industry', icon: Building2, placeholder: 'locksmith benchmarks', prompt: q => `research industry ${q}` },
]

export default function ResearchPage() {
  const [mode, setMode] = useState<Mode>('competitors')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<AgentRunResult | null>(null)
  const [saved, setSaved] = useState(false)

  const active = MODES.find(m => m.id === mode)!

  const run = async () => {
    const q = query.trim() || active.placeholder
    setBusy(true); setResult(null); setSaved(false)
    try {
      const r = await askTitan(active.prompt(q))
      setResult(r)
    } finally { setBusy(false) }
  }

  const quickCompetitor = async () => {
    setBusy(true); setResult(null); setSaved(false)
    try {
      const wf = await executeWorkflow('wf-competitor')
      setResult({ answer: wf.answer, toolRuns: wf.toolsUsed.map(t => ({ toolName: t, provider: t.split('·')[0].trim(), status: 'ok', mock: true, summary: '', output: null })), nextAction: wf.nextAction })
    } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Research"
        subtitle="Search the web, crawl sites, and study competitors — powered by Exa + Firecrawl"
        actions={
          <button onClick={quickCompetitor} disabled={busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 text-xs font-semibold rounded transition-colors">
            <Users className="w-3.5 h-3.5" />Scan my competitors
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl w-full mx-auto">
        <IntelligencePanel
          workflowId="competitor"
          label="Deep competitor analysis"
          description="Exa finds them, Firecrawl reads their site, Titan synthesizes the gaps you can exploit."
          inputPlaceholder='Competitor URL or query, e.g. "locksmith Houston"'
          inputKey="query"
          savable
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          {MODES.map(m => {
            const Icon = m.icon
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition-colors ${mode === m.id ? 'bg-gray-800 text-white border-gray-700' : 'text-gray-500 border-gray-800 hover:text-gray-300'}`}>
                <Icon className="w-3.5 h-3.5" />{m.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <active.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') run() }}
              placeholder={active.placeholder}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <button onClick={run} disabled={busy} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 text-sm font-semibold rounded-lg transition-colors flex-shrink-0">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run'}
          </button>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-300 leading-relaxed">{result.answer}</div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {result.toolRuns.map((r, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-gray-800 bg-gray-950 text-gray-400">
                    <Wrench className="w-2.5 h-2.5 text-amber-400" />{r.provider} · {r.toolName}{r.mock && <span className="text-gray-600">mock</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-1.5 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded px-3 py-2 flex-1">
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /><span>Next: {result.nextAction}</span>
              </div>
              <button onClick={() => setSaved(true)} className="ml-2 flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded border border-gray-700 transition-colors flex-shrink-0">
                <Save className="w-3.5 h-3.5" />{saved ? 'Saved to Memory' : 'Save to Memory'}
              </button>
            </div>
          </div>
        )}

        {!result && !busy && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <Search className="w-8 h-8 mb-2" />
            <div className="text-sm">Run a search to see results, tools used, and the next action.</div>
          </div>
        )}
      </div>
    </div>
  )
}
