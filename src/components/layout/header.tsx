'use client'

import { Bell } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="h-14 border-b border-gray-800 bg-gray-950 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-white text-sm font-semibold">{title}</h1>
        {subtitle && <p className="text-gray-500 text-xs truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
