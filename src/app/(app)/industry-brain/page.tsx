'use client'

import { Header } from '@/components/layout/header'
import { DEMO_BENCHMARKS, type Benchmark } from '@/lib/demo-intelligence'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Building2 } from 'lucide-react'

function formatValue(v: number, unit: Benchmark['unit']) {
  if (unit === 'currency') return formatCurrency(v)
  if (unit === 'percent') return `${v}%`
  return v.toLocaleString()
}

function scoreOf(b: Benchmark) {
  // 0-100 position between median (50) and top quartile (100), or below median scaled down
  const range = b.topQuartile - b.industryMedian
  if (range === 0) return 50
  const raw = ((b.yourValue - b.industryMedian) / range) * 50 + 50
  const pos = b.higherIsBetter ? raw : 100 - raw
  return Math.max(0, Math.min(100, pos))
}

export default function IndustryBrainPage() {
  const beatingMedian = DEMO_BENCHMARKS.filter(b => scoreOf(b) >= 50).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Industry Brain"
        subtitle="How your business stacks up against locksmith & field-service peers"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Beating industry median on {beatingMedian} of {DEMO_BENCHMARKS.length} metrics</div>
            <div className="text-xs text-gray-500 mt-0.5">Benchmarked against locksmith & field-service SMB peer data</div>
          </div>
        </div>

        <div className="space-y-3">
          {DEMO_BENCHMARKS.map(b => {
            const score = scoreOf(b)
            const beatsMedian = score >= 50
            return (
              <div key={b.metric} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-white">{b.metric}</div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${beatsMedian ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {beatsMedian ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {beatsMedian ? 'Above median' : 'Below median'}
                  </div>
                </div>

                <div className="relative h-2 rounded-full bg-gray-800 mb-2">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gray-700" style={{ width: '50%' }} />
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${beatsMedian ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${score}%` }}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-gray-500" style={{ left: '50%' }} />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Median: {formatValue(b.industryMedian, b.unit)}</span>
                  <span className="text-white font-semibold">You: {formatValue(b.yourValue, b.unit)}</span>
                  <span>Top quartile: {formatValue(b.topQuartile, b.unit)}</span>
                </div>

                <div className="text-xs text-gray-500 leading-relaxed">{b.note}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
