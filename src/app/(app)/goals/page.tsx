'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { DEMO_GOALS, type Goal, type GoalType } from '@/lib/demo-intelligence'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Target, CheckCircle2, Circle, AlertTriangle, ListChecks, Calendar, X, Plus,
} from 'lucide-react'

function formatGoalValue(value: number, unit: Goal['unit'], suffix?: string) {
  if (unit === 'currency') return formatCurrency(value)
  if (unit === 'percent') return `${value}%`
  return `${value}${suffix ?? ''}`
}

const GOAL_TYPES: GoalType[] = ['Revenue', 'EBITDA', 'Valuation', 'Expansion', 'Cash Flow', 'Owner Freedom', 'Hiring']

export default function GoalsPage() {
  const [goals] = useState<Goal[]>(DEMO_GOALS)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNewGoal, setShowNewGoal] = useState(false)

  const avgProgress = Math.round(goals.reduce((s, g) => s + Math.min(1, g.current / g.target), 0) / goals.length * 100)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Goals"
        subtitle="The Goal Brain — set the target, Titan builds the milestones, KPIs, risks, and weekly actions"
        actions={
          <button onClick={() => setShowNewGoal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
            <Plus className="w-3.5 h-3.5" />New Goal
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white mb-1">{goals.length} active goals · {avgProgress}% average progress</div>
            <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${avgProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100))
            const isOpen = expanded === g.id
            return (
              <div key={g.id} className="bg-gray-900 border border-gray-800 rounded-lg">
                <button onClick={() => setExpanded(isOpen ? null : g.id)} className="w-full text-left p-4 hover:bg-gray-800/20 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">{g.type}</span>
                    <span className="text-xs text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(g.targetDate)}</span>
                  </div>
                  <div className="text-sm font-semibold text-white mb-2">{g.title}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{formatGoalValue(g.current, g.unit, g.suffix)}</span>
                    <span>{formatGoalValue(g.target, g.unit, g.suffix)} target</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800 overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">{g.latestImpact}</div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1.5 flex items-center gap-1"><ListChecks className="w-3 h-3" />Milestones</div>
                      <div className="space-y-1">
                        {g.milestones.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            {m.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />}
                            <span className={m.done ? 'text-gray-500 line-through' : 'text-gray-300'}>{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1.5">KPIs to Track</div>
                        <ul className="space-y-1">
                          {g.kpis.map(k => <li key={k} className="text-xs text-gray-400">· {k}</li>)}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" />Risks</div>
                        <ul className="space-y-1">
                          {g.risks.map(r => <li key={r} className="text-xs text-amber-400/80">· {r}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1.5">This Week&apos;s Actions</div>
                      <ul className="space-y-1">
                        {g.weeklyActions.map(a => <li key={a} className="text-xs text-gray-300 flex items-start gap-1.5"><span className="text-amber-400">→</span>{a}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {showNewGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNewGoal(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-gray-950 border border-gray-800 rounded-lg max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="text-base font-semibold text-white">Set a new goal</div>
              <button onClick={() => setShowNewGoal(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Goal type</label>
                <select className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 focus:outline-none">
                  {GOAL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Target value</label>
                <input type="text" placeholder="e.g. $75,000/month" className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Target date</label>
                <input type="date" className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 focus:outline-none" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-4">Titan will break this into milestones, KPIs, risks, and weekly actions automatically.</p>
            <button onClick={() => setShowNewGoal(false)} className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold rounded transition-colors">
              Create Goal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
