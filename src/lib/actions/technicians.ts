'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTechnicians() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('technicians')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createTechnician(payload: {
  company_id: string
  name: string
  phone?: string
  email?: string
}) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('technicians')
    .insert({ ...payload, active: true })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/technicians')
  return data
}

export async function updateTechnician(id: string, payload: {
  name?: string
  phone?: string
  email?: string
  active?: boolean
}) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('technicians').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/technicians')
}

export async function deleteTechnician(id: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('technicians').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/technicians')
}
