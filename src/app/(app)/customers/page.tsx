'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { DEMO_CUSTOMERS, DEMO_JOBS } from '@/lib/demo-data'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Users, Phone, Mail, MapPin } from 'lucide-react'

export default function CustomersPage() {
  const [search, setSearch] = useState('')

  const customersWithStats = DEMO_CUSTOMERS.map(c => {
    const jobs = DEMO_JOBS.filter(j => j.customer_id === c.id)
    const completed = jobs.filter(j => j.status === 'Completed' && j.final_price)
    const ltv = completed.reduce((s, j) => s + (j.final_price || 0), 0)
    const lastJob = jobs.sort((a, b) => new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime())[0]
    return { ...c, jobCount: jobs.length, ltv, lastJobDate: lastJob?.scheduled_start }
  }).filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
  }).sort((a, b) => b.ltv - a.ltv)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Customers"
        subtitle={`${DEMO_CUSTOMERS.length} total customers`}
        actions={
          <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
            + New Customer
          </button>
        }
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 py-3 border-b border-gray-800 flex-shrink-0">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-950 border-b border-gray-800">
              <tr>
                {['Customer', 'Phone', 'Email', 'Address', 'Jobs', 'Lifetime Value', 'Last Job'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customersWithStats.map(c => (
                <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-400 flex-shrink-0">
                        {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="font-medium text-white">{c.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-400">{c.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{c.address}</td>
                  <td className="px-4 py-3 text-gray-300 tabular-nums">{c.jobCount}</td>
                  <td className="px-4 py-3">
                    <span className="text-white font-semibold tabular-nums">{formatCurrency(c.ltv)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.lastJobDate ? formatDate(c.lastJobDate) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
