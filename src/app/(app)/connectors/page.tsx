'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { DEMO_CONNECTORS, type Connector, type ConnectorCategory } from '@/lib/demo-intelligence'
import { formatDateTime } from '@/lib/utils'
import { Plug, CheckCircle2, Loader2, Circle, X, RefreshCw } from 'lucide-react'

const CATEGORIES: ConnectorCategory[] = ['Field Service & CRM', 'Point of Sale', 'Accounting & Payments', 'Calendar & Email', 'Documents & Filings']

const STATUS_STYLE: Record<Connector['status'], { label: string; color: string; icon: React.ElementType }> = {
  connected: { label: 'Connected', color: 'text-emerald-400', icon: CheckCircle2 },
  syncing: { label: 'Syncing', color: 'text-amber-400', icon: Loader2 },
  available: { label: 'Not Connected', color: 'text-gray-500', icon: Circle },
}

export default function ConnectorsPage() {
  const [connectors] = useState<Connector[]>(DEMO_CONNECTORS)
  const [modalConnector, setModalConnector] = useState<Connector | null>(null)

  const connectedCount = connectors.filter(c => c.status === 'connected').length
  const syncingCount = connectors.filter(c => c.status === 'syncing').length
  const totalRecords = connectors.reduce((s, c) => s + c.recordsSynced, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Connectors"
        subtitle="The Connect Brain — every system your business already runs on, in one place"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Connected" value={connectedCount} format="number" highlight subtitle={`of ${connectors.length} available`} />
          <StatCard title="Syncing" value={syncingCount} format="number" />
          <StatCard title="Records Synced" value={totalRecords} format="number" />
          <StatCard title="Categories" value={CATEGORIES.length} format="number" />
        </div>

        {CATEGORIES.map(category => {
          const items = connectors.filter(c => c.category === category)
          return (
            <div key={category}>
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">{category}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map(c => {
                  const style = STATUS_STYLE[c.status]
                  const StatusIcon = style.icon
                  return (
                    <div key={c.id} className={`bg-gray-900 border rounded-lg p-4 ${c.status === 'connected' ? 'border-emerald-500/20' : 'border-gray-800'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <Plug className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium ${style.color}`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${c.status === 'syncing' ? 'animate-spin' : ''}`} />
                          {style.label}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-white mb-1">{c.name}</div>
                      <div className="text-xs text-gray-500 leading-relaxed mb-3">{c.description}</div>
                      {c.status !== 'available' ? (
                        <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-800">
                          <span>{c.recordsSynced.toLocaleString()} records</span>
                          <span>{c.lastSynced ? formatDateTime(c.lastSynced) : '—'}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setModalConnector(c)}
                          className="w-full text-xs px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold transition-colors"
                        >
                          Connect
                        </button>
                      )}
                      {c.status === 'connected' && (
                        <button className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors">
                          <RefreshCw className="w-3 h-3" />Sync now
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {modalConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalConnector(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-gray-950 border border-gray-800 rounded-lg max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div className="text-base font-semibold text-white">Connect {modalConnector.name}</div>
              <button onClick={() => setModalConnector(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Live {modalConnector.name} integration is coming soon. When connected, Titan will automatically read {modalConnector.description.toLowerCase()}
            </p>
            <button onClick={() => setModalConnector(null)} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded border border-gray-700 transition-colors">
              Request early access
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
