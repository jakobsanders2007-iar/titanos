'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Plug, Server, Check, ArrowRight, Brain, Sparkles } from 'lucide-react'

type Mode = 'connected' | 'native'

const SYSTEMS: { name: string; category: string }[] = [
  { name: 'Jobber', category: 'Field Service' },
  { name: 'Housecall Pro', category: 'Field Service' },
  { name: 'ServiceTitan', category: 'Field Service' },
  { name: 'FieldEdge', category: 'Field Service' },
  { name: 'Toast', category: 'POS' },
  { name: 'Square', category: 'POS' },
  { name: 'NCR', category: 'POS' },
  { name: 'QuickBooks', category: 'Accounting' },
  { name: 'Stripe', category: 'Payments' },
  { name: 'Gmail', category: 'Email' },
  { name: 'Google Calendar', category: 'Calendar' },
  { name: 'Google Drive', category: 'Documents' },
  { name: 'Excel / CSV', category: 'Spreadsheets' },
  { name: 'PDF uploads', category: 'Documents' },
  { name: 'Phone system', category: 'Calls' },
]

const NATIVE_MODULES = [
  'CRM & Customers', 'Jobs & Dispatch', 'Calendar', 'Leads & Quotes',
  'Payments & Invoices', 'Technician App', 'AI Receptionist', 'Financials',
  'Cash Verification', 'Training', 'Valuation & CEO Packet', 'AI Consultant & Shopper',
]

export default function ConnectBusinessPage() {
  const [mode, setMode] = useState<Mode>('connected')
  const [selected, setSelected] = useState<Set<string>>(new Set(['Jobber', 'QuickBooks', 'Gmail']))

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Connect Your Business"
        subtitle="Bring whatever runs your business today — Titan becomes the intelligence layer above it"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl w-full mx-auto">

        {/* Mode chooser */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => setMode('connected')}
            className={`text-left rounded-lg border p-5 transition-colors ${mode === 'connected' ? 'border-amber-500/50 bg-amber-500/5' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mode === 'connected' ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-amber-400'}`}>
                <Plug className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Connected Mode</div>
                <div className="text-[10px] text-amber-400 uppercase tracking-wide">Most popular · No migration</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Keep using Jobber, ServiceTitan, Toast, Square, QuickBooks — whatever you have.
              Titan connects, imports your history, and adds the intelligence layer on top.
            </p>
          </button>

          <button onClick={() => setMode('native')}
            className={`text-left rounded-lg border p-5 transition-colors ${mode === 'native' ? 'border-amber-500/50 bg-amber-500/5' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mode === 'native' ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-amber-400'}`}>
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Titan Native</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Full operating system</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              No software yet, or ready to switch? Titan hosts your entire operation —
              CRM, dispatch, payments, technician app, and the intelligence layer, all in one.
            </p>
          </button>
        </div>

        {mode === 'connected' ? (
          <>
            <div>
              <div className="text-sm font-semibold text-white mb-1">What runs your business today?</div>
              <div className="text-xs text-gray-500 mb-3">Select everything you use. Titan normalizes all of it into one business memory — the intelligence layer doesn&apos;t care where the data comes from.</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SYSTEMS.map(s => {
                  const on = selected.has(s.name)
                  return (
                    <button key={s.name} onClick={() => toggle(s.name)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded border text-left transition-colors ${on ? 'border-amber-500/50 bg-amber-500/5' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${on ? 'bg-amber-500' : 'bg-gray-800 border border-gray-700'}`}>
                        {on && <Check className="w-3 h-3 text-gray-950" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">{s.name}</div>
                        <div className="text-[10px] text-gray-600">{s.category}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-start gap-3">
              <Brain className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-400 leading-relaxed">
                <span className="text-white font-medium">{selected.size} systems selected. </span>
                Titan will import customers, jobs, invoices, payments, emails, and documents from each one into a single
                canonical model, then start answering: what changed, why, and what to do next. Live OAuth flows come with
                each connector&apos;s integration — today this configures your demo workspace.
              </div>
            </div>
          </>
        ) : (
          <div>
            <div className="text-sm font-semibold text-white mb-1">Everything included in Titan Native</div>
            <div className="text-xs text-gray-500 mb-3">Internally, Native is just another connector — the intelligence layer treats it exactly like Jobber or Toast.</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {NATIVE_MODULES.map(m => (
                <div key={m} className="flex items-center gap-2 px-3 py-2.5 rounded border border-gray-800 bg-gray-900">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-gray-300">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link href={mode === 'connected' ? '/connectors' : '/command'}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold rounded-lg transition-colors">
            <Sparkles className="w-4 h-4" />
            {mode === 'connected' ? `Connect ${selected.size} systems` : 'Launch Titan Native'}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-xs text-gray-600">Demo workspace is pre-connected — explore either path.</span>
        </div>
      </div>
    </div>
  )
}
