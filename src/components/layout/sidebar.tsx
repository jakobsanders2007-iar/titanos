'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Radio, Calendar, Briefcase, Users, Wrench,
  CreditCard, ShieldCheck, BarChart3, FileText, TrendingUp,
  Bot, Settings, Brain, PhoneCall, KanbanSquare, UserPlus,
  FileSignature, ShoppingCart, GraduationCap, ClipboardList, Gauge,
  MessageSquare, HelpCircle, Target, ListChecks, History, FileStack,
  Building2, Plug, ChevronDown, Activity, Sparkles, Search, Mic, Send,
  ShieldAlert,
} from 'lucide-react'

type NavItem = { href: string; label: string; icon: React.ElementType }
type NavSection = { label?: string; items: NavItem[]; collapsible?: boolean }

// Titan Intelligence OS — the brains that sit above every vertical
const intelligenceSections: NavSection[] = [
  {
    items: [
      { href: '/command', label: 'Command Center', icon: Gauge },
      { href: '/live-ops', label: 'Live Ops Feed', icon: Activity },
      { href: '/command-center', label: 'Titan Agent', icon: Sparkles },
      { href: '/connect-business', label: 'Connect Your Business', icon: Plug },
    ],
  },
  {
    label: 'Brains',
    items: [
      { href: '/memory', label: 'Business Memory', icon: Brain },
      { href: '/why', label: 'Why Analysis', icon: HelpCircle },
      { href: '/goals', label: 'Goals', icon: Target },
      { href: '/action-plan', label: 'Action Plan', icon: ListChecks },
      { href: '/risk-radar', label: 'Risk Radar', icon: ShieldAlert },
      { href: '/replay', label: 'Business Replay', icon: History },
    ],
  },
  {
    label: 'Agent Tools',
    items: [
      { href: '/research', label: 'Research', icon: Search },
      { href: '/voice', label: 'Voice', icon: Mic },
      { href: '/messaging', label: 'Messaging', icon: Send },
      { href: '/executive-chat', label: 'Executive Chat', icon: MessageSquare },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { href: '/connectors', label: 'Connectors', icon: Plug },
      { href: '/timeline', label: 'Business Timeline', icon: History },
      { href: '/documents', label: 'Documents', icon: FileText },
      { href: '/filings', label: '10-K / Filing Reader', icon: FileStack },
      { href: '/industry-brain', label: 'Industry Brain', icon: Building2 },
    ],
  },
]

// Field Service Brain — the locksmith/HVAC vertical, nested inside Titan Intelligence OS
const fieldServiceSection: NavSection = {
  label: 'Field Service Brain',
  collapsible: true,
  items: [
    { href: '/dispatch-center', label: 'Dispatch Center', icon: Activity },
    { href: '/dashboard', label: 'Field Ops Dashboard', icon: LayoutDashboard },
    { href: '/ai-receptionist', label: 'AI Receptionist', icon: PhoneCall },
    { href: '/dispatch', label: 'Dispatch', icon: Radio },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/crm', label: 'CRM', icon: KanbanSquare },
    { href: '/leads', label: 'Leads', icon: UserPlus },
    { href: '/quotes', label: 'Quotes', icon: FileSignature },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/technicians', label: 'Technicians', icon: Wrench },
    { href: '/payments', label: 'Payments', icon: CreditCard },
    { href: '/cash-verification', label: 'Cash Verification', icon: ShieldCheck },
    { href: '/financials', label: 'Financials', icon: BarChart3 },
    { href: '/ceo-packet', label: 'CEO Packet', icon: FileText },
    { href: '/valuation', label: 'Valuation', icon: TrendingUp },
    { href: '/ai-consultant', label: 'AI Consultant', icon: Bot },
    { href: '/ai-shopper', label: 'AI Shopper', icon: ShoppingCart },
  ],
}

const companySection: NavSection = {
  label: 'Company',
  items: [
    { href: '/training', label: 'Training Academy', icon: GraduationCap },
    { href: '/reports', label: 'Reports', icon: ClipboardList },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-1.5 rounded text-sm transition-colors',
        isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {item.label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [fieldServiceOpen, setFieldServiceOpen] = useState(true)

  return (
    <div className="w-60 bg-gray-950 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="px-4 py-4 border-b border-gray-800">
        <Link href="/command" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-gray-950" />
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-none">Titan</div>
            <div className="text-gray-500 text-xs leading-none mt-0.5">Intelligence OS</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {intelligenceSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-3' : ''}>
            {section.label && (
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">{section.label}</div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}
            </div>
          </div>
        ))}

        {/* Field Service Brain — vertical module nested inside Titan Intelligence OS */}
        <div className="mt-4 pt-3 border-t border-gray-800/70">
          <button
            onClick={() => setFieldServiceOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-500/70 hover:text-amber-400 transition-colors"
          >
            <span>{fieldServiceSection.label} · Locksmith Mode</span>
            <ChevronDown className={cn('w-3 h-3 transition-transform', !fieldServiceOpen && '-rotate-90')} />
          </button>
          {fieldServiceOpen && (
            <div className="space-y-0.5">
              {fieldServiceSection.items.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">{companySection.label}</div>
          <div className="space-y-0.5">
            {companySection.items.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}
          </div>
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-gray-800">
        <div className="text-xs text-gray-400 font-medium">Titan Intelligence Demo</div>
        <div className="text-xs text-gray-600 mt-0.5">Connected Mode · Locksmith · Owner</div>
      </div>
    </div>
  )
}
