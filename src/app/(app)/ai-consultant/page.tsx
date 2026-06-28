'use client'

import { Header } from '@/components/layout/header'
import { DEMO_JOBS, DEMO_TECHNICIANS, DEMO_EXPENSES } from '@/lib/demo-data'
import { formatCurrency } from '@/lib/utils'
import { Bot, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, DollarSign, Zap } from 'lucide-react'

const completedJobs = DEMO_JOBS.filter(j => j.status === 'Completed' && j.final_price)
const grossRevenue = completedJobs.reduce((s, j) => s + (j.final_price || 0), 0)
const avgTicket = completedJobs.length ? grossRevenue / completedJobs.length : 0
const totalExpenses = DEMO_EXPENSES.reduce((s, e) => s + e.amount, 0)
const totalParts = completedJobs.reduce((s, j) => s + (j.parts_cost || 0), 0)
const ebitda = grossRevenue - totalExpenses - totalParts
const ebitdaMargin = grossRevenue ? (ebitda / grossRevenue) * 100 : 0

const cashPendingJobs = DEMO_JOBS.filter(j => j.cash_verification_status === 'pending')
const cashPendingAmount = cashPendingJobs.reduce((s, j) => s + j.amount_collected, 0)
const linksSent = DEMO_JOBS.filter(j => j.payment_link_sent).length
const linksPaid = DEMO_JOBS.filter(j => j.payment_link_sent && j.payment_status === 'Paid').length
const linkConversion = linksSent ? ((linksPaid / linksSent) * 100) : 0

const techPerf = DEMO_TECHNICIANS.map(tech => {
  const jobs = completedJobs.filter(j => j.technician_id === tech.id)
  const rev = jobs.reduce((s, j) => s + (j.final_price || 0), 0)
  return { ...tech, jobs: jobs.length, revenue: rev, avgTicket: jobs.length ? rev / jobs.length : 0 }
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

type InsightType = 'warning' | 'positive' | 'info' | 'action'

interface Insight {
  type: InsightType
  title: string
  body: string
  metric?: string
}

const insights: Insight[] = [
  {
    type: 'warning',
    title: 'Cash Leakage Risk Detected',
    body: `${cashPendingJobs.length} completed cash jobs totaling ${formatCurrency(cashPendingAmount)} have not been verified by ownership. This is your highest-risk financial exposure. Unverified cash is money that may not make it to the bank.`,
    metric: formatCurrency(cashPendingAmount),
  },
  {
    type: 'info',
    title: 'Payment Link Adoption is Moderate',
    body: `Your payment link conversion rate is ${linkConversion.toFixed(0)}%. ${linksPaid} of ${linksSent} links sent resulted in payment. Target is 85%+. Consider having dispatchers send links at time of booking, not after completion.`,
    metric: `${linkConversion.toFixed(0)}% conversion`,
  },
  {
    type: 'positive',
    title: `${topTech?.name} is Your Top Performer`,
    body: `${topTech?.name} generated ${formatCurrency(topTech?.revenue || 0)} across ${topTech?.jobs} jobs with an average ticket of ${formatCurrency(topTech?.avgTicket || 0)}. Consider having them mentor newer technicians on upselling and closing.`,
    metric: formatCurrency(topTech?.revenue || 0),
  },
  {
    type: 'info',
    title: 'Technician Ticket Gap Identified',
    body: `There is a ${formatCurrency((topTech?.avgTicket || 0) - (bottomTech?.avgTicket || 0))} difference in average ticket between your top and bottom technician. This typically indicates pricing inconsistency. Set a minimum quote floor and provide job-type pricing guidelines.`,
    metric: `${formatCurrency((topTech?.avgTicket || 0) - (bottomTech?.avgTicket || 0))} gap`,
  },
  {
    type: 'positive',
    title: `${topService?.[0]} is Your Highest Revenue Service`,
    body: `${topService?.[0]} accounts for ${formatCurrency(topService?.[1].revenue || 0)} of revenue across ${topService?.[1].count} jobs. Consider prioritizing marketing spend toward this service type to increase volume.`,
    metric: formatCurrency(topService?.[1].revenue || 0),
  },
  {
    type: 'info',
    title: `You Completed ${completedJobs.length} Jobs This Period`,
    body: `At your current average ticket of ${formatCurrency(avgTicket)}, you are pacing toward ${formatCurrency(grossRevenue * 12)} annualized revenue. Adding 2 more jobs per week would increase annualized revenue by approximately ${formatCurrency(avgTicket * 2 * 52)}.`,
    metric: formatCurrency(grossRevenue * 12),
  },
  {
    type: 'positive',
    title: 'EBITDA Margin is Healthy',
    body: `Your estimated EBITDA margin is ${ebitdaMargin.toFixed(1)}% (${formatCurrency(ebitda)} this period). For a small locksmith operation, 25–40% EBITDA margin is excellent. Your current margin positions you well for valuation and financing.`,
    metric: `${ebitdaMargin.toFixed(1)}% margin`,
  },
  {
    type: 'action',
    title: 'Estimated Business Valuation: Set a Goal',
    body: `Based on your current EBITDA, your business is estimated at ${formatCurrency(ebitda * 12 * 2.5)}–${formatCurrency(ebitda * 12 * 4)} (2.5×–4× annualized EBITDA). Every ${formatCurrency(1000)} increase in monthly EBITDA adds ${formatCurrency(30000)}–${formatCurrency(48000)} to your business value.`,
    metric: `${formatCurrency(ebitda * 12 * 3)} base`,
  },
]

const INSIGHT_STYLES: Record<InsightType, { bg: string; border: string; icon: typeof Bot; iconColor: string }> = {
  warning: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', icon: AlertTriangle, iconColor: 'text-amber-400' },
  positive: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', icon: TrendingUp, iconColor: 'text-emerald-400' },
  info: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', icon: Zap, iconColor: 'text-blue-400' },
  action: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', icon: CheckCircle2, iconColor: 'text-purple-400' },
}

export default function AIConsultantPage() {
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
          {/* Summary box */}
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
                Below are detailed insights and recommended actions.
              </p>
            </div>
          </div>

          {/* Insights */}
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
                        {insight.metric && (
                          <div className={`text-xs font-bold ${style.iconColor} flex-shrink-0`}>{insight.metric}</div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{insight.body}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Coming soon */}
          <div className="mt-6 bg-gray-900 border border-gray-800 border-dashed rounded-lg p-6 text-center">
            <Bot className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <div className="text-sm text-gray-500 font-medium">Claude AI Integration Coming Soon</div>
            <div className="text-xs text-gray-600 mt-1">
              Ask questions like &quot;Why did my revenue drop this week?&quot; or &quot;Which technician should I send on a smart lock install?&quot;
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
