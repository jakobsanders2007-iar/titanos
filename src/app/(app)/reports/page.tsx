'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { DEMO_JOBS, DEMO_TECHNICIANS, DEMO_CUSTOMERS } from '@/lib/demo-data'
import { DEMO_LEADS, DEMO_QUOTES, DEMO_AI_CALLS, DEMO_SHOPPER_ITEMS } from '@/lib/demo-extended'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, Users, Wrench, CreditCard, ShieldCheck, KanbanSquare, PhoneCall, ShoppingCart, Download } from 'lucide-react'

const RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days'] as const

export default function ReportsPage() {
  const [range, setRange] = useState<typeof RANGES[number]>('Last 30 days')
  const days = range === 'Last 7 days' ? 7 : range === 'Last 30 days' ? 30 : 90

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const jobs = DEMO_JOBS.filter(j => new Date(j.scheduled_start) >= cutoff)
  const completed = jobs.filter(j => j.status === 'Completed' && j.final_price)
  const revenue = completed.reduce((s, j) => s + (j.final_price || 0), 0)
  const collected = jobs.reduce((s, j) => s + (j.amount_collected || 0), 0)
  const cashPending = jobs.filter(j => j.cash_verification_status === 'pending')
  const linksSent = jobs.filter(j => j.payment_link_sent).length
  const linksPaid = jobs.filter(j => j.payment_link_sent && j.payment_status === 'Paid').length

  // Revenue by service
  const byService: Record<string, { revenue: number; count: number }> = {}
  completed.forEach(j => {
    if (!byService[j.service_type]) byService[j.service_type] = { revenue: 0, count: 0 }
    byService[j.service_type].revenue += j.final_price || 0
    byService[j.service_type].count++
  })
  const serviceRows = Object.entries(byService).sort((a, b) => b[1].revenue - a[1].revenue)

  // Technician report
  const techRows = DEMO_TECHNICIANS.map(t => {
    const tJobs = completed.filter(j => j.technician_id === t.id)
    const rev = tJobs.reduce((s, j) => s + (j.final_price || 0), 0)
    const cash = jobs.filter(j => j.technician_id === t.id && j.payment_method === 'Cash').reduce((s, j) => s + (j.amount_collected || 0), 0)
    const pendingCash = jobs.filter(j => j.technician_id === t.id && j.cash_verification_status === 'pending').reduce((s, j) => s + (j.amount_collected || 0), 0)
    return { name: t.name, jobs: tJobs.length, revenue: rev, avg: tJobs.length ? rev / tJobs.length : 0, cash, pendingCash }
  }).sort((a, b) => b.revenue - a.revenue)

  // CRM report
  const leadsWon = DEMO_LEADS.filter(l => l.stage === 'Won' || l.stage === 'Repeat Customer')
  const openQuotes = DEMO_QUOTES.filter(q => ['Draft', 'Sent', 'Viewed'].includes(q.status))

  // AI receptionist report
  const aiBooked = DEMO_AI_CALLS.filter(c => c.job_created)
  const aiRevenue = aiBooked.reduce((s, c) => s + (c.quoted_estimate || 0), 0)
  const missedRecovered = DEMO_AI_CALLS.filter(c => c.outcome === 'Missed — Recovered').length

  // Shopper report
  const cartValue = DEMO_SHOPPER_ITEMS.filter(i => i.in_cart).reduce((s, i) => s + i.price * i.qty, 0)
  const restockCount = DEMO_SHOPPER_ITEMS.filter(i => i.urgency === 'Restock Now').length

  const reports = [
    {
      icon: BarChart3, title: 'Revenue Report',
      rows: [
        ['Gross revenue (completed)', formatCurrency(revenue)],
        ['Jobs completed', String(completed.length)],
        ['Average ticket', formatCurrency(completed.length ? revenue / completed.length : 0)],
        ['Total collected', formatCurrency(collected)],
      ],
    },
    {
      icon: Wrench, title: 'Technician Report',
      rows: techRows.map(t => [t.name, `${formatCurrency(t.revenue)} · ${t.jobs} jobs · avg ${formatCurrency(t.avg)}`] as [string, string]),
    },
    {
      icon: Users, title: 'Service Type Report',
      rows: serviceRows.slice(0, 6).map(([name, d]) => [name, `${formatCurrency(d.revenue)} · ${d.count} jobs`] as [string, string]),
    },
    {
      icon: CreditCard, title: 'Payment Report',
      rows: [
        ['Payment links sent', String(linksSent)],
        ['Links converted', `${linksPaid} (${linksSent ? Math.round((linksPaid / linksSent) * 100) : 0}%)`],
        ['Cash collected', formatCurrency(jobs.filter(j => j.payment_method === 'Cash').reduce((s, j) => s + (j.amount_collected || 0), 0))],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['Unpaid completed jobs', String(jobs.filter(j => j.status === 'Completed' && (j.payment_status as any) === 'Unpaid').length)],
      ],
    },
    {
      icon: ShieldCheck, title: 'Cash Verification Report',
      rows: [
        ['Cash jobs pending verification', String(cashPending.length)],
        ['Unverified cash amount', formatCurrency(cashPending.reduce((s, j) => s + (j.amount_collected || 0), 0))],
        ...techRows.filter(t => t.pendingCash > 0).map(t => [`${t.name} — unverified`, formatCurrency(t.pendingCash)] as [string, string]),
      ],
    },
    {
      icon: KanbanSquare, title: 'CRM Report',
      rows: [
        ['Total leads', String(DEMO_LEADS.length)],
        ['Leads won', String(leadsWon.length)],
        ['Open pipeline value', formatCurrency(DEMO_LEADS.filter(l => !['Won', 'Lost'].includes(l.stage)).reduce((s, l) => s + l.estimated_value, 0))],
        ['Open quotes', `${openQuotes.length} · ${formatCurrency(openQuotes.reduce((s, q) => s + q.amount, 0))}`],
      ],
    },
    {
      icon: PhoneCall, title: 'AI Receptionist Report',
      rows: [
        ['Calls handled', String(DEMO_AI_CALLS.length)],
        ['Jobs booked by AI', String(aiBooked.length)],
        ['Revenue booked by AI', formatCurrency(aiRevenue)],
        ['Missed calls recovered', String(missedRecovered)],
      ],
    },
    {
      icon: ShoppingCart, title: 'Purchasing Report',
      rows: [
        ['Active recommendations', String(DEMO_SHOPPER_ITEMS.length)],
        ['Restock-now items', String(restockCount)],
        ['Approved cart value', formatCurrency(cartValue)],
      ],
    },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Reports"
        subtitle="Operating reports across every layer of the business"
        actions={
          <div className="flex items-center gap-2">
            <select value={range} onChange={e => setRange(e.target.value as typeof RANGES[number])} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-xs text-gray-300 focus:outline-none">
              {RANGES.map(r => <option key={r}>{r}</option>)}
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded border border-gray-700 transition-colors">
              <Download className="w-3.5 h-3.5" />Export
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(report => {
            const Icon = report.icon
            return (
              <div key={report.title} className="bg-gray-900 border border-gray-800 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-amber-400" />
                  <div className="text-sm font-semibold text-white">{report.title}</div>
                </div>
                <div className="px-4 py-2">
                  {report.rows.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-600">No data in range</div>
                  ) : report.rows.map(([label, value], i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <span className="text-sm text-gray-400">{label}</span>
                      <span className="text-sm font-medium text-white tabular-nums text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="text-xs text-gray-600 text-center mt-6">Report data reflects the {range.toLowerCase()} window where applicable · {DEMO_CUSTOMERS.length} customers on file</div>
      </div>
    </div>
  )
}
