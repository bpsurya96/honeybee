'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NEW_BOOK_AI_CREDIT } from '@/lib/config'

export async function saveOrder(formData: FormData) {
  const supabase = await createAdminClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const payment_status = formData.get('payment_status') as string
  const shipping_phone = formData.get('shipping_phone') as string
  const shipping_line1 = formData.get('shipping_line1') as string
  const shipping_city = formData.get('shipping_city') as string
  const shipping_state = formData.get('shipping_state') as string
  const shipping_pincode = formData.get('shipping_pincode') as string

  // Get current order to see if payment status is transitioning to paid
  const { data: existingOrder } = await supabase.from('orders').select('payment_status, parent_id').eq('id', id).single()

  const { error } = await supabase.from('orders').update({
    status, 
    payment_status, 
    shipping_phone, 
    shipping_line1, 
    shipping_city, 
    shipping_state, 
    shipping_pincode
  }).eq('id', id)
  
  if (error) return { error: error.message }

  // Security Fix P0-4 / P0-7: Award AI credits ONLY when payment is actually paid
  if (existingOrder && existingOrder.payment_status !== 'paid' && payment_status === 'paid') {
    // Determine if there's a book (for now, any order yields credit)
    const idempotencyKey = `award-order-${id}-${existingOrder.parent_id}`
    await supabase.rpc('award_ai_credits', {
      p_parent_id: existingOrder.parent_id,
      p_amount: NEW_BOOK_AI_CREDIT,
      p_description: 'Credit for Book Purchase',
      p_order_id: id,
      p_idem_key: idempotencyKey
    })
  }

  revalidatePath(`/admin/orders/${id}`)
  revalidatePath('/admin/orders')
  revalidatePath('/orders')
  revalidatePath(`/orders/${id}`)
  return { success: true }
}

export async function getOrderDetails(id: string) {
  const supabase = await createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_children(child_id, children(*)), profiles(*), items:order_items(*, product:products(*))')
    .eq('id', id)
    .single()
  return order
}