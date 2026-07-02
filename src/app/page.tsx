import Link from 'next/link'
import {
  Brain, ArrowRight, HelpCircle, Target, ListChecks, Plug, CheckCircle2,
  Radio, ShieldCheck, TrendingUp,
} from 'lucide-react'

const brains = [
  { icon: Plug, title: 'Connect Brain', desc: 'Connects to the CRM, POS, accounting, payments, calendar, email, and documents your business already uses.' },
  { icon: Brain, title: 'Memory Brain', desc: 'Remembers every goal, decision, document, and KPI moment — a searchable timeline of your entire business.' },
  { icon: HelpCircle, title: 'Why Brain', desc: 'Explains why revenue dropped, why margin compressed, why cash is tight, why valuation changed — with root causes, not just charts.' },
  { icon: Target, title: 'Goal Brain', desc: 'Set a revenue, EBITDA, valuation, or freedom goal. Titan breaks it into milestones, KPIs, risks, and weekly actions.' },
  { icon: ListChecks, title: 'Action Brain', desc: 'Converts every analysis into a specific action — call this customer, raise this price, order this part, coach this employee.' },
]

const verticalFeatures = [
  { icon: Radio, title: 'Dispatch & Field Ops', desc: 'The Field Service Brain — real-time dispatch, job routing, and a guided cockpit for every job from call to closeout.' },
  { icon: ShieldCheck, title: 'Cash Verification', desc: 'Every cash job flagged for owner review. No more technicians pocketing the difference.' },
  { icon: TrendingUp, title: 'Business Valuation', desc: 'See what your business is worth today and track how every improvement increases the number.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <Brain className="w-4 h-4 text-gray-950" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">Titan</div>
              <div className="text-gray-500 text-xs leading-none mt-0.5">Intelligence OS</div>
            </div>
          </div>
          <Link href="/command" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold rounded transition-colors">
            Launch Demo
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          The AI CFO, COO, analyst, and consultant for your business
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Stop flying blind.<br />
          <span className="text-amber-400">Titan tells you what happened, why, and what to do next.</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Titan connects every system you already use, reads every document, remembers your history, and explains the &quot;why&quot; behind every number — then converts it into your next action.
        </p>
        <Link href="/command" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-lg transition-colors">
          Launch Demo <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[['13', 'Connected systems supported'], ['5', 'Brains reasoning over your business'], ['$612K', 'Sample live valuation estimate'], ['100%', 'Job-to-goal visibility']].map(([v, l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{v}</div>
              <div className="text-sm text-gray-500 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">The Problem</div>
            <h2 className="text-2xl font-bold text-white mb-4">Most owners are running blind</h2>
            <div className="space-y-3">
              {['Every system speaks its own language — CRM, POS, accounting, none of it talks', 'Nobody can explain why revenue or margin moved', 'Goals live in your head, not in the business', 'Analysis happens after the damage is done', 'No idea what the business is actually worth'].map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">The Fix</div>
            <h2 className="text-2xl font-bold text-white mb-4">Titan reasons across the whole business</h2>
            <div className="space-y-3">
              {['One operating layer connects every system you run on', 'Every metric change comes with a root-cause explanation', 'Goals break into milestones, KPIs, risks, and weekly actions', 'Analysis converts straight into a specific next action', 'Valuation updates live as the business changes'].map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900/30 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">Five brains, one operating layer</h2>
            <p className="text-sm text-gray-500 mt-2">Not a dashboard. An intelligence layer that sits above every system you run.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {brains.map(f => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <f.icon className="w-5 h-5 text-amber-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1.5">{f.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">Vertical brains, built in</h2>
          <p className="text-sm text-gray-500 mt-2">Titan ships with a Field Service Brain today — locksmith first, HVAC-ready next.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {verticalFeatures.map(f => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <f.icon className="w-5 h-5 text-amber-400 mb-3" />
              <div className="text-sm font-semibold text-white mb-1.5">{f.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">See the full demo — no setup required</h2>
        <p className="text-gray-500 mb-6 text-sm">Pre-loaded with a real locksmith operating company, connected systems, goals, and a live business timeline.</p>
        <Link href="/command" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-lg transition-colors">
          Launch Demo <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-amber-500 rounded flex items-center justify-center">
              <Brain className="w-3 h-3 text-gray-950" />
            </div>
            <span className="text-xs text-gray-500">Titan Intelligence OS</span>
          </div>
          <div className="text-xs text-gray-600">The operating layer above your entire business.</div>
        </div>
      </footer>
    </div>
  )
}
