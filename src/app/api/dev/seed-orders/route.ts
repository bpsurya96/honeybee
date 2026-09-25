
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  try {
    // 1. Fetch random active products
    const { data: products } = await supabase
      .from('products')
      .select('id, price')
      .eq('active', true)
      .limit(2)

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products available to seed' }, { status: 400 })
    }

    // 2. Create order
    const total = products.reduce((sum, p) => sum + p.price, 0)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        parent_id: user.id,
        status: 'paid',
        delivery_status: 'processing',
        subtotal: total,
        total: total,
        payment_ref: 'dev_seed_' + Math.random().toString(36).slice(2, 9)
      })
      .select('id')
      .single()

    if (orderError) throw orderError

    // 3. Create order items
    const orderItemsToInsert = products.map(p => ({
      order_id: order.id,
      product_id: p.id,
      quantity: 1,
      unit_price: p.price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert)

    if (itemsError) throw itemsError

    return NextResponse.json({ success: true, order_id: order.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
