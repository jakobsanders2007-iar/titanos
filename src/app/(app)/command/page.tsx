'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/header'
import {
  WHAT_CHANGED, MISSED_RISKS, DEMO_WHY, DEMO_ACTIONS, DEMO_GOALS,
  DEMO_CONNECTORS, DEMO_MEMORY,
} from '@/lib/demo-intelligence'
import { formatCurrency } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Target, Sparkles,
  Plug, Brain, HelpCircle, ListChecks, MessageSquare, ShieldAlert,
} from 'lucide-react'

const QUESTIONS = [
  { n: 1, label: 'What changed?', icon: TrendingUp },
  { n: 2, label: 'Why did it change?', icon: HelpCircle },
  { n: 3, label: 'What should I do?', icon: ListChecks },
  { n: 4, label: 'How does this affect my goal?', icon: Target },
  { n: 5, label: 'What risk am I missing?', icon: ShieldAlert },
]

export default function CommandCenterPage() {
  const topActions = DEMO_ACTIONS
    .filter(a => a.status !== 'Done')
    .sort((a, b) => (b.impact ?? 0) - (a.impact ?? 0))
    .slice(0, 4)

  const topWhy = DEMO_WHY.slice(0, 3)
  const urgentGoals = [...DEMO_GOALS].sort((a, b) => (a.current / a.target) - (b.current / b.target)).slice(0, 3)

  const connectedCount = DEMO_CONNECTORS.filter(c => c.status === 'connected').length
  const openActionsCount = DEMO_ACTIONS.filter(a => a.status !== 'Done').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Command Center"
        subtitle="Your AI CFO, COO, analyst, and consultant — sitting above the entire business"
        actions={
          <Link href="/executive-chat" className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />Ask Titan anything
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Jump nav for the 5 questions */}
        <div className="flex items-center gap-2 flex-wrap">
          {QUESTIONS.map(q => (
            <a key={q.n} href={`#q${q.n}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-800 bg-gray-900 text-xs text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
              <span className="w-4 h-4 rounded-full bg-gray-800 text-[10px] flex items-center justify-center text-gray-500">{q.n}</span>
              {q.label}
            </a>
          ))}
        </div>

        {/* Five Brains status strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <BrainCard href="/connectors" icon={Plug} label="Connect Brain" value={`${connectedCount}/${DEMO_CONNECTORS.length}`} sub="systems connected" />
          <BrainCard href="/memory" icon={Brain} label="Memory Brain" value={String(DEMO_MEMORY.length)} sub="events remembered" />
          <BrainCard href="/why" icon={HelpCircle} label="Why Brain" value={String(DEMO_WHY.length)} sub="live analyses" />
          <BrainCard href="/goals" icon={Target} label="Goal Brain" value={String(DEMO_GOALS.length)} sub="active goals" />
          <BrainCard href="/action-plan" icon={ListChecks} label="Action Brain" value={String(openActionsCount)} sub="open actions" />
        </div>

        {/* Q1: What changed? */}
        <Section id="q1" n={1} title="What changed?" icon={TrendingUp}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {WHAT_CHANGED.map(m => (
              <Link key={m.label} href={`/why#${m.whyId}`} className="block bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors">
                <div className="text-xs text-gray-500 mb-1.5">{m.label}</div>
                <div className="text-lg font-semibold text-white tabular-nums mb-1">{m.value}</div>
                <div className={`flex items-center gap-1 text-xs font-medium ${m.good ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {m.delta}
                </div>
              </Link>
            ))}
          </div>
        </Section>

        {/* Q2: Why did it change? */}
        <Section id="q2" n={2} title="Why did it change?" icon={HelpCircle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topWhy.map(w => (
              <Link key={w.id} href={`/why#${w.id}`} className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                <div className="text-xs text-amber-400 mb-1.5">{w.question}</div>
                <div className="text-sm text-white font-medium mb-2 leading-snug">{w.headline}</div>
                <div className="text-xs text-gray-500 leading-relaxed line-clamp-3">{w.rootCause}</div>
                <div className="flex items-center gap-1 text-xs text-amber-400 mt-2">Full breakdown <ArrowRight className="w-3 h-3" /></div>
              </Link>
            ))}
          </div>
        </Section>

        {/* Q3: What should I do? */}
        <Section id="q3" n={3} title="What should I do?" icon={ListChecks}>
          <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
            {topActions.map(a => (
              <Link key={a.id} href="/action-plan" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/40 transition-colors">
                <span className="text-xs px-2 py-0.5 rounded border border-gray-700 bg-gray-800 text-gray-400 flex-shrink-0">{a.category}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white font-medium truncate">{a.title}</div>
                  <div className="text-xs text-gray-500 truncate">{a.rationale}</div>
                </div>
                {a.impact ? <div className="text-sm font-semibold text-emerald-400 tabular-nums flex-shrink-0">{formatCurrency(a.impact)}</div> : null}
                <ArrowRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </Section>

        {/* Q4: How does this affect my goal? */}
        <Section id="q4" n={4} title="How does this affect my goal?" icon={Target}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {urgentGoals.map(g => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100))
              return (
                <Link key={g.id} href="/goals" className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                  <div className="text-xs text-gray-500 mb-1">{g.type}</div>
                  <div className="text-sm text-white font-medium mb-2 leading-snug">{g.title}</div>
                  <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden mb-1.5">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{pct}% of the way there</div>
                  <div className="text-xs text-gray-400 leading-relaxed line-clamp-3">{g.latestImpact}</div>
                </Link>
              )
            })}
          </div>
        </Section>

        {/* Q5: What risk am I missing? */}
        <Section id="q5" n={5} title="What risk am I missing?" icon={ShieldAlert}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MISSED_RISKS.map(r => (
              <Link key={r.title} href={r.href} className={`block rounded-lg border p-4 hover:opacity-90 transition-opacity ${
                r.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${r.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                  <div>
                    <div className={`text-sm font-semibold mb-1 ${r.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>{r.title}</div>
                    <div className="text-xs text-gray-400 leading-relaxed">{r.detail}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        {/* Ask Titan footer */}
        <Link href="/executive-chat" className="block bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg p-5 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Ask Titan anything about your business</div>
              <div className="text-xs text-gray-500">&quot;Why is cash tight?&quot; · &quot;Am I on track for my revenue goal?&quot; · &quot;What should I do this week?&quot;</div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
        </Link>
      </div>
    </div>
  )
}

function BrainCard({ href, icon: Icon, label, value, sub }: { href: string; icon: React.ElementType; label: string; value: string; sub: string }) {
  return (
    <Link href={href} className="block bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide mb-2">
        <Icon className="w-3.5 h-3.5 text-amber-400" />{label}
      </div>
      <div className="text-xl font-semibold text-white tabular-nums">{value}</div>
      <div className="text-xs text-gray-600 mt-0.5">{sub}</div>
    </Link>
  )
}

function Section({ id, n, title, icon: Icon, children }: { id: string; n: number; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-xs font-bold flex items-center justify-center flex-shrink-0">{n}</span>
        <Icon className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      {children}
    </div>
  )
}
