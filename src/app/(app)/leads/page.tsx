'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { DEMO_LEADS } from '@/lib/demo-extended'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Filter } from 'lucide-react'

const STAGE_STYLES: Record<string, string> = {
  'New Lead': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Contacted': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Estimate Sent': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Follow-up Needed': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Scheduled': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Won': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Lost': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Repeat Customer': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const ALL_STAGES = ['All', 'New Lead', 'Contacted', 'Estimate Sent', 'Follow-up Needed', 'Scheduled', 'Won', 'Lost', 'Repeat Customer']
const ALL_SOURCES = ['All', 'AI Receptionist', 'Phone', 'Website', 'Google Business Profile', 'Yelp', 'Referral', 'Repeat', 'Truck Signage']

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')

  const leads = DEMO_LEADS

  // Source analytics
  const bySource: Record<string, { count: number; value: number; won: number }> = {}
  leads.forEach(l => {
    if (!bySource[l.source]) bySource[l.source] = { count: 0, value: 0, won: 0 }
    bySource[l.source].count++
    bySource[l.source].value += l.estimated_value
    if (l.stage === 'Won' || l.stage === 'Repeat Customer') bySource[l.source].won++
  })
  const sourceRows = Object.entries(bySource).sort((a, b) => b[1].value - a[1].value)

  const filtered = leads.filter(l => {
    if (stageFilter !== 'All' && l.stage !== stageFilter) return false
    if (sourceFilter !== 'All' && l.source !== sourceFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return l.name.toLowerCase().includes(q) || l.service_need.toLowerCase().includes(q)
    }
    return true
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const openValue = leads.filter(l => !['Won', 'Lost'].includes(l.stage)).reduce((s, l) => s + l.estimated_value, 0)
  const aiLeads = leads.filter(l => l.source === 'AI Receptionist').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Leads"
        subtitle={`${leads.length} leads · ${formatCurrency(openValue)} open value`}
        actions={
          <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
            + New Lead
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 pb-0 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Leads" value={leads.length} format="number" />
          <StatCard title="Open Pipeline" value={openValue} format="currency" highlight />
          <StatCard title="From AI Receptionist" value={aiLeads} format="number" subtitle={`${Math.round((aiLeads / leads.length) * 100)}% of all leads`} />
          <StatCard title="Sources Active" value={sourceRows.length} format="number" />
        </div>

        {/* Source analytics */}
        <div className="p-6 pb-0">
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-800 text-sm font-medium text-white">Lead Sources</div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-800">
              {sourceRows.slice(0, 4).map(([source, d]) => (
                <div key={source} className="p-3">
                  <div className="text-xs text-gray-500 mb-1">{source}</div>
                  <div className="text-lg font-semibold text-white tabular-nums">{formatCurrency(d.value)}</div>
                  <div className="text-xs text-gray-500">{d.count} leads · {d.won} won</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters + table */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
              />
            </div>
            <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-xs text-gray-300 focus:outline-none">
              {ALL_STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-xs text-gray-300 focus:outline-none">
              {ALL_SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Lead', 'Service Need', 'Source', 'Stage', 'Est. Value', 'Assigned', 'Next Follow-up', 'Created'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const isOverdue = l.next_followup && new Date(l.next_followup) <= new Date() && !['Won', 'Lost'].includes(l.stage)
                  return (
                    <tr key={l.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{l.name}</div>
                        <div className="text-xs text-gray-500">{l.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 max-w-56 truncate">{l.service_need}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{l.source}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${STAGE_STYLES[l.stage]}`}>{l.stage}</span>
                      </td>
                      <td className="px-4 py-3 text-white font-semibold tabular-nums">{formatCurrency(l.estimated_value)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{l.assigned_to}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {l.next_followup ? (
                          <span className={isOverdue ? 'text-amber-400 font-medium' : 'text-gray-400'}>
                            {formatDate(l.next_followup)}{isOverdue && ' · due'}
                          </span>
                        ) : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(l.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                <Filter className="w-8 h-8 mb-2" />
                <div>No leads match your filters</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
