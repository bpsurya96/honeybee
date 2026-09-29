/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */

'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveOrder(formData: FormData) {
  const supabase = await createAdminClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const delivery_status = formData.get('delivery_status') as string
  const payment_status = formData.get('payment_status') as string
  const mobile_number = formData.get('mobile_number') as string
  const delivery_address = formData.get('delivery_address') as string
  const delivery_city = formData.get('delivery_city') as string
  const delivery_state = formData.get('delivery_state') as string
  const delivery_pincode = formData.get('delivery_pincode') as string

  const { error } = await supabase.from('orders').update({
    status, delivery_status, payment_status, mobile_number, delivery_address, delivery_city, delivery_state, delivery_pincode
  }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/admin/orders/${id}`)
  revalidatePath('/admin/orders')
  revalidatePath('/orders')
  revalidatePath(`/orders/${id}`)
  return { success: true }
}

export async function getOrderDetails(id: string) {
  const supabase = await createAdminClient()
  const { data: order } = await supabase.from('orders').select('*, children(*), profiles(*), items:order_items(*, product:products(*))').eq('id', id).single()
  return order
}
