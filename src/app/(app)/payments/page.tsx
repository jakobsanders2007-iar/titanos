'use client'

import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { DEMO_JOBS, DEMO_CUSTOMERS } from '@/lib/demo-data'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const customerMap = Object.fromEntries(DEMO_CUSTOMERS.map(c => [c.id, c]))

const allJobs = DEMO_JOBS
const paid = allJobs.filter(j => j.payment_status === 'Paid')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pending = allJobs.filter(j => j.payment_status === 'Unpaid' && (j.status as any) === 'Completed')
const cashPending = allJobs.filter(j => j.payment_status === 'Cash Pending Verification')
const linkSent = allJobs.filter(j => j.payment_status === 'Payment Link Sent')

const totalCollected = allJobs.reduce((s, j) => s + (j.amount_collected || 0), 0)
const totalOutstanding = allJobs.filter(j => !['Cancelled', 'No Show'].includes(j.status))
  .reduce((s, j) => s + Math.max(0, (j.final_price || j.estimated_price || 0) - (j.amount_collected || 0)), 0)

const byMethod: Record<string, { amount: number; count: number }> = {}
allJobs.forEach(j => {
  if (j.payment_method && j.amount_collected > 0) {
    if (!byMethod[j.payment_method]) byMethod[j.payment_method] = { amount: 0, count: 0 }
    byMethod[j.payment_method].amount += j.amount_collected
    byMethod[j.payment_method].count++
  }
})
const methodData = Object.entries(byMethod).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.amount - a.amount)
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

const recentPaid = [...allJobs]
  .filter(j => j.amount_collected > 0)
  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  .slice(0, 15)

export default function PaymentsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Payments" subtitle="Payment collection overview" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Collected" value={totalCollected} format="currency" highlight />
          <StatCard title="Outstanding Balance" value={totalOutstanding} format="currency" warning={totalOutstanding > 0} />
          <StatCard title="Cash Pending Verification" value={cashPending.reduce((s, j) => s + j.amount_collected, 0)} format="currency" warning />
          <StatCard
            title="Payment Link Conversion"
            value={allJobs.filter(j => j.payment_link_sent).length
              ? ((allJobs.filter(j => j.payment_link_sent && j.payment_status === 'Paid').length / allJobs.filter(j => j.payment_link_sent).length) * 100)
              : 0}
            format="percent"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Method breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">By Payment Method</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={methodData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="amount" paddingAngle={2}>
                  {methodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 4, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {methodData.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-400">{m.name}</span>
                    <span className="text-xs text-gray-600">{m.count} jobs</span>
                  </div>
                  <span className="text-xs text-white font-medium tabular-nums">{formatCurrency(m.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status summary */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Payment Status Summary</div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Paid', count: paid.length, amount: paid.reduce((s, j) => s + j.amount_collected, 0), color: 'emerald' },
                { label: 'Cash Pending', count: cashPending.length, amount: cashPending.reduce((s, j) => s + j.amount_collected, 0), color: 'amber' },
                { label: 'Link Sent', count: linkSent.length, amount: linkSent.reduce((s, j) => s + (j.final_price || j.estimated_price), 0), color: 'blue' },
                { label: 'Unpaid', count: pending.length, amount: pending.reduce((s, j) => s + (j.final_price || j.estimated_price), 0), color: 'red' },
              ].map(stat => (
                <div key={stat.label} className={`bg-${stat.color}-500/5 border border-${stat.color}-500/20 rounded p-3`}>
                  <div className={`text-xs text-${stat.color}-400 mb-1`}>{stat.label}</div>
                  <div className="text-xl font-semibold text-white tabular-nums">{formatCurrency(stat.amount)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.count} jobs</div>
                </div>
              ))}
            </div>

            {/* Payment link stats */}
            <div className="border-t border-gray-800 pt-3">
              <div className="text-xs text-gray-500 mb-2">Payment Link Performance</div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-gray-500">Links Sent</div>
                  <div className="text-lg font-semibold text-white">{allJobs.filter(j => j.payment_link_sent).length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Converted</div>
                  <div className="text-lg font-semibold text-emerald-400">{allJobs.filter(j => j.payment_link_sent && j.payment_status === 'Paid').length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Pending</div>
                  <div className="text-lg font-semibold text-amber-400">{allJobs.filter(j => j.payment_link_sent && j.payment_status === 'Payment Link Sent').length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="text-sm font-medium text-white">Recent Payments</div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Job', 'Customer', 'Service', 'Method', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPaid.map(job => {
                const customer = customerMap[job.customer_id]
                return (
                  <tr key={job.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{job.id.replace('job-', '#')}</td>
                    <td className="px-4 py-3 text-white font-medium">{customer?.name}</td>
                    <td className="px-4 py-3 text-gray-400">{job.service_type}</td>
                    <td className="px-4 py-3 text-gray-300">{job.payment_method || '—'}</td>
                    <td className="px-4 py-3 text-white font-semibold tabular-nums">{formatCurrency(job.amount_collected)}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.payment_status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(job.updated_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
