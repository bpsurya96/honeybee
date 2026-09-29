/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */

'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveCustomer(formData: FormData) {
  const supabase = await createAdminClient()
  const id = formData.get('id') as string
  const full_name = formData.get('full_name') as string
  const ai_credits = parseFloat(formData.get('ai_credits') as string)

  const { error } = await supabase.from('profiles').update({ full_name, ai_credits }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/admin/customers/${id}`)
  revalidatePath('/admin/customers')
  revalidatePath('/profile')
  return { success: true }
}

export async function saveChild(formData: FormData) {
  const supabase = await createAdminClient()
  const id = formData.get('id') as string
  const customer_id = formData.get('customer_id') as string
  const name = formData.get('name') as string
  const gender = formData.get('gender') as string
  const date_of_birth = formData.get('date_of_birth') as string

  const { error } = await supabase.from('children').update({ name, gender, date_of_birth }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/admin/customers/${customer_id}`)
  revalidatePath(`/children/${id}`)
  return { success: true }
}
