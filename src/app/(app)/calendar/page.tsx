'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatusBadge } from '@/components/ui/status-badge'
import { DEMO_JOBS, DEMO_CUSTOMERS, DEMO_TECHNICIANS } from '@/lib/demo-data'
import { formatCurrency, formatTime } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

const customerMap = Object.fromEntries(DEMO_CUSTOMERS.map(c => [c.id, c]))
const techMap = Object.fromEntries(DEMO_TECHNICIANS.map(t => [t.id, t]))

const STATUS_COLORS: Record<string, string> = {
  'Completed': 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  'In Progress': 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  'En Route': 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  'Scheduled': 'bg-purple-500/20 border-purple-500/40 text-purple-300',
  'Assigned': 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
  'Cancelled': 'bg-gray-500/20 border-gray-500/40 text-gray-400',
  'No Show': 'bg-red-500/20 border-red-500/40 text-red-300',
  'New Lead': 'bg-blue-500/20 border-blue-500/40 text-blue-300',
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'month'>('week')

  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  const prevWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }
  const nextWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }

  const getJobsForDay = (day: Date) => {
    const start = new Date(day); start.setHours(0, 0, 0, 0)
    const end = new Date(day); end.setHours(23, 59, 59, 999)
    return DEMO_JOBS.filter(j => {
      const d = new Date(j.scheduled_start)
      return d >= start && d <= end
    }).sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
  }

  const isToday = (day: Date) => {
    const t = new Date()
    return day.getDate() === t.getDate() && day.getMonth() === t.getMonth() && day.getFullYear() === t.getFullYear()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Calendar"
        subtitle="Job schedule view"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded overflow-hidden border border-gray-800">
              {(['week', 'month'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs capitalize transition-colors ${view === v ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={prevWeek} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              >
                Today
              </button>
              <button onClick={nextWeek} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      />

      {/* Week range label */}
      <div className="px-6 py-2 border-b border-gray-800 flex-shrink-0">
        <div className="text-sm text-gray-400">
          {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Week grid */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="grid grid-cols-7 min-w-[700px] h-full">
          {weekDays.map((day, i) => {
            const jobs = getJobsForDay(day)
            const todayClass = isToday(day)
            return (
              <div key={i} className={`border-r border-gray-800 last:border-r-0 flex flex-col ${todayClass ? 'bg-amber-500/3' : ''}`}>
                {/* Day header */}
                <div className={`px-3 py-2 border-b border-gray-800 flex-shrink-0 ${todayClass ? 'bg-amber-500/10' : ''}`}>
                  <div className="text-xs text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className={`text-lg font-semibold ${todayClass ? 'text-amber-400' : 'text-white'}`}>
                    {day.getDate()}
                  </div>
                  {jobs.length > 0 && <div className="text-xs text-gray-500">{jobs.length} jobs</div>}
                </div>

                {/* Jobs */}
                <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
                  {jobs.map(job => {
                    const customer = customerMap[job.customer_id]
                    const tech = job.technician_id ? techMap[job.technician_id] : null
                    const colorClass = STATUS_COLORS[job.status] || 'bg-gray-800 border-gray-700 text-gray-300'
                    return (
                      <div
                        key={job.id}
                        className={`border rounded p-2 cursor-pointer hover:opacity-90 transition-opacity ${colorClass}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="text-xs font-medium">{formatTime(job.scheduled_start)}</span>
                        </div>
                        <div className="text-xs font-semibold truncate">{customer?.name}</div>
                        <div className="text-xs opacity-75 truncate">{job.service_type}</div>
                        {tech && <div className="text-xs opacity-60 truncate mt-0.5">{tech.name.split(' ')[0]}</div>}
                        <div className="text-xs font-medium mt-0.5">
                          {job.final_price ? formatCurrency(job.final_price) : `${formatCurrency(job.estimated_price)} est`}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
