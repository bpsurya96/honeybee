import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // 1. Create a fake "Order"
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ parent_id: user.id, status: 'paid', subtotal: 0, total: 0 })
      .select().single()
      
    if (orderError) throw orderError

    // 2. Create Order Item
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({ order_id: order.id, product_id: productId, unit_price: 0 })
      
    if (itemError) throw itemError

    return NextResponse.json({ success: true, order_id: order.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
