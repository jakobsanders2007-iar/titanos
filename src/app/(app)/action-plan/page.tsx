'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { DEMO_ACTIONS, type ActionItem, type ActionCategory, type ActionStatus } from '@/lib/demo-intelligence'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  CheckCircle2, Circle, Loader2, ListChecks, Users, Package,
  DollarSign, Tag, Wrench, FileText, ShieldAlert, Phone,
} from 'lucide-react'

const CATEGORY_META: Record<ActionCategory, { icon: React.ElementType; color: string }> = {
  Sales: { icon: Phone, color: 'text-emerald-400' },
  CRM: { icon: Users, color: 'text-cyan-400' },
  Pricing: { icon: Tag, color: 'text-purple-400' },
  Cost: { icon: DollarSign, color: 'text-blue-400' },
  Inventory: { icon: Package, color: 'text-amber-400' },
  People: { icon: Users, color: 'text-indigo-400' },
  Ops: { icon: Wrench, color: 'text-teal-400' },
  Docs: { icon: FileText, color: 'text-gray-400' },
  Risk: { icon: ShieldAlert, color: 'text-red-400' },
}

const CATEGORIES: (ActionCategory | 'All')[] = ['All', 'Sales', 'CRM', 'Pricing', 'Cost', 'Inventory', 'People', 'Ops', 'Docs', 'Risk']
const EFFORT_STYLE: Record<ActionItem['effort'], string> = { Low: 'text-emerald-400', Medium: 'text-amber-400', High: 'text-red-400' }

export default function ActionPlanPage() {
  const [actions, setActions] = useState<ActionItem[]>(DEMO_ACTIONS)
  const [category, setCategory] = useState<ActionCategory | 'All'>('All')

  const cycleStatus = (id: string) => {
    const order: ActionStatus[] = ['To Do', 'In Progress', 'Done']
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: order[(order.indexOf(a.status) + 1) % order.length] } : a))
  }

  const filtered = actions
    .filter(a => category === 'All' || a.category === category)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'Done' ? 1 : b.status === 'Done' ? -1 : 0
      return (b.impact ?? 0) - (a.impact ?? 0)
    })

  const openCount = actions.filter(a => a.status !== 'Done').length
  const totalImpact = actions.filter(a => a.status !== 'Done').reduce((s, a) => s + (a.impact ?? 0), 0)
  const doneCount = actions.filter(a => a.status === 'Done').length
  const inProgress = actions.filter(a => a.status === 'In Progress').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Action Plan"
        subtitle="The Action Brain — every analysis converted into a specific, ownable next step"
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-6 pb-0 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Open Actions" value={openCount} format="number" />
          <StatCard title="Estimated Impact" value={totalImpact} format="currency" highlight />
          <StatCard title="In Progress" value={inProgress} format="number" />
          <StatCard title="Completed" value={doneCount} format="number" />
        </div>

        <div className="flex items-center gap-1.5 px-6 py-3 flex-shrink-0 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${category === c ? 'bg-gray-800 text-white border-gray-700' : 'text-gray-500 border-gray-800 hover:text-gray-300'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
            {filtered.map(a => {
              const meta = CATEGORY_META[a.category]
              const Icon = meta.icon
              return (
                <div key={a.id} className={`flex items-center gap-3 px-4 py-3 ${a.status === 'Done' ? 'opacity-50' : ''}`}>
                  <button onClick={() => cycleStatus(a.id)} className="flex-shrink-0">
                    {a.status === 'Done' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : a.status === 'In Progress' ? <Loader2 className="w-5 h-5 text-amber-400" />
                      : <Circle className="w-5 h-5 text-gray-600" />}
                  </button>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${meta.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-medium ${a.status === 'Done' ? 'text-gray-500 line-through' : 'text-white'}`}>{a.title}</div>
                    <div className="text-xs text-gray-500 truncate">{a.rationale}</div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                    <span className={`text-xs font-medium ${EFFORT_STYLE[a.effort]}`}>{a.effort} effort</span>
                    <span className="text-xs text-gray-500">{a.owner}</span>
                    <span className="text-xs text-gray-600">{formatDate(a.dueDate)}</span>
                  </div>
                  {a.impact ? (
                    <div className="text-sm font-semibold text-emerald-400 tabular-nums flex-shrink-0 w-20 text-right">{formatCurrency(a.impact)}</div>
                  ) : <div className="w-20 flex-shrink-0" />}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                <ListChecks className="w-8 h-8 mb-2" />
                <div>No actions in this category</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
