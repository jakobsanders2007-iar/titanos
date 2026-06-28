import Link from 'next/link'
import { Lock, ArrowRight, Radio, CreditCard, ShieldCheck, BarChart3, FileText, TrendingUp, Bot, CheckCircle2 } from 'lucide-react'

const features = [
  { icon: Radio, title: 'Dispatch Board', desc: 'Real-time job routing to every technician. Know who is where, what they are doing, and what is next.' },
  { icon: CreditCard, title: 'Payment Capture', desc: 'Send payment links before the tech arrives. Track cash, card, Zelle, and Venmo — every dollar accounted for.' },
  { icon: ShieldCheck, title: 'Cash Verification', desc: 'Every cash job is flagged for owner review. No more technicians pocketing the difference.' },
  { icon: BarChart3, title: 'Financial Dashboard', desc: 'Gross revenue, EBITDA, payment breakdown, and job profitability — all live, no spreadsheets.' },
  { icon: FileText, title: 'CEO Packet', desc: 'Auto-generated monthly business summary with revenue, performance, risk, and recommended actions.' },
  { icon: TrendingUp, title: 'Business Valuation', desc: 'See what your business is worth today and track how every improvement increases the number.' },
  { icon: Bot, title: 'AI Consultant', desc: 'Data-driven insights that tell you exactly where you are leaving money on the table.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <Lock className="w-4 h-4 text-gray-950" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">Titan</div>
              <div className="text-gray-500 text-xs leading-none mt-0.5">Locksmith OS</div>
            </div>
          </div>
          <Link href="/dashboard" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold rounded transition-colors">
            Launch Demo
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Built for locksmith businesses
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Run your locksmith business like<br />
          <span className="text-amber-400">a company that can actually sell.</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Titan turns every call, job, technician, payment, cash collection, and expense into a clean operating system — with financials, valuation, and AI consulting built in.
        </p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-lg transition-colors">
          Launch Demo <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[['$180K+', 'Avg annual revenue tracked'], ['40+', 'Jobs per company per month'], ['3.5×', 'Avg EBITDA valuation multiple'], ['100%', 'Job-level visibility']].map(([v, l]) => (
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
            <h2 className="text-2xl font-bold text-white mb-4">Most locksmith companies are running blind</h2>
            <div className="space-y-3">
              {['Calls come in manually with no record', 'Jobs get scheduled through phone/text', 'Technicians collect cash you never see', 'QuickBooks only sees part of the truth', 'No real-time profit visibility', 'No idea what your business is worth'].map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">The Fix</div>
            <h2 className="text-2xl font-bold text-white mb-4">Titan captures operational truth first</h2>
            <div className="space-y-3">
              {['Every call becomes a job record instantly', 'Dispatching is centralized and visible', 'Cash is tracked, flagged, and verified by owner', 'Revenue flows through Titan before QuickBooks', 'Live P&L and EBITDA — no month-end surprise', 'Real-time business valuation updates daily'].map(p => (
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
            <h2 className="text-2xl font-bold text-white">Every module your business needs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <f.icon className="w-5 h-5 text-amber-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1.5">{f.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">See the full demo — no setup required</h2>
        <p className="text-gray-500 mb-6 text-sm">Pre-loaded with a real locksmith company, 4 technicians, 40 jobs, and real financial data.</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-lg transition-colors">
          Launch Demo <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-amber-500 rounded flex items-center justify-center">
              <Lock className="w-3 h-3 text-gray-950" />
            </div>
            <span className="text-xs text-gray-500">Titan Locksmith OS</span>
          </div>
          <div className="text-xs text-gray-600">Built for locksmith operators.</div>
        </div>
      </footer>
    </div>
  )
}
