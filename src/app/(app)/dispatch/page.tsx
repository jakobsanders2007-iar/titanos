'use client'

import { useEffect, useState, useTransition } from 'react'
import { Header } from '@/components/layout/header'
import { StatusBadge } from '@/components/ui/status-badge'
import { getJobsForToday } from '@/lib/actions/jobs'
import { getTechnicians } from '@/lib/actions/technicians'
import { updateJobStatus } from '@/lib/actions/jobs'
import { formatCurrency, formatTime } from '@/lib/utils'
import { Plus, MapPin, Clock, DollarSign, User, AlertCircle, Loader2 } from 'lucide-react'
import type { Technician } from '@/types/database'

type JobRow = {
  id: string
  status: string
  payment_status: string | null
  payment_method: string | null
  technician_id: string | null
  service_type: string
  scheduled_start: string | null
  estimated_price: number | null
  final_price: number | null
  cash_verification_status: string | null
  payment_link_sent: boolean | null
  amount_collected: number | null
  customer?: { id: string; name: string; phone: string | null } | null
  technician?: { id: string; name: string } | null
}

const ACTIVE_STATUSES = ['Scheduled', 'Assigned', 'En Route', 'Arrived', 'In Progress', 'Completed', 'No Show', 'Cancelled']

export default function DispatchPage() {
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [, startTransition] = useTransition()

  const reload = () => {
    Promise.all([getJobsForToday(), getTechnicians()])
      .then(([j, t]) => { setJobs(j as JobRow[]); setTechnicians(t) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const handleStatusUpdate = (jobId: string, status: string) => {
    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateJobStatus(jobId, status as any)
      reload()
    })
  }

  const unassigned = jobs.filter(j => !j.technician_id)
  const visibleJobs = jobs.filter(j => statusFilter === 'All' || j.status === statusFilter)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Dispatch Board"
        subtitle={`Today — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · ${jobs.length} jobs`}
        actions={
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2 py-1.5 bg-gray-900 border border-gray-800 rounded text-xs text-gray-300 focus:outline-none">
              <option value="All">All Status</option>
              {ACTIVE_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
              <Plus className="w-3.5 h-3.5" />New Job
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden flex">
        <div className="w-48 border-r border-gray-800 flex flex-col overflow-y-auto bg-gray-950 flex-shrink-0">
          <div className="px-3 py-2 border-b border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Technicians</div>
          </div>
          <button onClick={() => setSelectedTech(null)} className={`px-3 py-2.5 text-left border-b border-gray-800/50 transition-colors ${!selectedTech ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>
            <div className="text-xs font-medium text-white">All Techs</div>
            <div className="text-xs text-gray-500">{jobs.length} jobs today</div>
          </button>
          {technicians.map(tech => {
            const techJobs = jobs.filter(j => j.technician_id === tech.id)
            const activeJob = techJobs.find(j => ['En Route', 'In Progress', 'Arrived'].includes(j.status))
            return (
              <button key={tech.id} onClick={() => setSelectedTech(tech.id === selectedTech ? null : tech.id)} className={`px-3 py-2.5 text-left border-b border-gray-800/50 transition-colors ${selectedTech === tech.id ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeJob ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  <div className="text-xs font-medium text-white truncate">{tech.name.split(' ')[0]}</div>
                </div>
                <div className="text-xs text-gray-500 mt-0.5 ml-4">{techJobs.length} jobs</div>
                {activeJob && <div className="text-xs text-emerald-400 mt-0.5 ml-4 truncate">{activeJob.status}</div>}
              </button>
            )
          })}
          {unassigned.length > 0 && (
            <button onClick={() => setSelectedTech('unassigned')} className={`px-3 py-2.5 text-left border-b border-gray-800/50 transition-colors ${selectedTech === 'unassigned' ? 'bg-gray-800' : 'hover:bg-gray-900'}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <div className="text-xs font-medium text-amber-400">Unassigned</div>
              </div>
              <div className="text-xs text-gray-500 mt-0.5 ml-4">{unassigned.length} jobs</div>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            </div>
          ) : (
            <>
              {technicians.filter(t => !selectedTech || selectedTech === t.id).map(tech => {
                const techJobs = visibleJobs.filter(j => j.technician_id === tech.id)
                  .sort((a, b) => new Date(a.scheduled_start ?? '').getTime() - new Date(b.scheduled_start ?? '').getTime())
                if (techJobs.length === 0) return null
                return (
                  <div key={tech.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-sm font-semibold text-white">{tech.name}</div>
                      <div className="text-xs text-gray-500">{techJobs.length} jobs</div>
                      <div className="text-xs text-gray-600">{tech.phone}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {techJobs.map(job => {
                        const isCashWarning = job.cash_verification_status === 'pending'
                        return (
                          <div key={job.id} className={`bg-gray-900 border rounded-lg p-3 ${isCashWarning ? 'border-amber-500/30' : ['En Route', 'In Progress', 'Arrived'].includes(job.status) ? 'border-emerald-500/30' : 'border-gray-800'}`}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <StatusBadge status={job.status} />
                              {isCashWarning && <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                            </div>
                            <div className="text-sm font-semibold text-white mb-0.5">{job.customer?.name}</div>
                            <div className="text-xs text-amber-400 font-medium mb-2">{job.service_type}</div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />{formatTime(job.scheduled_start ?? '')}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <DollarSign className="w-3 h-3" />
                                {job.final_price ? formatCurrency(job.final_price) : `${formatCurrency(job.estimated_price ?? 0)} est`}
                                {job.payment_link_sent && <span className="text-blue-400 ml-1">· Link sent</span>}
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-800 flex gap-1.5 flex-wrap">
                              {job.status === 'Assigned' && (
                                <button onClick={() => handleStatusUpdate(job.id, 'En Route')} className="text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">En Route</button>
                              )}
                              {job.status === 'En Route' && (
                                <button onClick={() => handleStatusUpdate(job.id, 'Arrived')} className="text-xs text-teal-400 hover:text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded">Arrived</button>
                              )}
                              {['Arrived', 'Assigned', 'En Route'].includes(job.status) && (
                                <button onClick={() => handleStatusUpdate(job.id, 'In Progress')} className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">In Progress</button>
                              )}
                              {job.status === 'In Progress' && (
                                <button onClick={() => handleStatusUpdate(job.id, 'Completed')} className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">Complete</button>
                              )}
                              <StatusBadge status={job.payment_status ?? ''} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {(!selectedTech || selectedTech === 'unassigned') && unassigned.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-sm font-semibold text-amber-400">Unassigned Jobs</div>
                    <div className="text-xs text-gray-500">{unassigned.length} need assignment</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {unassigned.filter(j => statusFilter === 'All' || j.status === statusFilter).map(job => (
                      <div key={job.id} className="bg-gray-900 border border-amber-500/20 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <StatusBadge status={job.status} />
                          <User className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-sm font-semibold text-white mb-0.5">{job.customer?.name}</div>
                        <div className="text-xs text-amber-400 font-medium mb-2">{job.service_type}</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />{formatTime(job.scheduled_start ?? '')}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <DollarSign className="w-3 h-3" />{formatCurrency(job.estimated_price ?? 0)} est
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-800">
                          <select className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none">
                            <option value="">Assign technician...</option>
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {jobs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                  <div className="text-4xl mb-2">📋</div>
                  <div>No jobs scheduled for today</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
