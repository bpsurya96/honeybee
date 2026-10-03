/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // SECURITY FIX: Only admins can use this free bypass
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    // We must use the admin client since regular users can't create 'paid' orders or manipulate credits without payment
    const adminSupabase = await createAdminClient()

    // 1. Fetch product details
    const { data: product } = await adminSupabase
      .from('products')
      .select('name, price')
      .eq('id', productId)
      .single()

    if (!product) throw new Error('Product not found')

    const idempotencyKey = `add-to-library-${user.id}-${productId}-${Date.now()}`

    // 2. Use our atomic checkout transaction RPC (requires child_ids array, we pass empty here, or they assign later)
    // Actually, since we don't have children here, we just create the order and order_items
    const { data: orderId, error: orderError } = await adminSupabase.rpc('create_order_transaction', {
      p_parent_id: user.id,
      p_idempotency_key: idempotencyKey,
      p_shipping_name: 'Admin Added',
      p_shipping_phone: 'N/A',
      p_shipping_line1: 'N/A',
      p_shipping_city: 'N/A',
      p_shipping_state: 'N/A',
      p_shipping_pincode: 'N/A',
      p_subtotal: 0,
      p_total: 0,
      p_items: [{
        product_id: productId,
        product_name: product.name,
        unit_price: 0,
        quantity: 1
      }],
      p_child_ids: []
    })
      
    if (orderError) throw orderError

    // Mark as paid since it's an admin bypass
    await adminSupabase.from('orders').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', orderId)

    return NextResponse.json({ success: true, order_id: orderId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}