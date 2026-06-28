export type JobStatus =
  | 'New Lead' | 'Scheduled' | 'Assigned' | 'En Route'
  | 'Arrived' | 'In Progress' | 'Completed' | 'Cancelled'
  | 'No Show' | 'Needs Review' | 'Payment Pending'
  | 'Cash Verification Needed' | 'Closed'

export type PaymentMethod = 'Cash' | 'Card' | 'Payment Link' | 'Zelle' | 'Venmo' | 'Check' | 'Other'
export type PaymentStatus = 'Unpaid' | 'Payment Link Sent' | 'Partially Paid' | 'Paid' | 'Cash Pending Verification' | 'Refunded' | 'Disputed'
export type CashVerificationStatus = 'pending' | 'verified' | 'flagged' | 'unresolved'
export type UserRole = 'owner' | 'dispatcher' | 'technician' | 'accountant' | 'ai_agent'

export interface Job {
  id: string
  company_id: string
  customer_id: string
  technician_id: string | null
  service_type: string
  source: string
  status: JobStatus
  address: string
  scheduled_start: string
  scheduled_end?: string
  estimated_price: number
  final_price: number | null
  amount_collected: number
  payment_method: PaymentMethod | null
  payment_status: PaymentStatus
  payment_link_sent: boolean
  payment_link_url?: string
  payment_link_sent_at?: string
  paid_at?: string
  cash_verification_status: CashVerificationStatus | null
  cash_verified_by?: string
  cash_verified_at?: string
  parts_cost: number
  labor_cost_estimate?: number
  notes: string
  technician_notes: string
  created_by: string
  created_at: string
  updated_at: string
  customer?: Customer
  technician?: Technician
}

export interface Customer {
  id: string
  company_id: string
  name: string
  phone: string
  email: string
  address: string
  notes: string
  tags: string[]
  created_at: string
}

export interface Technician {
  id: string
  company_id: string
  name: string
  phone: string
  email: string
  active: boolean
  created_at: string
}

export interface Expense {
  id: string
  company_id: string
  category: string
  amount: number
  date: string
  notes: string
  recurring: boolean
  created_at: string
}
