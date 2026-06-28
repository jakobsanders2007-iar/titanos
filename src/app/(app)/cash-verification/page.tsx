'use client'

import { useEffect, useState, useTransition } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { getCashPendingJobs, verifyCashJob, flagCashJob } from '@/lib/actions/cash-verification'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { CheckCircle2, Flag, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react'

type CashJob = {
  id: string
  service_type: string
  scheduled_start: string | null
  amount_collected: number | null
  final_price: number | null
  technician_notes: string | null
  customer?: { id: string; name: string; phone: string | null } | null
  technician?: { id: string; name: string; phone: string | null } | null
}

export default function CashVerificationPage() {
  const [jobs, setJobs] = useState<CashJob[]>([])
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  const reload = () => {
    getCashPendingJobs()
      .then(j => setJobs(j as CashJob[]))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const handleVerify = (id: string) => {
    startTransition(async () => {
      await verifyCashJob(id)
      reload()
    })
  }

  const handleFlag = (id: string) => {
    startTransition(async () => {
      await flagCashJob(id)
      reload()
    })
  }

  const totalPending = jobs.reduce((s, j) => s + (j.amount_collected || 0), 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Cash Verification" subtitle="Review and verify cash collections from technicians" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Cash Pending Verification" value={totalPending} format="currency" warning={totalPending > 0} />
          <StatCard title="Jobs Awaiting Review" value={jobs.length} format="number" />
          <StatCard title="Status" value={jobs.length === 0 ? 'All Clear' : 'Needs Review'} />
        </div>

        {jobs.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-amber-400">
                {jobs.length} cash job{jobs.length !== 1 ? 's' : ''} require your verification
              </div>
              <div className="text-xs text-amber-400/60 mt-0.5">
                These jobs were marked as cash collected by technicians. Verify that cash was received and deposited.
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <div className="text-sm font-medium text-white">Cash Jobs Pending Verification</div>
            <div className="text-xs text-gray-500">{jobs.length} total</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <ShieldCheck className="w-10 h-10 mb-3 text-emerald-600" />
              <div className="text-white">All cash verified</div>
              <div className="text-sm mt-1">No pending cash jobs to review</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {jobs.map(job => (
                <div key={job.id} className="px-4 py-4 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Job</div>
                        <div className="text-sm text-gray-300 font-mono">{job.id.slice(0, 8)}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{formatDateTime(job.scheduled_start ?? '')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Customer</div>
                        <div className="text-sm text-white font-medium">{job.customer?.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{job.customer?.phone}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Technician</div>
                        <div className="text-sm text-white">{job.technician?.name || '—'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{job.service_type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Amount</div>
                        <div className="text-lg font-semibold text-white tabular-nums">{formatCurrency(job.amount_collected ?? 0)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Final: {job.final_price ? formatCurrency(job.final_price) : '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Tech Notes</div>
                        <div className="text-xs text-gray-400">{job.technician_notes || 'No notes'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleFlag(job.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium rounded transition-colors"
                      >
                        <Flag className="w-3 h-3" />
                        Flag
                      </button>
                      <button
                        onClick={() => handleVerify(job.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium rounded transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
