'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { DEMO_JOBS, DEMO_CUSTOMERS, DEMO_TECHNICIANS } from '@/lib/demo-data'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { CheckCircle2, Flag, AlertTriangle, ShieldCheck } from 'lucide-react'

const customerMap = Object.fromEntries(DEMO_CUSTOMERS.map(c => [c.id, c]))
const techMap = Object.fromEntries(DEMO_TECHNICIANS.map(t => [t.id, t]))

type VerificationState = Record<string, 'pending' | 'verified' | 'flagged'>

export default function CashVerificationPage() {
  const pendingJobs = DEMO_JOBS.filter(j => j.cash_verification_status === 'pending')
  const [verifications, setVerifications] = useState<VerificationState>(
    Object.fromEntries(pendingJobs.map(j => [j.id, 'pending']))
  )

  const totalPending = pendingJobs.filter(j => verifications[j.id] === 'pending').reduce((s, j) => s + j.amount_collected, 0)
  const totalVerified = pendingJobs.filter(j => verifications[j.id] === 'verified').reduce((s, j) => s + j.amount_collected, 0)
  const totalFlagged = pendingJobs.filter(j => verifications[j.id] === 'flagged').reduce((s, j) => s + j.amount_collected, 0)

  const verify = (id: string) => setVerifications(prev => ({ ...prev, [id]: 'verified' }))
  const flag = (id: string) => setVerifications(prev => ({ ...prev, [id]: 'flagged' }))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Cash Verification"
        subtitle="Review and verify cash collections from technicians"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Cash Pending Verification" value={totalPending} format="currency" warning />
          <StatCard title="Verified This Session" value={totalVerified} format="currency" highlight />
          <StatCard title="Flagged for Review" value={totalFlagged} format="currency" />
        </div>

        {pendingJobs.filter(j => verifications[j.id] === 'pending').length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-amber-400">
                {pendingJobs.filter(j => verifications[j.id] === 'pending').length} cash jobs require your verification
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
            <div className="text-xs text-gray-500">{pendingJobs.length} total</div>
          </div>

          <div className="divide-y divide-gray-800">
            {pendingJobs.map(job => {
              const customer = customerMap[job.customer_id]
              const tech = job.technician_id ? techMap[job.technician_id] : null
              const state = verifications[job.id]

              return (
                <div
                  key={job.id}
                  className={`px-4 py-4 transition-colors ${
                    state === 'verified' ? 'bg-emerald-500/5' :
                    state === 'flagged' ? 'bg-red-500/5' :
                    'hover:bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Job</div>
                        <div className="text-sm text-gray-300 font-mono">{job.id.replace('job-', '#')}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{formatDateTime(job.scheduled_start)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Customer</div>
                        <div className="text-sm text-white font-medium">{customer?.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{customer?.phone}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Technician</div>
                        <div className="text-sm text-white">{tech?.name || '—'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{job.service_type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Amount</div>
                        <div className="text-lg font-semibold text-white tabular-nums">{formatCurrency(job.amount_collected)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Final: {job.final_price ? formatCurrency(job.final_price) : '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Tech Notes</div>
                        <div className="text-xs text-gray-400">{job.technician_notes || 'No notes'}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {state === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => flag(job.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium rounded transition-colors"
                          >
                            <Flag className="w-3 h-3" />
                            Flag
                          </button>
                          <button
                            onClick={() => verify(job.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium rounded transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Verify
                          </button>
                        </div>
                      ) : state === 'verified' ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-red-400">
                          <Flag className="w-4 h-4" />
                          Flagged
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {pendingJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <ShieldCheck className="w-10 h-10 mb-3 text-emerald-600" />
              <div className="text-white">All cash verified</div>
              <div className="text-sm mt-1">No pending cash jobs to review</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
