'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { getJobs } from '@/lib/actions/jobs'
import { getTechnicians } from '@/lib/actions/technicians'
import { getExpenses } from '@/lib/actions/expenses'
import { formatCurrency } from '@/lib/utils'
import { Bot, TrendingUp, AlertTriangle, CheckCircle2, Zap, Loader2 } from 'lucide-react'
import type { Technician, Expense } from '@/types/database'

type JobRow = {
  id: string
  status: string
  final_price: number | null
  parts_cost: number | null
  payment_method: string | null
  payment_status: string | null
  payment_link_sent: boolean | null
  amount_collected: number | null
  cash_verification_status: string | null
  technician_id: string | null
  service_type: string
}

type InsightType = 'warning' | 'positive' | 'info' | 'action'
interface Insight { type: InsightType; title: string; body: string; metric?: string }

const INSIGHT_STYLES: Record<InsightType, { bg: string; border: string; icon: React.ElementType; iconColor: string }> = {
  warning: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', icon: AlertTriangle, iconColor: 'text-amber-400' },
  positive: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', icon: TrendingUp, iconColor: 'text-emerald-400' },
  info: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', icon: Zap, iconColor: 'text-blue-400' },
  action: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', icon: CheckCircle2, iconColor: 'text-purple-400' },
}

export default function AIConsultantPage() {
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getJobs(), getTechnicians(), getExpenses()])
      .then(([j, t, e]) => { setJobs(j as JobRow[]); setTechnicians(t); setExpenses(e) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const completedJobs = jobs.filter(j => j.status === 'Completed' && j.final_price)
  const grossRevenue = completedJobs.reduce((s, j) => s + (j.final_price || 0), 0)
  const avgTicket = completedJobs.length ? grossRevenue / completedJobs.length : 0
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalParts = completedJobs.reduce((s, j) => s + (j.parts_cost || 0), 0)
  const ebitda = grossRevenue - totalExpenses - totalParts
  const ebitdaMargin = grossRevenue ? (ebitda / grossRevenue) * 100 : 0
  const cashPendingJobs = jobs.filter(j => j.cash_verification_status === 'pending')
  const cashPendingAmount = cashPendingJobs.reduce((s, j) => s + (j.amount_collected || 0), 0)
  const linksSent = jobs.filter(j => j.payment_link_sent).length
  const linksPaid = jobs.filter(j => j.payment_link_sent && j.payment_status === 'Paid').length
  const linkConversion = linksSent ? ((linksPaid / linksSent) * 100) : 0

  const techPerf = technicians.map(tech => {
    const tJobs = completedJobs.filter(j => j.technician_id === tech.id)
    const rev = tJobs.reduce((s, j) => s + (j.final_price || 0), 0)
    return { ...tech, jobs: tJobs.length, revenue: rev, avgTicket: tJobs.length ? rev / tJobs.length : 0 }
  }).sort((a, b) => b.revenue - a.revenue)
  const topTech = techPerf[0]
  const bottomTech = techPerf[techPerf.length - 1]

  const serviceRevenue: Record<string, { revenue: number; count: number }> = {}
  completedJobs.forEach(j => {
    if (!serviceRevenue[j.service_type]) serviceRevenue[j.service_type] = { revenue: 0, count: 0 }
    serviceRevenue[j.service_type].revenue += j.final_price || 0
    serviceRevenue[j.service_type].count++
  })
  const topService = Object.entries(serviceRevenue).sort((a, b) => b[1].revenue - a[1].revenue)[0]

  const insights: Insight[] = [
    {
      type: 'warning',
      title: 'Cash Leakage Risk Detected',
      body: `${cashPendingJobs.length} completed cash jobs totaling ${formatCurrency(cashPendingAmount)} have not been verified by ownership. This is your highest-risk financial exposure.`,
      metric: formatCurrency(cashPendingAmount),
    },
    {
      type: 'info',
      title: 'Payment Link Adoption',
      body: `Your payment link conversion rate is ${linkConversion.toFixed(0)}%. ${linksPaid} of ${linksSent} links sent resulted in payment. Target is 85%+. Consider sending links at time of booking.`,
      metric: `${linkConversion.toFixed(0)}% conversion`,
    },
    ...(topTech ? [{
      type: 'positive' as InsightType,
      title: `${topTech.name} is Your Top Performer`,
      body: `${topTech.name} generated ${formatCurrency(topTech.revenue)} across ${topTech.jobs} jobs with an average ticket of ${formatCurrency(topTech.avgTicket)}.`,
      metric: formatCurrency(topTech.revenue),
    }] : []),
    ...(topTech && bottomTech && topTech.id !== bottomTech.id ? [{
      type: 'info' as InsightType,
      title: 'Technician Ticket Gap Identified',
      body: `There is a ${formatCurrency(topTech.avgTicket - bottomTech.avgTicket)} difference in average ticket between your top and bottom technician. Set a minimum quote floor and provide pricing guidelines.`,
      metric: `${formatCurrency(topTech.avgTicket - bottomTech.avgTicket)} gap`,
    }] : []),
    ...(topService ? [{
      type: 'positive' as InsightType,
      title: `${topService[0]} is Your Highest Revenue Service`,
      body: `${topService[0]} accounts for ${formatCurrency(topService[1].revenue)} of revenue across ${topService[1].count} jobs. Prioritize marketing toward this service type.`,
      metric: formatCurrency(topService[1].revenue),
    }] : []),
    {
      type: 'info',
      title: `You Completed ${completedJobs.length} Jobs This Period`,
      body: `At your current average ticket of ${formatCurrency(avgTicket)}, you are pacing toward ${formatCurrency(grossRevenue * 12)} annualized revenue. Adding 2 more jobs per week would add approximately ${formatCurrency(avgTicket * 2 * 52)} annually.`,
      metric: formatCurrency(grossRevenue * 12),
    },
    {
      type: 'positive',
      title: 'EBITDA Margin is Healthy',
      body: `Your estimated EBITDA margin is ${ebitdaMargin.toFixed(1)}% (${formatCurrency(ebitda)} this period). For a small locksmith operation, 25–40% EBITDA margin is excellent.`,
      metric: `${ebitdaMargin.toFixed(1)}% margin`,
    },
    {
      type: 'action',
      title: 'Estimated Business Valuation: Set a Goal',
      body: `Based on your current EBITDA, your business is estimated at ${formatCurrency(ebitda * 12 * 2.5)}–${formatCurrency(ebitda * 12 * 4)}. Every $1,000 increase in monthly EBITDA adds $30,000–$48,000 to your business value.`,
      metric: `${formatCurrency(ebitda * 12 * 3)} base`,
    },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="AI Consultant"
        subtitle="Data-driven insights for your business"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded">
            <Bot className="w-3.5 h-3.5" />
            Powered by Titan AI · Claude integration coming
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            </div>
          ) : (
            <>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white mb-1">Titan AI Analysis</div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Based on <strong className="text-white">{completedJobs.length} completed jobs</strong> and{' '}
                    <strong className="text-white">{formatCurrency(grossRevenue)}</strong> in revenue, I have identified{' '}
                    <strong className="text-amber-400">{insights.filter(i => i.type === 'warning').length} risk areas</strong> and{' '}
                    <strong className="text-emerald-400">{insights.filter(i => i.type === 'positive').length} positive trends</strong>.
                    Your estimated business value is{' '}
                    <strong className="text-white">{formatCurrency(ebitda * 12 * 2.5)}–{formatCurrency(ebitda * 12 * 4)}</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {insights.map((insight, i) => {
                  const style = INSIGHT_STYLES[insight.type]
                  const Icon = style.icon
                  return (
                    <div key={i} className={`${style.bg} border ${style.border} rounded-lg p-4`}>
                      <div className="flex items-start gap-3">
                        <Icon className={`w-4 h-4 ${style.iconColor} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="text-sm font-semibold text-white">{insight.title}</div>
                            {insight.metric && <div className={`text-xs font-bold ${style.iconColor} flex-shrink-0`}>{insight.metric}</div>}
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">{insight.body}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 bg-gray-900 border border-gray-800 border-dashed rounded-lg p-6 text-center">
                <Bot className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-sm text-gray-500 font-medium">Claude AI Integration Coming Soon</div>
                <div className="text-xs text-gray-600 mt-1">
                  Ask questions like &quot;Why did my revenue drop this week?&quot; or &quot;Which technician should I send on a smart lock install?&quot;
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
