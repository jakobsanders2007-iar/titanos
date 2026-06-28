'use client'

import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { DEMO_JOBS, DEMO_TECHNICIANS, DEMO_CUSTOMERS } from '@/lib/demo-data'
import { formatCurrency, formatTime } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { AlertTriangle, CheckCircle2, Clock, DollarSign, Link2, TrendingUp } from 'lucide-react'

const today = new Date()
const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0)
const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay()); startOfWeek.setHours(0, 0, 0, 0)
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

const completedJobs = DEMO_JOBS.filter(j => j.status === 'Completed' && j.final_price)
const todayJobs = completedJobs.filter(j => new Date(j.scheduled_start) >= startOfDay)
const weekJobs = completedJobs.filter(j => new Date(j.scheduled_start) >= startOfWeek)
const monthJobs = completedJobs.filter(j => new Date(j.scheduled_start) >= startOfMonth)

const revenueToday = todayJobs.reduce((s, j) => s + (j.final_price || 0), 0)
const revenueWeek = weekJobs.reduce((s, j) => s + (j.final_price || 0), 0)
const revenueMonth = monthJobs.reduce((s, j) => s + (j.final_price || 0), 0)
const avgTicket = completedJobs.length ? completedJobs.reduce((s, j) => s + (j.final_price || 0), 0) / completedJobs.length : 0

const cashPendingJobs = DEMO_JOBS.filter(j => j.cash_verification_status === 'pending')
const cashPendingAmount = cashPendingJobs.reduce((s, j) => s + (j.amount_collected || 0), 0)

const paymentLinksSent = DEMO_JOBS.filter(j => j.payment_link_sent).length
const paymentLinksConverted = DEMO_JOBS.filter(j => j.payment_link_sent && j.payment_status === 'Paid').length
const linkConversion = paymentLinksSent ? ((paymentLinksConverted / paymentLinksSent) * 100) : 0

const scheduledToday = DEMO_JOBS.filter(j => {
  const d = new Date(j.scheduled_start)
  return d >= startOfDay && ['Scheduled', 'Assigned', 'En Route', 'In Progress', 'Arrived'].includes(j.status)
}).length

// Technician leaderboard
const techRevenue = DEMO_TECHNICIANS.map(tech => {
  const techJobs = completedJobs.filter(j => j.technician_id === tech.id)
  return {
    name: tech.name.split(' ')[0],
    revenue: techJobs.reduce((s, j) => s + (j.final_price || 0), 0),
    jobs: techJobs.length,
    avgTicket: techJobs.length ? techJobs.reduce((s, j) => s + (j.final_price || 0), 0) / techJobs.length : 0,
  }
}).sort((a, b) => b.revenue - a.revenue)

// Revenue by service type
const serviceRevenue: Record<string, number> = {}
completedJobs.forEach(j => {
  serviceRevenue[j.service_type] = (serviceRevenue[j.service_type] || 0) + (j.final_price || 0)
})
const serviceData = Object.entries(serviceRevenue)
  .map(([name, revenue]) => ({ name: name.replace(' ', '\n'), revenue }))
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 7)

// Payment method breakdown
const methodRevenue: Record<string, number> = {}
completedJobs.forEach(j => {
  if (j.payment_method && j.amount_collected) {
    methodRevenue[j.payment_method] = (methodRevenue[j.payment_method] || 0) + j.amount_collected
  }
})
const methodData = Object.entries(methodRevenue).map(([name, value]) => ({ name, value }))
const METHOD_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

const recentJobs = [...DEMO_JOBS]
  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  .slice(0, 6)

const customerMap = Object.fromEntries(DEMO_CUSTOMERS.map(c => [c.id, c]))
const techMap = Object.fromEntries(DEMO_TECHNICIANS.map(t => [t.id, t]))

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs">
        <p className="text-gray-400">{label}</p>
        <p className="text-white font-semibold">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Dashboard"
        subtitle={`Good morning — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Revenue Today" value={revenueToday} format="currency" highlight />
          <StatCard title="Revenue This Week" value={revenueWeek} format="currency" />
          <StatCard title="Revenue This Month" value={revenueMonth} format="currency" />
          <StatCard title="Avg Ticket" value={avgTicket} format="currency" subtitle="all time" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Jobs Completed" value={completedJobs.length} format="number" />
          <StatCard title="Jobs Today" value={scheduledToday} format="number" subtitle="active" />
          <StatCard
            title="Cash Pending Verification"
            value={formatCurrency(cashPendingAmount)}
            warning={cashPendingAmount > 0}
            subtitle={`${cashPendingJobs.length} jobs`}
          />
          <StatCard
            title="Payment Link Conversion"
            value={linkConversion}
            format="percent"
            subtitle={`${paymentLinksConverted}/${paymentLinksSent} converted`}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue by service */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Revenue by Service Type</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment method */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Revenue by Payment Method</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={methodData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {methodData.map((_, i) => <Cell key={i} fill={METHOD_COLORS[i % METHOD_COLORS.length]} />)}
                </Pie>
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-xs text-gray-400">{v}</span>} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 4, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard + Recent jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Technician leaderboard */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Technician Leaderboard</div>
            <div className="space-y-3">
              {techRevenue.map((t, i) => (
                <div key={t.name} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-400'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.jobs} jobs · avg {formatCurrency(t.avgTicket)}</div>
                  </div>
                  <div className="text-sm font-semibold text-white tabular-nums">{formatCurrency(t.revenue)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent jobs */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Recent Activity</div>
            <div className="space-y-2">
              {recentJobs.map(job => {
                const customer = customerMap[job.customer_id]
                const tech = job.technician_id ? techMap[job.technician_id] : null
                return (
                  <div key={job.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium truncate">{customer?.name}</span>
                        <StatusBadge status={job.status} />
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {job.service_type} · {tech?.name.split(' ')[0] || 'Unassigned'} · {formatTime(job.scheduled_start)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {job.final_price ? (
                        <div className="text-sm font-semibold text-white">{formatCurrency(job.final_price)}</div>
                      ) : job.estimated_price ? (
                        <div className="text-sm text-gray-500">{formatCurrency(job.estimated_price)} est</div>
                      ) : null}
                      <StatusBadge status={job.payment_status} className="mt-1" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Alerts row */}
        {cashPendingJobs.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-amber-400">{cashPendingJobs.length} cash jobs pending owner verification</div>
              <div className="text-xs text-amber-400/60 mt-0.5">
                {formatCurrency(cashPendingAmount)} total unverified cash. Review in Cash Verification.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
