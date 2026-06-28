import { cn, formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  format?: 'currency' | 'number' | 'percent' | 'raw'
  change?: number
  subtitle?: string
  className?: string
  highlight?: boolean
  warning?: boolean
}

export function StatCard({ title, value, format = 'raw', change, subtitle, className, highlight, warning }: StatCardProps) {
  const formatted = format === 'currency' ? formatCurrency(Number(value))
    : format === 'percent' ? `${Number(value).toFixed(1)}%`
    : format === 'number' ? Number(value).toLocaleString()
    : value

  return (
    <div className={cn(
      'bg-gray-900 border border-gray-800 rounded-lg p-4',
      highlight && 'border-amber-500/30 bg-amber-500/5',
      warning && 'border-red-500/30 bg-red-500/5',
      className
    )}>
      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{title}</div>
      <div className={cn(
        'text-2xl font-semibold tabular-nums',
        highlight ? 'text-amber-400' : warning ? 'text-red-400' : 'text-white'
      )}>
        {formatted}
      </div>
      {(change !== undefined || subtitle) && (
        <div className="flex items-center gap-1 mt-1.5">
          {change !== undefined && (
            <>
              {change > 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                : change < 0 ? <TrendingDown className="w-3 h-3 text-red-400" />
                : <Minus className="w-3 h-3 text-gray-500" />}
              <span className={cn(
                'text-xs font-medium',
                change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-gray-500'
              )}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </>
          )}
          {subtitle && <span className="text-xs text-gray-600">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
