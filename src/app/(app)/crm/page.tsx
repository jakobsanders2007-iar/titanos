'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { DEMO_LEADS, type Lead, type LeadStage } from '@/lib/demo-extended'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AlertTriangle, X, Phone, Mail, Calendar } from 'lucide-react'

const STAGES: { stage: LeadStage; color: string; dot: string }[] = [
  { stage: 'New Lead', color: 'text-blue-400', dot: 'bg-blue-400' },
  { stage: 'Contacted', color: 'text-cyan-400', dot: 'bg-cyan-400' },
  { stage: 'Estimate Sent', color: 'text-purple-400', dot: 'bg-purple-400' },
  { stage: 'Follow-up Needed', color: 'text-amber-400', dot: 'bg-amber-400' },
  { stage: 'Scheduled', color: 'text-indigo-400', dot: 'bg-indigo-400' },
  { stage: 'Won', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  { stage: 'Lost', color: 'text-red-400', dot: 'bg-red-400' },
]

const SOURCE_COLORS: Record<string, string> = {
  'AI Receptionist': 'text-amber-400',
  'Google Business Profile': 'text-blue-400',
  'Referral': 'text-emerald-400',
  'Website': 'text-cyan-400',
  'Yelp': 'text-red-400',
  'Phone': 'text-gray-400',
  'Repeat': 'text-purple-400',
  'Truck Signage': 'text-orange-400',
}

export default function CRMPage() {
  const [selected, setSelected] = useState<Lead | null>(null)

  const leads = DEMO_LEADS
  const open = leads.filter(l => !['Won', 'Lost'].includes(l.stage))
  const pipelineValue = open.reduce((s, l) => s + l.estimated_value, 0)
  const wonValue = leads.filter(l => l.stage === 'Won').reduce((s, l) => s + l.estimated_value, 0)
  const now = new Date()
  const overdue = open.filter(l => l.next_followup && new Date(l.next_followup) <= now)
  const decided = leads.filter(l => ['Won', 'Lost'].includes(l.stage))
  const winRate = decided.length ? (leads.filter(l => l.stage === 'Won').length / decided.length) * 100 : 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="CRM Pipeline"
        subtitle={`${open.length} open opportunities · ${formatCurrency(pipelineValue)} in pipeline`}
        actions={
          <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
            + New Lead
          </button>
        }
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 pb-4 flex-shrink-0">
          <StatCard title="Pipeline Value" value={pipelineValue} format="currency" highlight />
          <StatCard title="Won (30d)" value={wonValue} format="currency" />
          <StatCard title="Win Rate" value={winRate} format="percent" />
          <StatCard title="Overdue Follow-ups" value={overdue.length} format="number" warning={overdue.length > 0} />
        </div>

        {overdue.length > 0 && (
          <div className="mx-6 mb-4 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="text-xs text-amber-400">
              {overdue.length} follow-up{overdue.length !== 1 ? 's' : ''} due now: {overdue.map(l => l.name).join(', ')}
            </div>
          </div>
        )}

        {/* Pipeline board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
          <div className="flex gap-3 h-full min-w-max">
            {STAGES.map(({ stage, color, dot }) => {
              const stageLeads = leads.filter(l => l.stage === stage || (stage === 'Won' && l.stage === 'Repeat Customer'))
              const stageValue = stageLeads.reduce((s, l) => s + l.estimated_value, 0)
              return (
                <div key={stage} className="w-64 flex flex-col bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${dot}`} />
                      <span className={`text-xs font-semibold ${color}`}>{stage}</span>
                      <span className="text-xs text-gray-600">{stageLeads.length}</span>
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums">{formatCurrency(stageValue)}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {stageLeads.map(lead => {
                      const isOverdue = lead.next_followup && new Date(lead.next_followup) <= now && !['Won', 'Lost'].includes(lead.stage)
                      return (
                        <button
                          key={lead.id}
                          onClick={() => setSelected(lead)}
                          className={`w-full text-left bg-gray-900 border rounded p-3 hover:border-gray-600 transition-colors ${isOverdue ? 'border-amber-500/40' : 'border-gray-800'}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="text-sm font-medium text-white truncate">{lead.name}</div>
                            <div className="text-sm font-semibold text-white tabular-nums flex-shrink-0">{formatCurrency(lead.estimated_value)}</div>
                          </div>
                          <div className="text-xs text-gray-500 truncate mb-1.5">{lead.service_need}</div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] ${SOURCE_COLORS[lead.source] || 'text-gray-500'}`}>{lead.source}</span>
                            {isOverdue && <span className="text-[10px] text-amber-400 font-medium">Follow up now</span>}
                          </div>
                        </button>
                      )
                    })}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-xs text-gray-700">No leads</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lead drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md bg-gray-950 border-l border-gray-800 h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-lg font-semibold text-white">{selected.name}</div>
                <div className="text-sm text-amber-400">{formatCurrency(selected.estimated_value)} · {selected.vertical}</div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-gray-500 mb-0.5">Stage</div><div className="text-gray-200">{selected.stage}</div></div>
                <div><div className="text-xs text-gray-500 mb-0.5">Source</div><div className={SOURCE_COLORS[selected.source] || 'text-gray-200'}>{selected.source}</div></div>
                <div><div className="text-xs text-gray-500 mb-0.5">Assigned To</div><div className="text-gray-200">{selected.assigned_to}</div></div>
                <div><div className="text-xs text-gray-500 mb-0.5">Created</div><div className="text-gray-200">{formatDate(selected.created_at)}</div></div>
              </div>

              <div><div className="text-xs text-gray-500 mb-0.5">Service Need</div><div className="text-sm text-gray-200">{selected.service_need}</div></div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-gray-400"><Phone className="w-3.5 h-3.5 text-gray-500" />{selected.phone}</div>
                <div className="flex items-center gap-2 text-gray-400"><Mail className="w-3.5 h-3.5 text-gray-500" />{selected.email}</div>
                {selected.next_followup && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    Next follow-up: {formatDate(selected.next_followup)}
                    {new Date(selected.next_followup) <= new Date() && <span className="text-amber-400 text-xs font-medium">Overdue</span>}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Notes</div>
                <div className="text-sm text-gray-300 bg-gray-900 border border-gray-800 rounded p-3">{selected.notes}</div>
              </div>

              {selected.lost_reason && (
                <div className="bg-red-500/5 border border-red-500/20 rounded p-3 text-xs text-red-400">Lost reason: {selected.lost_reason}</div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">Log Follow-up</button>
                <button className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded border border-gray-700 transition-colors">Create Quote</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
