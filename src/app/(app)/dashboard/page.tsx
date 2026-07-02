'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { getJobs } from '@/lib/actions/jobs'
import { getTechnicians } from '@/lib/actions/technicians'
import { formatCurrency, formatTime } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { AlertTriangle, Loader2, PhoneCall, KanbanSquare, TrendingUp, ShoppingCart, ArrowRight, Bot } from 'lucide-react'
import Link from 'next/link'
import { DEMO_AI_CALLS, DEMO_LEADS, DEMO_RECOMMENDATIONS } from '@/lib/demo-extended'
import type { Job, Technician } from '@/types/database'

type JobWithRelations = Job & {
  customer?: { id: string; name: string; phone: string | null } | null
  technician?: { id: string; name: string; phone: string | null } | null
}

const METHOD_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

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
  const [jobs, setJobs] = useState<JobWithRelations[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getJobs(), getTechnicians()])
      .then(([j, t]) => { setJobs(j as JobWithRelations[]); setTechnicians(t) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Header title="Dashboard" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Header title="Dashboard" subtitle="" />
        <div className="flex-1 flex items-center justify-center text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  const today = new Date()
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0)
  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay()); startOfWeek.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const completedJobs = jobs.filter(j => j.status === 'Completed' && j.final_price)
  const todayJobs = completedJobs.filter(j => new Date(j.scheduled_start ?? '') >= startOfDay)
  const weekJobs = completedJobs.filter(j => new Date(j.scheduled_start ?? '') >= startOfWeek)
  const monthJobs = completedJobs.filter(j => new Date(j.scheduled_start ?? '') >= startOfMonth)

  const revenueToday = todayJobs.reduce((s, j) => s + (j.final_price || 0), 0)
  const revenueWeek = weekJobs.reduce((s, j) => s + (j.final_price || 0), 0)
  const revenueMonth = monthJobs.reduce((s, j) => s + (j.final_price || 0), 0)
  const avgTicket = completedJobs.length ? completedJobs.reduce((s, j) => s + (j.final_price || 0), 0) / completedJobs.length : 0

  const cashPendingJobs = jobs.filter(j => j.cash_verification_status === 'pending')
  const cashPendingAmount = cashPendingJobs.reduce((s, j) => s + (j.amount_collected || 0), 0)

  const paymentLinksSent = jobs.filter(j => j.payment_link_sent).length
  const paymentLinksConverted = jobs.filter(j => j.payment_link_sent && j.payment_status === 'Paid').length
  const linkConversion = paymentLinksSent ? ((paymentLinksConverted / paymentLinksSent) * 100) : 0

  const scheduledToday = jobs.filter(j => {
    const d = new Date(j.scheduled_start ?? '')
    return d >= startOfDay && ['Scheduled', 'Assigned', 'En Route', 'In Progress', 'Arrived'].includes(j.status)
  }).length

  const techRevenue = technicians.map(tech => {
    const techJobs = completedJobs.filter(j => j.technician_id === tech.id)
    return {
      name: tech.name.split(' ')[0],
      revenue: techJobs.reduce((s, j) => s + (j.final_price || 0), 0),
      jobs: techJobs.length,
      avgTicket: techJobs.length ? techJobs.reduce((s, j) => s + (j.final_price || 0), 0) / techJobs.length : 0,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const serviceRevenue: Record<string, number> = {}
  completedJobs.forEach(j => {
    serviceRevenue[j.service_type] = (serviceRevenue[j.service_type] || 0) + (j.final_price || 0)
  })
  const serviceData = Object.entries(serviceRevenue)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7)

  const methodRevenue: Record<string, number> = {}
  completedJobs.forEach(j => {
    if (j.payment_method && j.amount_collected) {
      methodRevenue[j.payment_method] = (methodRevenue[j.payment_method] || 0) + j.amount_collected
    }
  })
  const methodData = Object.entries(methodRevenue).map(([name, value]) => ({ name, value }))

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.updated_at ?? '').getTime() - new Date(a.updated_at ?? '').getTime())
    .slice(0, 6)

  // Sales & AI layers (seeded demo signals)
  const aiBooked = DEMO_AI_CALLS.filter(c => c.job_created)
  const aiRevenue = aiBooked.reduce((s, c) => s + (c.quoted_estimate || 0), 0)
  const missedRecovered = DEMO_AI_CALLS.filter(c => c.outcome === 'Missed — Recovered').length
  const pipelineValue = DEMO_LEADS.filter(l => !['Won', 'Lost'].includes(l.stage)).reduce((s, l) => s + l.estimated_value, 0)
  const overdueFollowups = DEMO_LEADS.filter(l => l.next_followup && new Date(l.next_followup) <= new Date() && !['Won', 'Lost'].includes(l.stage)).length
  const monthlyEbitdaProxy = revenueMonth * 0.32
  const valuationBase = Math.round(monthlyEbitdaProxy * 12 * 3)

  const REC_STYLES: Record<string, string> = {
    critical: 'border-red-500/30 bg-red-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    opportunity: 'border-blue-500/30 bg-blue-500/5',
    positive: 'border-emerald-500/30 bg-emerald-500/5',
  }
  const REC_TEXT: Record<string, string> = {
    critical: 'text-red-400',
    warning: 'text-amber-400',
    opportunity: 'text-blue-400',
    positive: 'text-emerald-400',
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Dashboard"
        subtitle={`Good morning — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

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

        {/* Sales & AI layer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/ai-receptionist" className="block">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors h-full">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide mb-2"><PhoneCall className="w-3 h-3" />AI Receptionist</div>
              <div className="text-xl font-semibold text-white tabular-nums">{formatCurrency(aiRevenue)}</div>
              <div className="text-xs text-gray-500 mt-1">{aiBooked.length} jobs booked · {missedRecovered} missed calls recovered</div>
            </div>
          </Link>
          <Link href="/crm" className="block">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors h-full">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide mb-2"><KanbanSquare className="w-3 h-3" />CRM Pipeline</div>
              <div className="text-xl font-semibold text-white tabular-nums">{formatCurrency(pipelineValue)}</div>
              <div className={`text-xs mt-1 ${overdueFollowups > 0 ? 'text-amber-400' : 'text-gray-500'}`}>
                {overdueFollowups > 0 ? `${overdueFollowups} follow-ups overdue` : 'Follow-ups on track'}
              </div>
            </div>
          </Link>
          <Link href="/valuation" className="block">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors h-full">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide mb-2"><TrendingUp className="w-3 h-3" />Est. Valuation</div>
              <div className="text-xl font-semibold text-white tabular-nums">{formatCurrency(valuationBase)}</div>
              <div className="text-xs text-gray-500 mt-1">3.0× annualized EBITDA proxy</div>
            </div>
          </Link>
          <Link href="/ai-shopper" className="block">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors h-full">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide mb-2"><ShoppingCart className="w-3 h-3" />AI Shopper</div>
              <div className="text-xl font-semibold text-white tabular-nums">4 restock alerts</div>
              <div className="text-xs text-gray-500 mt-1">Cart prepared for approval</div>
            </div>
          </Link>
        </div>

        {/* AI recommendations */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide"><Bot className="w-3.5 h-3.5 text-amber-400" />Titan Recommends</div>
            <Link href="/ai-consultant" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">Full analysis <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {DEMO_RECOMMENDATIONS.slice(0, 6).map(rec => (
              <Link key={rec.id} href={rec.href} className={`block border rounded p-3 hover:opacity-90 transition-opacity ${REC_STYLES[rec.severity]}`}>
                <div className={`text-xs font-semibold mb-1 ${REC_TEXT[rec.severity]}`}>{rec.title}</div>
                <div className="text-xs text-gray-400 line-clamp-2">{rec.body}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Recent Activity</div>
            <div className="space-y-2">
              {recentJobs.map(job => (
                <div key={job.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium truncate">{job.customer?.name}</span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {job.service_type} · {job.technician?.name?.split(' ')[0] || 'Unassigned'} · {formatTime(job.scheduled_start ?? '')}
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
              ))}
              {recentJobs.length === 0 && (
                <div className="text-center py-8 text-gray-600 text-sm">No jobs yet</div>
              )}
            </div>
          </div>
        </div>

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
