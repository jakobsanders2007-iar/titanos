'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getExpenses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createExpense(payload: {
  company_id: string
  category: string
  amount: number
  date: string
  notes?: string
  recurring?: boolean
}) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from('expenses').insert(payload).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/financials')
  return data
}

export async function updateExpense(id: string, payload: {
  category?: string
  amount?: number
  date?: string
  notes?: string
  recurring?: boolean
}) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('expenses').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/financials')
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/financials')
}
