'use client'

import { Header } from '@/components/layout/header'
import { DEMO_JOBS, DEMO_TECHNICIANS, DEMO_EXPENSES, DEMO_COMPANY } from '@/lib/demo-data'
import { formatCurrency } from '@/lib/utils'
import { FileText, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Briefcase, Users, ShieldCheck } from 'lucide-react'

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
const cancelledJobs = DEMO_JOBS.filter(j => j.status === 'Cancelled').length
const noShowJobs = DEMO_JOBS.filter(j => j.status === 'No Show').length

const techPerf = DEMO_TECHNICIANS.map(tech => {
  const jobs = completedJobs.filter(j => j.technician_id === tech.id)
  const rev = jobs.reduce((s, j) => s + (j.final_price || 0), 0)
  return { name: tech.name, jobs: jobs.length, revenue: rev, avgTicket: jobs.length ? rev / jobs.length : 0 }
}).sort((a, b) => b.revenue - a.revenue)

const annualRevenue = grossRevenue * 12
const annualEBITDA = ebitda * 12
const valuationLow = annualEBITDA * 2
const valuationBase = annualEBITDA * 3
const valuationHigh = annualEBITDA * 4

const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2">
        <Icon className="w-4 h-4 text-amber-400" />
        <div className="text-sm font-semibold text-white">{title}</div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  )
}

export default function CEOPacketPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="CEO Packet"
        subtitle={`Monthly business summary — ${month}`}
        actions={
          <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded border border-gray-700 transition-colors">
            Export PDF
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Header card */}
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg p-5">
          <div className="text-xs text-amber-400 uppercase tracking-wide mb-1">Executive Summary — {month}</div>
          <div className="text-xl font-bold text-white mb-2">{DEMO_COMPANY.name}</div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {DEMO_COMPANY.name} completed <strong className="text-white">{completedJobs.length} jobs</strong> this month with gross revenue of{' '}
            <strong className="text-white">{formatCurrency(grossRevenue)}</strong> and an average ticket of{' '}
            <strong className="text-white">{formatCurrency(avgTicket)}</strong>. Estimated EBITDA is{' '}
            <strong className="text-emerald-400">{formatCurrency(ebitda)}</strong> ({ebitdaMargin.toFixed(1)}% margin).
            {cashPendingAmount > 0 && ` ${formatCurrency(cashPendingAmount)} in cash collections is pending owner verification.`}
            {` At the current pace, annualized revenue projects to ${formatCurrency(annualRevenue)} with estimated business valuation range of ${formatCurrency(valuationLow)}–${formatCurrency(valuationHigh)}.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Revenue */}
          <Section title="Revenue" icon={DollarSign}>
            <MetricRow label="Gross Revenue" value={formatCurrency(grossRevenue)} />
            <MetricRow label="Parts & Materials Cost" value={formatCurrency(totalParts)} />
            <MetricRow label="Gross Profit" value={formatCurrency(grossRevenue - totalParts)} />
            <MetricRow label="Total Operating Expenses" value={formatCurrency(totalExpenses)} />
            <MetricRow label="EBITDA Estimate" value={`${formatCurrency(ebitda)} (${ebitdaMargin.toFixed(1)}%)`} />
            <MetricRow label="Annualized Revenue" value={formatCurrency(annualRevenue)} />
          </Section>

          {/* Job Volume */}
          <Section title="Job Volume" icon={Briefcase}>
            <MetricRow label="Total Jobs Dispatched" value={DEMO_JOBS.length.toString()} />
            <MetricRow label="Jobs Completed" value={completedJobs.length.toString()} />
            <MetricRow label="Jobs Cancelled" value={cancelledJobs.toString()} />
            <MetricRow label="No Shows" value={noShowJobs.toString()} />
            <MetricRow label="Average Ticket" value={formatCurrency(avgTicket)} />
            <MetricRow label="Jobs Per Tech" value={(completedJobs.length / 4).toFixed(1)} />
          </Section>

          {/* Payment Collection */}
          <Section title="Payment Collection" icon={ShieldCheck}>
            <MetricRow label="Total Collected" value={formatCurrency(DEMO_JOBS.reduce((s, j) => s + j.amount_collected, 0))} />
            <MetricRow label="Payment Links Sent" value={linksSent.toString()} />
            <MetricRow label="Links Converted" value={`${linksPaid} (${linkConversion.toFixed(0)}%)`} />
            <MetricRow label="Cash Collected" value={formatCurrency(DEMO_JOBS.filter(j => j.payment_method === 'Cash').reduce((s, j) => s + j.amount_collected, 0))} />
            <MetricRow label="Cash Pending Verification" value={formatCurrency(cashPendingAmount)} />
          </Section>

          {/* Tech Performance */}
          <Section title="Technician Performance" icon={Users}>
            {techPerf.map((t, i) => (
              <div key={t.name} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${i === 0 ? 'text-amber-400' : 'text-gray-600'}`}>#{i + 1}</span>
                  <span className="text-sm text-gray-300">{t.name}</span>
                  <span className="text-xs text-gray-600">{t.jobs} jobs</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatCurrency(t.revenue)}</div>
                  <div className="text-xs text-gray-500">avg {formatCurrency(t.avgTicket)}</div>
                </div>
              </div>
            ))}
          </Section>
        </div>

        {/* Valuation */}
        <Section title="Business Valuation Estimate" icon={TrendingUp}>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Conservative', value: valuationLow, mult: '2.0×', color: 'text-gray-300' },
              { label: 'Base Case', value: valuationBase, mult: '3.0×', color: 'text-amber-400' },
              { label: 'Optimistic', value: valuationHigh, mult: '4.0×', color: 'text-emerald-400' },
            ].map(v => (
              <div key={v.label} className="bg-gray-950/50 rounded p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">{v.label}</div>
                <div className={`text-xl font-bold ${v.color}`}>{formatCurrency(v.value)}</div>
                <div className="text-xs text-gray-600 mt-0.5">{v.mult} EBITDA</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Based on annualized EBITDA of {formatCurrency(annualEBITDA)}. Actual valuation depends on clean books, technician dependency risk, customer concentration, and systems quality. Using Titan improves your sellability score.
          </p>
        </Section>

        {/* Problems + Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Issues Found" icon={AlertTriangle}>
            <div className="space-y-2">
              {cashPendingAmount > 0 && (
                <div className="flex items-start gap-2 p-2 bg-amber-500/5 border border-amber-500/20 rounded">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-300">{formatCurrency(cashPendingAmount)} in unverified cash from {cashPendingJobs.length} jobs</div>
                </div>
              )}
              {linkConversion < 70 && (
                <div className="flex items-start gap-2 p-2 bg-red-500/5 border border-red-500/20 rounded">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-red-300">Payment link conversion at {linkConversion.toFixed(0)}% — below 70% target</div>
                </div>
              )}
              {noShowJobs > 0 && (
                <div className="flex items-start gap-2 p-2 bg-gray-800 border border-gray-700 rounded">
                  <AlertTriangle className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-400">{noShowJobs} no-show{noShowJobs !== 1 ? 's' : ''} this period — implement confirmation SMS</div>
                </div>
              )}
            </div>
          </Section>

          <Section title="Recommended Actions" icon={CheckCircle2}>
            <div className="space-y-2">
              {[
                'Verify all pending cash collections before month close',
                'Push payment links on every job — target 90%+ usage',
                'Review technician avg tickets — variance may indicate pricing inconsistency',
                'Set up QuickBooks sync to reduce manual bookkeeping',
                'Add customer confirmation SMS to reduce no-shows',
                'Run CEO Packet monthly and track valuation trend',
              ].map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full border border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-400 text-xs">{i + 1}</span>
                  </div>
                  <div className="text-xs text-gray-400">{action}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
