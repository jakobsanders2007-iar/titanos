import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  'New Lead': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Scheduled': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Assigned': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'En Route': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Arrived': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Cancelled': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'No Show': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Needs Review': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Payment Pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Cash Verification Needed': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Closed': 'bg-gray-700/30 text-gray-500 border-gray-700/30',
  'Paid': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Unpaid': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'Payment Link Sent': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Cash Pending Verification': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Partially Paid': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Refunded': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Disputed': 'bg-red-500/10 text-red-400 border-red-500/20',
  'pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'verified': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'flagged': 'bg-red-500/10 text-red-400 border-red-500/20',
  'unresolved': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = STATUS_STYLES[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', style, className)}>
      {status}
    </span>
  )
}
