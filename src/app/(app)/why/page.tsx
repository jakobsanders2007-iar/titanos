'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { DEMO_WHY, type WhyAnalysis } from '@/lib/demo-intelligence'
import { IntelligencePanel } from '@/components/intelligence/intelligence-panel'
import { formatCurrency } from '@/lib/utils'
import { HelpCircle, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'

function formatImpact(value: number, unit: WhyAnalysis['unit']) {
  const sign = value > 0 ? '+' : ''
  if (unit === 'currency') return `${sign}${formatCurrency(value)}`
  return `${sign}${value.toFixed(1)} pts`
}

export default function WhyAnalysisPage() {
  const [expanded, setExpanded] = useState<string | null>(DEMO_WHY[0]?.id ?? null)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Why Analysis"
        subtitle="The Why Brain — every metric change, explained with contributing factors and a root cause"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        <IntelligencePanel
          workflowId="why-revenue"
          label="Run a live Why analysis"
          description="Titan inspects revenue, jobs, technicians, unpaid work, and CRM — then explains the change with confidence and limitations."
          savable
        />
        {DEMO_WHY.map(w => {
          const isOpen = expanded === w.id
          const maxAbs = Math.max(...w.factors.map(f => Math.abs(f.impact)))
          return (
            <div key={w.id} id={w.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden scroll-mt-4">
              <button
                onClick={() => setExpanded(isOpen ? null : w.id)}
                className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-800/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-amber-400 mb-0.5">{w.question}</div>
                  <div className="text-sm font-semibold text-white">{w.headline}</div>
                </div>
                <ArrowRight className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-800 pt-4">
                  {/* Factor waterfall */}
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Contributing Factors</div>
                    <div className="space-y-2">
                      {w.factors.map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-300 truncate">{f.label}</div>
                            <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full ${f.direction === 'positive' ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${(Math.abs(f.impact) / maxAbs) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className={`text-sm font-semibold tabular-nums w-24 text-right flex items-center justify-end gap-1 flex-shrink-0 ${f.direction === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {f.direction === 'positive' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {formatImpact(f.impact, w.unit)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Root cause */}
                  <div className="bg-gray-950/60 border border-gray-800 rounded p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Root Cause</div>
                    <div className="text-sm text-gray-300 leading-relaxed">{w.rootCause}</div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded p-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-amber-400 mb-1">Recommendation</div>
                      <div className="text-sm text-gray-300 leading-relaxed">{w.recommendation}</div>
                    </div>
                    <Link href={w.actionHref} className="flex-shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded transition-colors whitespace-nowrap">
                      Take action <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
