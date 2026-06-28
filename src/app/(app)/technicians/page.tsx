'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { getTechnicians } from '@/lib/actions/technicians'
import { getJobs } from '@/lib/actions/jobs'
import { formatCurrency } from '@/lib/utils'
import { Phone, Mail, DollarSign, AlertCircle, Briefcase, Loader2 } from 'lucide-react'
import type { Technician } from '@/types/database'

type TechStats = Technician & {
  jobCount: number
  completedCount: number
  revenue: number
  avgTicket: number
  cashCollected: number
  cashPending: number
  activeJobs: number
}

export default function TechniciansPage() {
  const [techStats, setTechStats] = useState<TechStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getTechnicians(), getJobs()])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(([techs, allJobs]: [any[], any[]]) => {
        const stats: TechStats[] = techs.map((tech: any) => {
          const techJobs = allJobs.filter((j: any) => j.technician_id === tech.id)
          const completed = techJobs.filter(j => j.status === 'Completed' && j.final_price)
          const revenue = completed.reduce((s, j) => s + (j.final_price || 0), 0)
          const cashCollected = techJobs.filter(j => j.payment_method === 'Cash').reduce((s, j) => s + (j.amount_collected || 0), 0)
          const cashPending = techJobs.filter(j => j.cash_verification_status === 'pending').reduce((s, j) => s + (j.amount_collected || 0), 0)
          const avgTicket = completed.length ? revenue / completed.length : 0
          const activeJobs = techJobs.filter(j => ['Scheduled', 'Assigned', 'En Route', 'In Progress', 'Arrived'].includes(j.status)).length
          return { ...tech, jobCount: techJobs.length, completedCount: completed.length, revenue, avgTicket, cashCollected, cashPending, activeJobs }
        })
        setTechStats(stats)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Header title="Technicians" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Header title="Technicians" subtitle="" />
        <div className="flex-1 flex items-center justify-center text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Technicians"
        subtitle={`${techStats.length} technicians`}
        actions={
          <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
            + Add Technician
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {techStats.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-gray-600 text-sm">No technicians yet</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {techStats.map((tech, i) => (
                <div key={tech.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-300'}`}>
                        {tech.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{tech.name}</div>
                        <div className={`text-xs px-1.5 py-0.5 rounded inline-block mt-0.5 ${tech.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                          {tech.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    {tech.cashPending > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formatCurrency(tech.cashPending)} pending
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-950/50 rounded p-2.5">
                      <div className="text-xs text-gray-500 mb-1">Revenue</div>
                      <div className="text-lg font-semibold text-white tabular-nums">{formatCurrency(tech.revenue)}</div>
                    </div>
                    <div className="bg-gray-950/50 rounded p-2.5">
                      <div className="text-xs text-gray-500 mb-1">Jobs Done</div>
                      <div className="text-lg font-semibold text-white tabular-nums">{tech.completedCount}</div>
                    </div>
                    <div className="bg-gray-950/50 rounded p-2.5">
                      <div className="text-xs text-gray-500 mb-1">Avg Ticket</div>
                      <div className="text-lg font-semibold text-white tabular-nums">{formatCurrency(tech.avgTicket)}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Phone className="w-3.5 h-3.5" />{tech.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="w-3.5 h-3.5" />{tech.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <DollarSign className="w-3.5 h-3.5" />Cash collected: {formatCurrency(tech.cashCollected)}
                      {tech.cashPending > 0 && <span className="text-amber-400">({formatCurrency(tech.cashPending)} unverified)</span>}
                    </div>
                    {tech.activeJobs > 0 && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <Briefcase className="w-3.5 h-3.5" />{tech.activeJobs} active job{tech.activeJobs !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-800">
                <div className="text-sm font-medium text-white">Performance Comparison</div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Technician', 'Total Jobs', 'Completed', 'Revenue', 'Avg Ticket', 'Cash Collected', 'Unverified Cash'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...techStats].sort((a, b) => b.revenue - a.revenue).map((tech, i) => (
                    <tr key={tech.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${i === 0 ? 'text-amber-400' : 'text-gray-500'}`}>#{i + 1}</span>
                          <span className="text-white font-medium">{tech.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 tabular-nums">{tech.jobCount}</td>
                      <td className="px-4 py-3 text-gray-300 tabular-nums">{tech.completedCount}</td>
                      <td className="px-4 py-3 text-white font-semibold tabular-nums">{formatCurrency(tech.revenue)}</td>
                      <td className="px-4 py-3 text-gray-300 tabular-nums">{formatCurrency(tech.avgTicket)}</td>
                      <td className="px-4 py-3 text-gray-300 tabular-nums">{formatCurrency(tech.cashCollected)}</td>
                      <td className="px-4 py-3">
                        {tech.cashPending > 0 ? (
                          <span className="text-amber-400 font-medium tabular-nums">{formatCurrency(tech.cashPending)}</span>
                        ) : (
                          <span className="text-emerald-400">Clear</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
