'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCashPendingJobs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customer:customers(id, name, phone),
      technician:technicians(id, name, phone)
    `)
    .eq('cash_verification_status', 'pending')
    .order('scheduled_start', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function verifyCashJob(jobId: string, ownerNote?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('jobs')
    .update({
      cash_verification_status: 'verified',
      cash_verified_by: user?.id ?? null,
      cash_verified_at: new Date().toISOString(),
      payment_status: 'Paid',
    })
    .eq('id', jobId)

  if (error) throw new Error(error.message)

  // Log activity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: job } = await (supabase as any).from('jobs').select('company_id').eq('id', jobId).single()
  if (job) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('activity_log').insert({
      company_id: job.company_id,
      user_id: user?.id ?? null,
      action: 'cash_verified',
      entity_type: 'job',
      entity_id: jobId,
      metadata: ownerNote ? { note: ownerNote } : null,
    })
  }

  revalidatePath('/cash-verification')
  revalidatePath('/payments')
  revalidatePath('/dashboard')
}

export async function flagCashJob(jobId: string, ownerNote?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('jobs')
    .update({
      cash_verification_status: 'flagged',
      payment_status: 'Disputed',
    })
    .eq('id', jobId)

  if (error) throw new Error(error.message)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: job } = await (supabase as any).from('jobs').select('company_id').eq('id', jobId).single()
  if (job) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('activity_log').insert({
      company_id: job.company_id,
      user_id: user?.id ?? null,
      action: 'cash_flagged',
      entity_type: 'job',
      entity_id: jobId,
      metadata: ownerNote ? { note: ownerNote } : null,
    })
  }

  revalidatePath('/cash-verification')
  revalidatePath('/dashboard')
}
