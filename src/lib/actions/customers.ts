'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCustomer(payload: {
  company_id: string
  name: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('customers')
    .insert({ ...payload, tags: [] })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/customers')
  return data
}

export async function updateCustomer(id: string, payload: {
  name?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  tags?: string[]
}) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('customers').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/customers')
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('customers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/customers')
}
