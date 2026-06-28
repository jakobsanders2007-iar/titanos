'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { JobStatus, PaymentMethod, PaymentStatus, JobSource } from '@/types/database'

export async function getJobs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customer:customers(id, name, phone, email, address),
      technician:technicians(id, name, phone, email)
    `)
    .order('scheduled_start', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getJobsForToday() {
  const supabase = await createClient()
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customer:customers(id, name, phone, email, address),
      technician:technicians(id, name, phone, email)
    `)
    .gte('scheduled_start', todayStart.toISOString())
    .lte('scheduled_start', todayEnd.toISOString())
    .order('scheduled_start', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createJob(formData: {
  company_id: string
  customer_id?: string
  technician_id?: string
  service_type: string
  source: JobSource
  address?: string
  scheduled_start?: string
  estimated_price?: number
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('jobs')
    .insert({ ...formData, created_by: user?.id ?? null })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
  revalidatePath('/dispatch')
  revalidatePath('/dashboard')
  return data
}

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('jobs').update({ status }).eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
  revalidatePath('/dispatch')
  revalidatePath('/dashboard')
}

export async function updateJobPayment(jobId: string, payload: {
  final_price?: number
  amount_collected?: number
  payment_method?: PaymentMethod
  payment_status?: PaymentStatus
  technician_notes?: string
  parts_cost?: number
}) {
  const supabase = await createClient()

  const update: Record<string, unknown> = { ...payload }

  if (payload.payment_method === 'Cash' && payload.amount_collected && payload.amount_collected > 0) {
    update.cash_verification_status = 'pending'
    update.payment_status = 'Cash Pending Verification'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('jobs').update(update).eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
  revalidatePath('/payments')
  revalidatePath('/cash-verification')
  revalidatePath('/dashboard')
}

export async function updateJob(jobId: string, payload: Record<string, unknown>) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('jobs').update(payload).eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
  revalidatePath('/dispatch')
  revalidatePath('/dashboard')
}

export async function deleteJob(jobId: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('jobs').delete().eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidatePath('/jobs')
  revalidatePath('/dispatch')
  revalidatePath('/dashboard')
}
