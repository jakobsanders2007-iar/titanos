'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { getJobs } from '@/lib/actions/jobs'
import { getExpenses } from '@/lib/actions/expenses'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { Loader2 } from 'lucide-react'
import type { Expense } from '@/types/database'

type JobRow = {
  id: string
  status: string
  final_price: number | null
  parts_cost: number | null
  payment_method: string | null
  amount_collected: number | null
  scheduled_start: string | null
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} className="text-white">{p.name}: {p.name !== 'jobs' ? formatCurrency(p.value) : p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function FinancialsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getJobs(), getExpenses()])
      .then(([j, e]) => { setJobs(j as JobRow[]); setExpenses(e) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const completedJobs = jobs.filter(j => j.status === 'Completed' && j.final_price)
  const grossRevenue = completedJobs.reduce((s, j) => s + (j.final_price || 0), 0)
  const totalPartsCollected = completedJobs.reduce((s, j) => s + (j.parts_cost || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const ebitda = grossRevenue - totalExpenses - totalPartsCollected
  const ebitdaMargin = grossRevenue ? (ebitda / grossRevenue) * 100 : 0

  const cashCollected = jobs.filter(j => j.payment_method === 'Cash').reduce((s, j) => s + (j.amount_collected || 0), 0)
  const cardCollected = jobs.filter(j => j.payment_method === 'Card').reduce((s, j) => s + (j.amount_collected || 0), 0)
  const linkCollected = jobs.filter(j => j.payment_method === 'Payment Link').reduce((s, j) => s + (j.amount_collected || 0), 0)
  const otherCollected = jobs.filter(j => !['Cash', 'Card', 'Payment Link'].includes(j.payment_method || '')).reduce((s, j) => s + (j.amount_collected || 0), 0)

  const now = new Date()
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekEnd = new Date(now)
    weekEnd.setDate(now.getDate() - i * 7)
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekEnd.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)
    weekEnd.setHours(23, 59, 59, 999)
    const wJobs = completedJobs.filter(j => {
      const d = new Date(j.scheduled_start ?? '')
      return d >= weekStart && d <= weekEnd
    })
    const revenue = wJobs.reduce((s, j) => s + (j.final_price || 0), 0)
    return { week: `W${4 - i}`, revenue, jobs: wJobs.length, avgTicket: wJobs.length ? revenue / wJobs.length : 0 }
  }).reverse()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Financials" subtitle="Revenue, expenses, and profit tracking" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Gross Revenue" value={grossRevenue} format="currency" highlight />
              <StatCard title="Total Expenses" value={totalExpenses} format="currency" />
              <StatCard title="EBITDA Estimate" value={ebitda} format="currency" highlight={ebitda > 0} warning={ebitda < 0} />
              <StatCard title="EBITDA Margin" value={ebitdaMargin} format="percent" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Cash Collected" value={cashCollected} format="currency" />
              <StatCard title="Card Collected" value={cardCollected} format="currency" />
              <StatCard title="Payment Links" value={linkCollected} format="currency" />
              <StatCard title="Other (Zelle/Venmo/Check)" value={otherCollected} format="currency" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Weekly Revenue Trend</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Avg Ticket by Week</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={v => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="avgTicket" name="Avg Ticket" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-800">
                  <div className="text-sm font-medium text-white">Monthly Expenses</div>
                  <div className="text-xs text-gray-500">Total: {formatCurrency(totalExpenses)}</div>
                </div>
                {expenses.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 text-sm">No expenses recorded</div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {expenses.map(exp => (
                      <div key={exp.id} className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white">{exp.category}</div>
                          <div className="text-xs text-gray-500">{exp.notes}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white tabular-nums">{formatCurrency(exp.amount)}</div>
                          {exp.recurring && <div className="text-xs text-blue-400">Recurring</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-sm font-medium text-white mb-4">P&L Summary</div>
                <div className="space-y-3">
                  {[
                    { label: 'Gross Revenue', value: grossRevenue, color: 'text-white' },
                    { label: 'Parts & Materials Cost', value: -totalPartsCollected, color: 'text-red-400' },
                    { label: '─── Gross Profit', value: grossRevenue - totalPartsCollected, color: 'text-emerald-400', bold: true },
                    { label: 'Total Operating Expenses', value: -totalExpenses, color: 'text-red-400' },
                    { label: '─── EBITDA Estimate', value: ebitda, color: ebitda > 0 ? 'text-emerald-400' : 'text-red-400', bold: true },
                    { label: 'EBITDA Margin', value: ebitdaMargin, color: 'text-gray-300', isPercent: true },
                    { label: 'Annualized Revenue (×12)', value: grossRevenue * 12, color: 'text-amber-400', bold: true },
                    { label: 'Annualized EBITDA (×12)', value: ebitda * 12, color: 'text-amber-400' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between py-1 ${item.bold ? 'border-t border-gray-800 pt-2' : ''}`}>
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <span className={`text-sm font-medium tabular-nums ${item.color} ${item.bold ? 'font-semibold text-base' : ''}`}>
                        {item.isPercent ? `${item.value.toFixed(1)}%` : formatCurrency(Math.abs(item.value))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
