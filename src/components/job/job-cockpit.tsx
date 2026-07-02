'use client'

import { useState } from 'react'
import { computeJobFlow, type EngineJob, type RiskLevel } from '@/lib/job-engine'
import { formatCurrency, formatDateTime, formatTime } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  X, Check, Circle, AlertTriangle, ArrowRight, Phone, MapPin, User, Wrench,
  Package, ClipboardList, DollarSign, ShieldCheck, TrendingUp, Sparkles, Clock,
  ChevronRight, CircleDot,
} from 'lucide-react'

export interface CockpitCustomer { name: string; phone: string; address: string }
export interface CockpitTech { name: string; phone: string }

const RISK_STYLE: Record<RiskLevel, { text: string; bg: string; border: string }> = {
  critical: { text: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/30' },
  warning: { text: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/30' },
  info: { text: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
}

// Which lifecycle stage each detail panel belongs to
const STAGE_ICONS = [Phone, ClipboardList, MapPin, Package, Wrench, DollarSign, ShieldCheck, TrendingUp, ArrowRight]

export function JobCockpit({
  job, customer, technician, onClose,
}: {
  job: EngineJob
  customer?: CockpitCustomer
  technician?: CockpitTech | null
  onClose: () => void
}) {
  const flow = computeJobFlow(job)
  const [collect, setCollect] = useState<Record<number, boolean>>(
    Object.fromEntries(flow.mustCollect.map((c, i) => [i, c.done]))
  )

  const collectedCount = Object.values(collect).filter(Boolean).length
  const criticalOutstanding = flow.mustCollect.filter((c, i) => c.critical && !collect[i]).length

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-2xl bg-gray-950 border-l border-gray-800 h-full overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-semibold text-white">{job.service_type}</span>
                <StatusBadge status={job.status} />
                {flow.isLive && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {customer?.name} · {job.id.replace('job-', '#')} · {formatDateTime(job.scheduled_start)}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* NEXT BEST ACTION — the hero */}
          <div className={`rounded-lg border p-4 ${RISK_STYLE[flow.nextAction.urgency].bg} ${RISK_STYLE[flow.nextAction.urgency].border}`}>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500 mb-2">
              <Sparkles className={`w-3.5 h-3.5 ${RISK_STYLE[flow.nextAction.urgency].text}`} />
              Next Best Action
            </div>
            <div className={`text-lg font-semibold mb-1 ${RISK_STYLE[flow.nextAction.urgency].text}`}>
              {flow.nextAction.label}
            </div>
            <div className="text-sm text-gray-400">{flow.nextAction.detail}</div>
            <button className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              flow.nextAction.urgency === 'critical'
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-gray-950'
            }`}>
              Do it now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Risks */}
          {flow.risks.length > 0 && (
            <div className="space-y-2">
              {flow.risks.map((r, i) => {
                const s = RISK_STYLE[r.level]
                return (
                  <div key={i} className={`flex items-center gap-2 rounded border px-3 py-2 ${s.bg} ${s.border}`}>
                    <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${s.text}`} />
                    <span className={`text-xs font-medium ${s.text}`}>{r.message}</span>
                    {r.amount ? <span className="text-xs text-gray-400 ml-auto tabular-nums">{formatCurrency(r.amount)}</span> : null}
                  </div>
                )
              })}
            </div>
          )}

          {/* Lifecycle stepper */}
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">Job Lifecycle</div>
            <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
              {flow.stages.map((stage, i) => {
                const Icon = STAGE_ICONS[i]
                const color =
                  stage.state === 'done' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                  : stage.state === 'current' ? 'text-amber-400 border-amber-500/50 bg-amber-500/10'
                  : stage.state === 'blocked' ? 'text-red-400 border-red-500/40 bg-red-500/10'
                  : 'text-gray-600 border-gray-800 bg-gray-900'
                return (
                  <div key={stage.name} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center gap-1 w-[72px]">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${color}`}>
                        {stage.state === 'done' ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[10px] text-center leading-tight ${stage.state === 'current' ? 'text-amber-400 font-medium' : 'text-gray-600'}`}>
                        {stage.name}
                      </span>
                    </div>
                    {i < flow.stages.length - 1 && (
                      <ChevronRight className={`w-3 h-3 flex-shrink-0 -mt-4 ${stage.state === 'done' ? 'text-emerald-500/50' : 'text-gray-800'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Context: customer + tech */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><User className="w-3 h-3" />Customer</div>
              <div className="text-sm text-white font-medium">{customer?.name ?? '—'}</div>
              <div className="text-xs text-gray-500 mt-0.5">{customer?.phone}</div>
              <div className="text-xs text-gray-600 mt-1 flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />{job.address}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Wrench className="w-3 h-3" />Technician</div>
              <div className="text-sm text-white font-medium">{technician?.name ?? <span className="text-amber-400">Unassigned</span>}</div>
              <div className="text-xs text-gray-500 mt-0.5">{technician?.phone}</div>
              <div className="text-xs text-gray-600 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(job.scheduled_start)} · {job.source}</div>
            </div>
          </div>

          {/* Diagnosis */}
          <Panel icon={ClipboardList} title="Diagnosis — confirm before dispatch">
            <ul className="space-y-1.5">
              {flow.playbook.diagnosis.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <CircleDot className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />{q}
                </li>
              ))}
            </ul>
          </Panel>

          {/* Tools & Parts */}
          <div className="grid grid-cols-2 gap-3">
            <Panel icon={Wrench} title="Tools to load">
              <div className="flex flex-wrap gap-1.5">
                {flow.playbook.tools.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">{t}</span>
                ))}
              </div>
            </Panel>
            <Panel icon={Package} title="Likely parts">
              {flow.playbook.parts.length === 0 ? (
                <div className="text-xs text-gray-600">No parts typical for this job</div>
              ) : (
                <ul className="space-y-1">
                  {flow.playbook.parts.map(p => (
                    <li key={p.name} className="flex items-center justify-between text-xs">
                      <span className={p.likely ? 'text-gray-300' : 'text-gray-500'}>
                        {p.name}{p.likely && <span className="text-amber-400 ml-1">•</span>}
                      </span>
                      <span className="text-gray-500 tabular-nums">{formatCurrency(p.typicalCost)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* Work checklist */}
          <Panel icon={ClipboardList} title="On-site work checklist">
            <ul className="space-y-1.5">
              {flow.playbook.checklist.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="w-4 h-4 rounded-full border border-gray-700 text-[10px] text-gray-500 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
            {flow.playbook.upsell && (
              <div className="mt-3 flex items-start gap-2 rounded bg-amber-500/5 border border-amber-500/20 px-3 py-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-amber-300">Upsell: {flow.playbook.upsell}</span>
              </div>
            )}
          </Panel>

          {/* Before you leave — must collect */}
          <Panel icon={ShieldCheck} title={`Before the tech leaves · ${collectedCount}/${flow.mustCollect.length}`}
            accent={criticalOutstanding > 0 ? 'warning' : 'ok'}>
            <div className="space-y-1">
              {flow.mustCollect.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setCollect(prev => ({ ...prev, [i]: !prev[i] }))}
                  className="w-full flex items-center gap-2 text-left py-1.5 group"
                >
                  {collect[i]
                    ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    : <Circle className={`w-4 h-4 flex-shrink-0 ${c.critical ? 'text-red-400' : 'text-gray-600'}`} />}
                  <span className={`text-sm ${collect[i] ? 'text-gray-500 line-through' : c.critical ? 'text-gray-200' : 'text-gray-400'}`}>
                    {c.label}{c.critical && !collect[i] && <span className="text-red-400 ml-1 text-xs">required</span>}
                  </span>
                </button>
              ))}
            </div>
            {criticalOutstanding > 0 && (
              <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />{criticalOutstanding} required item{criticalOutstanding !== 1 ? 's' : ''} outstanding — do not close the job
              </div>
            )}
          </Panel>

          {/* Profit */}
          <Panel icon={DollarSign} title="Job profitability">
            <div className="grid grid-cols-4 gap-2 mb-3">
              <Metric label="Revenue" value={formatCurrency(flow.profit.revenue)} />
              <Metric label="Parts" value={`-${formatCurrency(flow.profit.partsCost)}`} muted />
              <Metric label="Labor est." value={`-${formatCurrency(flow.profit.laborCost)}`} muted />
              <Metric label="Gross profit" value={formatCurrency(flow.profit.grossProfit)} accent />
            </div>
            <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <div className={`h-full rounded-full ${flow.profit.margin >= 50 ? 'bg-emerald-500' : flow.profit.margin >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.max(0, Math.min(100, flow.profit.margin))}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">{flow.profit.margin.toFixed(0)}% gross margin</div>
          </Panel>

          {/* Valuation impact */}
          <div className={`rounded-lg border p-4 ${flow.valuation.positive ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500 mb-2">
              <TrendingUp className={`w-3.5 h-3.5 ${flow.valuation.positive ? 'text-emerald-400' : 'text-amber-400'}`} />
              Valuation Impact
            </div>
            <div className={`text-2xl font-semibold tabular-nums mb-1 ${flow.valuation.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {flow.valuation.positive ? '+' : ''}{formatCurrency(flow.valuation.valueContribution)}
            </div>
            <div className="text-xs text-gray-400">{flow.valuation.note}</div>
          </div>

          {/* Follow-up */}
          {flow.followUp && (
            <Panel icon={ArrowRight} title="Follow-up">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{flow.followUp.action}</span>
                <span className="text-xs text-gray-500">in {flow.followUp.dueInDays} day{flow.followUp.dueInDays !== 1 ? 's' : ''}</span>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}

function Panel({ icon: Icon, title, children, accent }: { icon: React.ElementType; title: string; children: React.ReactNode; accent?: 'ok' | 'warning' }) {
  return (
    <div className={`bg-gray-900 border rounded-lg ${accent === 'warning' ? 'border-red-500/30' : 'border-gray-800'}`}>
      <div className="px-4 py-2.5 border-b border-gray-800 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}

function Metric({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-gray-600 uppercase tracking-wide mb-0.5">{label}</div>
      <div className={`text-sm font-semibold tabular-nums ${accent ? 'text-emerald-400' : muted ? 'text-gray-500' : 'text-white'}`}>{value}</div>
    </div>
  )
}
