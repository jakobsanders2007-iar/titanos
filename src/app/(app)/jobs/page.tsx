'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatusBadge } from '@/components/ui/status-badge'
import { getJobs } from '@/lib/actions/jobs'
import { getTechnicians } from '@/lib/actions/technicians'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Search, Filter, Plus, Loader2 } from 'lucide-react'
import type { Technician } from '@/types/database'

type JobRow = {
  id: string
  status: string
  payment_status: string | null
  technician_id: string | null
  service_type: string
  scheduled_start: string | null
  estimated_price: number | null
  final_price: number | null
  source: string | null
  customer?: { id: string; name: string; phone: string | null } | null
  technician?: { id: string; name: string } | null
}

const ALL_STATUSES = ['All', 'New Lead', 'Scheduled', 'Assigned', 'En Route', 'In Progress', 'Completed', 'Cancelled', 'No Show']
const ALL_PAYMENT = ['All', 'Paid', 'Unpaid', 'Payment Link Sent', 'Cash Pending Verification']

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [techFilter, setTechFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([getJobs(), getTechnicians()])
      .then(([j, t]) => { setJobs(j as JobRow[]); setTechnicians(t) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = jobs.filter(j => {
    if (statusFilter !== 'All' && j.status !== statusFilter) return false
    if (paymentFilter !== 'All' && j.payment_status !== paymentFilter) return false
    if (techFilter !== 'All' && j.technician_id !== techFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        j.customer?.name?.toLowerCase().includes(q) ||
        j.service_type.toLowerCase().includes(q) ||
        j.id.toLowerCase().includes(q)
      )
    }
    return true
  }).sort((a, b) => new Date(b.scheduled_start ?? '').getTime() - new Date(a.scheduled_start ?? '').getTime())

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Jobs"
        subtitle={loading ? 'Loading...' : `${filtered.length} jobs`}
        actions={
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New Job
          </button>
        }
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-800 flex-shrink-0 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search jobs, customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-xs text-gray-300 focus:outline-none">
            {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-xs text-gray-300 focus:outline-none">
            {ALL_PAYMENT.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={techFilter} onChange={e => setTechFilter(e.target.value)} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-xs text-gray-300 focus:outline-none">
            <option value="All">All Technicians</option>
            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-24 text-red-400 text-sm">{error}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-950 border-b border-gray-800">
                <tr>
                  {['Job ID', 'Customer', 'Service', 'Technician', 'Scheduled', 'Status', 'Est.', 'Final', 'Payment', 'Source'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(job => (
                  <tr key={job.id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{job.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{job.customer?.name}</div>
                      <div className="text-xs text-gray-500">{job.customer?.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{job.service_type}</td>
                    <td className="px-4 py-3 text-gray-300">{job.technician?.name?.split(' ')[0] || <span className="text-gray-600">—</span>}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{formatDateTime(job.scheduled_start ?? '')}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-4 py-3 text-gray-400 tabular-nums">{job.estimated_price ? formatCurrency(job.estimated_price) : '—'}</td>
                    <td className="px-4 py-3 text-white font-medium tabular-nums">
                      {job.final_price ? formatCurrency(job.final_price) : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={job.payment_status ?? ''} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{job.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-600">
              <Filter className="w-8 h-8 mb-2" />
              <div>{jobs.length === 0 ? 'No jobs yet' : 'No jobs match your filters'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
