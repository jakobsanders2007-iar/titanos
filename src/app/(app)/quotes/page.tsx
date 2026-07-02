'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { DEMO_QUOTES } from '@/lib/demo-extended'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileSignature } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  'Draft': 'bg-gray-800 text-gray-400 border-gray-700',
  'Sent': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Viewed': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Accepted': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Declined': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Expired': 'bg-gray-800 text-gray-600 border-gray-700',
}

const TABS = ['All', 'Open', 'Accepted', 'Declined/Expired'] as const

export default function QuotesPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('All')

  const quotes = DEMO_QUOTES
  const open = quotes.filter(q => ['Draft', 'Sent', 'Viewed'].includes(q.status))
  const accepted = quotes.filter(q => q.status === 'Accepted')
  const openValue = open.reduce((s, q) => s + q.amount, 0)
  const acceptedValue = accepted.reduce((s, q) => s + q.amount, 0)
  const decided = quotes.filter(q => ['Accepted', 'Declined'].includes(q.status))
  const acceptRate = decided.length ? (accepted.length / decided.length) * 100 : 0

  const visible = quotes.filter(q => {
    if (tab === 'Open') return ['Draft', 'Sent', 'Viewed'].includes(q.status)
    if (tab === 'Accepted') return q.status === 'Accepted'
    if (tab === 'Declined/Expired') return ['Declined', 'Expired'].includes(q.status)
    return true
  }).sort((a, b) => b.amount - a.amount)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Quotes"
        subtitle={`${open.length} open quotes worth ${formatCurrency(openValue)}`}
        actions={
          <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
            + New Quote
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Open Quote Value" value={openValue} format="currency" highlight />
          <StatCard title="Accepted (30d)" value={acceptedValue} format="currency" />
          <StatCard title="Accept Rate" value={acceptRate} format="percent" />
          <StatCard title="Awaiting Response" value={quotes.filter(q => ['Sent', 'Viewed'].includes(q.status)).length} format="number" />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <div className="flex rounded overflow-hidden border border-gray-800">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs transition-colors ${tab === t ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{t}</button>
              ))}
            </div>
            <div className="text-xs text-gray-500">{visible.length} quotes</div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Customer / Lead', 'Service', 'Vertical', 'Amount', 'Status', 'Sent', 'Decided', 'Notes'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(q => (
                <tr key={q.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{q.lead_name}</td>
                  <td className="px-4 py-3 text-gray-300 max-w-64 truncate">{q.service}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{q.vertical}</td>
                  <td className="px-4 py-3 text-white font-semibold tabular-nums">{formatCurrency(q.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_STYLES[q.status]}`}>{q.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{q.sent_at ? formatDate(q.sent_at) : '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{q.decided_at ? formatDate(q.decided_at) : '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-56 truncate">{q.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <FileSignature className="w-8 h-8 mb-2" />
              <div>No quotes in this view</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
