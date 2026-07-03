'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { DEMO_RISK_RADAR, type RiskCategory } from '@/lib/demo-ops'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShieldAlert, AlertTriangle, ArrowRight, Radar } from 'lucide-react'

const SEVERITY_META = {
  critical: { label: 'Critical', text: 'text-red-400', chip: 'bg-red-500/10 text-red-400 border-red-500/30', border: 'border-red-500/30' },
  high: { label: 'High', text: 'text-amber-400', chip: 'bg-amber-500/10 text-amber-400 border-amber-500/30', border: 'border-amber-500/20' },
  medium: { label: 'Medium', text: 'text-blue-400', chip: 'bg-blue-500/10 text-blue-400 border-blue-500/30', border: 'border-gray-800' },
} as const

const GROUPS: { label: string; categories: RiskCategory[] }[] = [
  { label: 'Money', categories: ['Cash', 'Payments', 'Margin', 'Pricing'] },
  { label: 'Pipeline', categories: ['Calls', 'Follow-ups', 'Quotes', 'Customers'] },
  { label: 'Operations', categories: ['Dispatch', 'People', 'Inventory'] },
  { label: 'Enterprise', categories: ['Owner', 'Valuation', 'Reputation', 'Documents', 'Vendor', 'Market'] },
]

export default function RiskRadarPage() {
  const [severity, setSeverity] = useState<'all' | 'critical' | 'high' | 'medium'>('all')

  const risks = DEMO_RISK_RADAR.filter(r => severity === 'all' || r.severity === severity)
  const totalExposure = DEMO_RISK_RADAR.reduce((s, r) => s + (r.exposure ?? 0), 0)
  const criticalCount = DEMO_RISK_RADAR.filter(r => r.severity === 'critical').length
  const highCount = DEMO_RISK_RADAR.filter(r => r.severity === 'high').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Risk Radar"
        subtitle="Every risk Titan is watching — money, pipeline, operations, and enterprise value"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Active Risks" value={DEMO_RISK_RADAR.length} format="number" />
          <StatCard title="Critical" value={criticalCount} format="number" warning={criticalCount > 0} />
          <StatCard title="High" value={highCount} format="number" />
          <StatCard title="Dollar Exposure" value={totalExposure} format="currency" warning />
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'critical', 'high', 'medium'] as const).map(s => (
            <button key={s} onClick={() => setSeverity(s)}
              className={`px-3 py-1.5 text-xs rounded border capitalize transition-colors ${severity === s ? 'bg-gray-800 text-white border-gray-700' : 'text-gray-500 border-gray-800 hover:text-gray-300'}`}>
              {s}
            </button>
          ))}
        </div>

        {GROUPS.map(group => {
          const items = risks.filter(r => group.categories.includes(r.category))
          if (items.length === 0) return null
          return (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-3">
                <Radar className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">{group.label}</span>
                <span className="text-xs text-gray-600">{items.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(r => {
                  const meta = SEVERITY_META[r.severity]
                  return (
                    <Link key={r.id} href={r.href} className={`block bg-gray-900 border rounded-lg p-4 hover:border-gray-600 transition-colors ${meta.border}`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${meta.chip}`}>{meta.label}</span>
                          <span className="text-[10px] text-gray-600 uppercase tracking-wide">{r.category}</span>
                        </div>
                        {r.exposure ? <span className={`text-sm font-semibold tabular-nums ${meta.text}`}>{formatCurrency(r.exposure)}</span> : null}
                      </div>
                      <div className="text-sm font-semibold text-white mb-1">{r.title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed mb-2">{r.detail}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-600">Detected {formatDate(r.detectedAt)}</span>
                        <span className="text-xs text-amber-400 flex items-center gap-1">Resolve <ArrowRight className="w-3 h-3" /></span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}

        {risks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <ShieldAlert className="w-8 h-8 mb-2" />
            <div>No risks at this severity</div>
          </div>
        )}

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-400 leading-relaxed">
            <span className="text-amber-400 font-medium">How Risk Radar works: </span>
            Titan continuously scans jobs, payments, calls, quotes, technician behavior, documents, market research, and valuation drivers.
            Anything that threatens cash, growth, or enterprise value surfaces here before it becomes a problem you find out about at month-end.
          </div>
        </div>
      </div>
    </div>
  )
}
