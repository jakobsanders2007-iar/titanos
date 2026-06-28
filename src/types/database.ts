export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type JobStatus =
  | 'New Lead' | 'Scheduled' | 'Assigned' | 'En Route' | 'Arrived'
  | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show'
  | 'Needs Review' | 'Payment Pending' | 'Cash Verification Needed' | 'Closed'

export type PaymentMethod = 'Cash' | 'Card' | 'Payment Link' | 'Zelle' | 'Venmo' | 'Check' | 'Other'
export type PaymentStatus =
  | 'Unpaid' | 'Payment Link Sent' | 'Partially Paid' | 'Paid'
  | 'Cash Pending Verification' | 'Refunded' | 'Disputed'
export type CashVerificationStatus = 'pending' | 'verified' | 'flagged' | 'unresolved'
export type UserRole = 'owner' | 'dispatcher' | 'technician' | 'accountant' | 'ai_agent'
export type JobSource = 'Phone' | 'AI Call Agent' | 'Website' | 'Manual' | 'Referral' | 'Google Business Profile' | 'Yelp' | 'Other'

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          website: string | null
          address: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          company_id: string | null
          full_name: string | null
          email: string | null
          role: UserRole
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      customers: {
        Row: {
          id: string
          company_id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      technicians: {
        Row: {
          id: string
          company_id: string
          name: string
          phone: string | null
          email: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['technicians']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['technicians']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          customer_id: string | null
          technician_id: string | null
          service_type: string
          source: JobSource
          status: JobStatus
          address: string | null
          scheduled_start: string | null
          scheduled_end: string | null
          estimated_price: number | null
          final_price: number | null
          amount_collected: number
          payment_method: PaymentMethod | null
          payment_status: PaymentStatus
          payment_link_sent: boolean
          payment_link_url: string | null
          payment_link_sent_at: string | null
          paid_at: string | null
          cash_verification_status: CashVerificationStatus | null
          cash_verified_by: string | null
          cash_verified_at: string | null
          parts_cost: number
          labor_cost_estimate: number | null
          notes: string | null
          technician_notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
      payments: {
        Row: {
          id: string
          company_id: string
          job_id: string | null
          customer_id: string | null
          amount: number
          method: PaymentMethod | null
          status: string
          provider: string | null
          provider_payment_id: string | null
          payment_link_url: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      cash_verifications: {
        Row: {
          id: string
          company_id: string
          job_id: string
          technician_id: string | null
          amount_reported: number
          owner_verified_amount: number | null
          status: CashVerificationStatus
          technician_note: string | null
          owner_note: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['cash_verifications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cash_verifications']['Insert']>
      }
      expenses: {
        Row: {
          id: string
          company_id: string
          category: string
          amount: number
          date: string
          notes: string | null
          recurring: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
      service_types: {
        Row: {
          id: string
          company_id: string
          name: string
          default_price: number | null
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_types']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['service_types']['Insert']>
      }
      ceo_packets: {
        Row: {
          id: string
          company_id: string
          month: number
          year: number
          revenue: number
          jobs_completed: number
          average_ticket: number
          cash_pending: number
          ebitda_estimate: number
          valuation_low: number
          valuation_base: number
          valuation_high: number
          summary: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ceo_packets']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ceo_packets']['Insert']>
      }
      activity_log: {
        Row: {
          id: string
          company_id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['activity_log']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience row types
export type Company = Database['public']['Tables']['companies']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Technician = Database['public']['Tables']['technicians']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type CashVerification = Database['public']['Tables']['cash_verifications']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ServiceType = Database['public']['Tables']['service_types']['Row']
export type CeoPacket = Database['public']['Tables']['ceo_packets']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']

export type JobWithRelations = Job & {
  customer: Customer | null
  technician: Technician | null
}
