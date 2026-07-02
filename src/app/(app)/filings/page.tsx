'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { DEMO_FILINGS, type Filing } from '@/lib/demo-intelligence'
import { formatDate } from '@/lib/utils'
import { FileStack, AlertTriangle, TrendingUp, MessageSquare, Upload } from 'lucide-react'

export default function FilingReaderPage() {
  const [selected, setSelected] = useState<Filing>(DEMO_FILINGS[0])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="10-K / Filing Reader"
        subtitle="Upload your own annual filing or a competitor's public 10-K — Titan reads both the same way"
        actions={
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
            <Upload className="w-3.5 h-3.5" />Upload Filing
          </button>
        }
      />
      <div className="flex-1 overflow-hidden flex">
        <div className="w-72 border-r border-gray-800 overflow-y-auto flex-shrink-0">
          {DEMO_FILINGS.map(f => (
            <button
              key={f.id}
              onClick={() => setSelected(f)}
              className={`w-full text-left px-4 py-3 border-b border-gray-800/50 transition-colors ${selected.id === f.id ? 'bg-gray-900' : 'hover:bg-gray-900/50'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileStack className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{f.type}</span>
              </div>
              <div className="text-sm text-white font-medium leading-snug">{f.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{f.period} · {formatDate(f.uploadedAt)}</div>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <div className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 inline-block mb-2">{selected.type} · {selected.period}</div>
            <div className="text-lg font-semibold text-white">{selected.name}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />Highlights
            </div>
            <ul className="space-y-2">
              {selected.highlights.map((h, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />{h}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />Risk Factors
            </div>
            <ul className="space-y-2">
              {selected.riskFactors.map((r, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />{r}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-amber-400 mb-2">
              <MessageSquare className="w-3.5 h-3.5" />Titan&apos;s Read
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{selected.managementNotes}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
