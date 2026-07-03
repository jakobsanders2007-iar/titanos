import Link from 'next/link'
import {
  Brain, ArrowRight, HelpCircle, Target, ListChecks, Plug, CheckCircle2,
  Radio, ShieldCheck, TrendingUp, Server, Activity, Sparkles,
} from 'lucide-react'

const SOURCE_SYSTEMS = [
  'Jobber', 'ServiceTitan', 'Housecall Pro', 'FieldEdge', 'QuickBooks', 'Toast',
  'Square', 'Gmail', 'Stripe', 'Calendar', 'PDFs', 'Calls', 'Spreadsheets', 'Reviews',
]

const brains = [
  { icon: Plug, title: 'Connect Brain', desc: 'Maps every system — CRM, POS, accounting, email, calls, documents — into one canonical business model.' },
  { icon: Brain, title: 'Memory Brain', desc: 'Builds long-term business memory: every customer, job, decision, document, and mistake. 100 years of context if the data exists.' },
  { icon: HelpCircle, title: 'Why Brain', desc: 'Explains cause and effect. Never just "what happened" — always why revenue dropped, why margin compressed, why 2022 beat 2023.' },
  { icon: Target, title: 'Goal Brain', desc: 'Turns "$100k/month" into milestones, KPIs, weekly actions, daily alerts, and a progress tracker.' },
  { icon: ListChecks, title: 'Action Brain', desc: 'Converts analysis into moves: call these customers, raise this price, verify this cash, coach this employee.' },
  { icon: Radio, title: 'Execution Brain', desc: 'Helps employees do the work — job copilots, checklists, pricing guidance, closeout enforcement.' },
  { icon: Activity, title: 'Market Brain', desc: 'Reads the outside world: competitors, vendors, 10-Ks, reviews, local pricing, and market risk.' },
]

const verticals = ['Titan for Locksmiths', 'Titan for HVAC', 'Titan for Restaurants', 'Titan for Barbers', 'Titan for Home Services', 'Titan Native']

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
          <Link href="/connect-business" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold rounded transition-colors">
            Connect Your Business
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          The business intelligence operating layer
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Your business already has the answers.<br />
          <span className="text-amber-400">They&apos;re trapped across 17 systems.</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Titan connects your CRM, POS, accounting, calls, emails, documents, payments, calendar, and history —
          then tells you what happened, why it happened, and what to do next.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/connect-business" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-lg transition-colors">
            Connect Your Business <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/connect-business" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold rounded-lg border border-gray-700 transition-colors">
            <Server className="w-4 h-4" />Run on Titan Native
          </Link>
        </div>
      </section>

      {/* Data-flow visual: systems → memory → answers */}
      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-6">
            {/* Sources */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-3 text-center md:text-left">Everything you already use</div>
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                {SOURCE_SYSTEMS.map(s => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400">{s}</span>
                ))}
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-amber-500/60 mx-auto rotate-90 md:rotate-0" />

            {/* Memory core */}
            <div className="text-center">
              <div className="inline-flex flex-col items-center gap-2 bg-gray-950 border border-amber-500/30 rounded-xl px-8 py-6">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-gray-950" />
                </div>
                <div className="text-sm font-bold text-white">Titan Business Memory</div>
                <div className="text-[10px] text-gray-500">One canonical model · every event remembered</div>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-amber-500/60 mx-auto rotate-90 md:rotate-0" />

            {/* Answers */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-1 text-center md:text-left">Titan answers</div>
              {['What changed?', 'Why did it happen?', 'What should we do next?'].map(q => (
                <div key={q} className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-sm text-gray-200">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Two modes */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">Bring your own operating stack — or run on ours</h2>
          <p className="text-sm text-gray-500 mt-2">The intelligence layer doesn&apos;t care where the data comes from.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-amber-500/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Plug className="w-5 h-5 text-amber-400" />
              <div className="text-lg font-semibold text-white">Connected Mode</div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Keep Jobber, ServiceTitan, Housecall Pro, FieldEdge, Toast, Square, QuickBooks, Gmail — everything.
              Titan connects, imports, normalizes, and adds intelligence. No migration required.
            </p>
            <div className="space-y-2">
              {['No rip-and-replace', 'History imported into Business Memory', 'Intelligence on day one'].map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />{p}</div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-amber-400" />
              <div className="text-lg font-semibold text-white">Titan Native</div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              No software yet, or ready to switch? Titan hosts the whole operating system — CRM, dispatch, payments,
              technician app, AI receptionist, financials, valuation — with the same intelligence layer above it.
            </p>
            <div className="space-y-2">
              {['Full operating system included', 'Treated internally as just another connector', 'One vendor, one brain'].map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />{p}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seven brains */}
      <section className="bg-gray-900/30 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">Seven brains, one operating layer</h2>
            <p className="text-sm text-gray-500 mt-2">Not a dashboard. The intelligence layer above the entire business.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {brains.map(f => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <f.icon className="w-5 h-5 text-amber-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1.5">{f.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-5 flex flex-col justify-center">
              <div className="text-sm font-semibold text-amber-400 mb-1.5">The moat</div>
              <div className="text-xs text-gray-400 leading-relaxed">Business Memory compounds. Every connected system, every document, every decision makes Titan smarter about <em>your</em> business.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Verticals */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Launching locksmiths first. HVAC next. Then everything.</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {verticals.map((v, i) => (
            <span key={v} className={`text-sm px-4 py-2 rounded-full border ${i < 2 ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-gray-800 bg-gray-900 text-gray-500'}`}>
              {v}{i === 0 && ' · live'}{i === 1 && ' · next'}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          {[
            { icon: Radio, title: 'Live Ops Feed', desc: '8:42 AM — AI booked emergency lockout. 9:44 AM — $240 collected. 9:46 AM — cash verification required. The company\'s nervous system, minute by minute.' },
            { icon: ShieldCheck, title: 'Closeout Enforcement', desc: 'No job closes without payment, notes, photos, and cash verification. This is how leakage stops.' },
            { icon: TrendingUp, title: 'Valuation, live', desc: 'Every clean job, every verified dollar, every reduced risk moves the number a buyer would pay. Watch it daily.' },
          ].map(f => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <f.icon className="w-5 h-5 text-amber-400 mb-3" />
              <div className="text-sm font-semibold text-white mb-1.5">{f.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Stop flying blind.</h2>
        <p className="text-gray-500 mb-6 text-sm">The demo is pre-loaded with a real locksmith operating company — connected systems, live ops, memory, goals, and a valuation that moves.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/connect-business" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-lg transition-colors">
            Connect Your Business <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/command" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold rounded-lg border border-gray-700 transition-colors">
            Explore the demo
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-amber-500 rounded flex items-center justify-center">
              <Brain className="w-3 h-3 text-gray-950" />
            </div>
            <span className="text-xs text-gray-500">Titan Intelligence OS</span>
          </div>
          <div className="text-xs text-gray-600">Bring whatever runs your business. Titan becomes the brain above it.</div>
        </div>
      </footer>
    </div>
  )
}
