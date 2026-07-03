'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { DEMO_DOCUMENTS, type DocumentType } from '@/lib/demo-intelligence'
import { analyzeDocumentText } from '@/app/actions/agent'
import { IntelligencePanel } from '@/components/intelligence/intelligence-panel'
import { formatDate } from '@/lib/utils'
import {
  FileText, Receipt, ShieldCheck, Key, LineChart, Scale, Upload, Loader2,
  CheckCircle2, Sparkles, AlertTriangle, ArrowRight, Wrench,
} from 'lucide-react'

const SAMPLE_10K = 'FY revenue $501,600, up 12% year-over-year. EBITDA margin 29%. Top 5 customers represent 18% of total revenue (customer concentration). All commercial quoting requires owner approval (owner dependency). Commercial auto insurance renews in 58 days at a 9% higher premium. Recurring contract revenue is 6% of the total.'

const TYPE_META: Record<DocumentType, { icon: React.ElementType; color: string }> = {
  Contract: { icon: FileText, color: 'text-blue-400' },
  'Tax Filing': { icon: Receipt, color: 'text-amber-400' },
  Insurance: { icon: ShieldCheck, color: 'text-emerald-400' },
  Lease: { icon: Key, color: 'text-purple-400' },
  'Financial Statement': { icon: LineChart, color: 'text-cyan-400' },
  Legal: { icon: Scale, color: 'text-red-400' },
}

interface Analysis { summary: string; findings: string[]; risks: string[]; recommendations: string[]; mock: boolean }

export default function DocumentsPage() {
  const [dragging, setDragging] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  const analyze = async () => {
    const input = text.trim() || SAMPLE_10K
    setBusy(true); setAnalysis(null)
    try { setAnalysis(await analyzeDocumentText(input)) } finally { setBusy(false) }
  }

  const processedCount = DEMO_DOCUMENTS.filter(d => d.status === 'Processed').length
  const totalInsights = DEMO_DOCUMENTS.reduce((s, d) => s + d.insightsCount, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Documents"
        subtitle="Every contract, filing, and statement Titan has read and indexed into Company Memory"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <IntelligencePanel
          workflowId="document"
          label="Titan reads it like an analyst"
          description="Paste document or 10-K text — Titan extracts risks, opportunities, and what it means for your business, then files it to memory."
          inputPlaceholder="Paste document text (or leave blank for the sample annual summary)"
          inputKey="text"
          savable
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Documents" value={DEMO_DOCUMENTS.length} format="number" />
          <StatCard title="Processed" value={processedCount} format="number" highlight />
          <StatCard title="Insights Extracted" value={totalInsights} format="number" />
          <StatCard title="Processing" value={DEMO_DOCUMENTS.length - processedCount} format="number" />
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false) }}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragging ? 'border-amber-500/50 bg-amber-500/5' : 'border-gray-800 bg-gray-900/50'}`}
        >
          <Upload className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <div className="text-sm text-gray-300 font-medium mb-1">Drop any document to read it into Titan</div>
          <div className="text-xs text-gray-600 mb-3">Contracts, leases, tax filings, financial statements, insurance policies — PDF or scanned</div>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded border border-gray-700 transition-colors">
            Browse files
          </button>
        </div>

        {/* Live analyze: paste document text or a 10-K excerpt */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" />Analyze document text or a 10-K excerpt</div>
            <button onClick={() => setText(SAMPLE_10K)} className="text-xs text-gray-500 hover:text-gray-300">Use sample</button>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            placeholder="Paste contract language, a financial statement, or a 10-K excerpt…"
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none mb-3"
          />
          <button onClick={analyze} disabled={busy} className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 text-sm font-semibold rounded transition-colors">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Analyze
          </button>

          {analysis && (
            <div className="mt-4 space-y-3">
              <div className="text-sm text-gray-300">{analysis.summary}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <AnalysisList title="Key Findings" items={analysis.findings} icon={CheckCircle2} color="text-emerald-400" />
                <AnalysisList title="Risks" items={analysis.risks} icon={AlertTriangle} color="text-amber-400" />
                <AnalysisList title="Recommendations" items={analysis.recommendations} icon={ArrowRight} color="text-blue-400" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <Wrench className="w-2.5 h-2.5 text-amber-400" />Azure OpenAI · summarizeDocument{analysis.mock && ' · mock'}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
          {DEMO_DOCUMENTS.map(doc => {
            const meta = TYPE_META[doc.type]
            const Icon = meta.icon
            return (
              <div key={doc.id} className="px-4 py-3 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="text-sm font-medium text-white truncate">{doc.name}</div>
                    <div className="text-xs text-gray-600 flex-shrink-0">{formatDate(doc.uploadedAt)}</div>
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed mb-1.5">{doc.summary}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{doc.type}</span>
                    {doc.status === 'Processed' ? (
                      <span className="text-[10px] flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" />Processed · {doc.insightsCount} insights</span>
                    ) : (
                      <span className="text-[10px] flex items-center gap-1 text-amber-400"><Loader2 className="w-3 h-3 animate-spin" />Processing</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Link href="/filings" className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="flex-1 text-sm text-gray-300">Need to read a 10-K, 10-Q, or annual filing? Use the <span className="text-amber-400 font-medium">Filing Reader</span> for financial statements formatted for diligence.</div>
          </div>
        </Link>
      </div>
    </div>
  )
}

function AnalysisList({ title, items, icon: Icon, color }: { title: string; items: string[]; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-gray-950/60 border border-gray-800 rounded p-3">
      <div className={`text-xs uppercase tracking-wide mb-2 flex items-center gap-1 ${color}`}><Icon className="w-3 h-3" />{title}</div>
      <ul className="space-y-1.5">
        {items.length === 0 ? <li className="text-xs text-gray-600">None found.</li> : items.map((it, i) => (
          <li key={i} className="text-xs text-gray-400 leading-relaxed flex items-start gap-1.5"><span className={`mt-1 w-1 h-1 rounded-full flex-shrink-0 ${color.replace('text-', 'bg-')}`} />{it}</li>
        ))}
      </ul>
    </div>
  )
}
