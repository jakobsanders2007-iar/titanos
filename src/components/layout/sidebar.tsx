'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Radio, Calendar, Briefcase, Users, Wrench,
  CreditCard, ShieldCheck, BarChart3, FileText, TrendingUp,
  Bot, Settings, Lock
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dispatch', label: 'Dispatch', icon: Radio },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/technicians', label: 'Technicians', icon: Wrench },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/cash-verification', label: 'Cash Verification', icon: ShieldCheck },
  { href: '/financials', label: 'Financials', icon: BarChart3 },
  { href: '/ceo-packet', label: 'CEO Packet', icon: FileText },
  { href: '/valuation', label: 'Valuation', icon: TrendingUp },
  { href: '/ai-consultant', label: 'AI Consultant', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-56 bg-gray-950 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="px-4 py-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-gray-950" />
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-none">Titan</div>
            <div className="text-gray-500 text-xs leading-none mt-0.5">Locksmith OS</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-gray-800">
        <div className="text-xs text-gray-400 font-medium">Titan Locksmith Demo</div>
        <div className="text-xs text-gray-600 mt-0.5">Owner · Demo Mode</div>
      </div>
    </div>
  )
}
