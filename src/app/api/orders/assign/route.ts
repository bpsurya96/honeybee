/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const assignSchema = z.object({
  order_item_id: z.string().uuid('Invalid order item ID'),
  child_id: z.string().uuid('Invalid child ID'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const parsed = assignSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
    }

    const { order_item_id, child_id } = parsed.data

    // Security check 1: Child belongs to user
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('parent_id', user.id)
      .single()
    
    if (!child) return NextResponse.json({ error: 'Child not found or not owned by you' }, { status: 403 })

    // Security check 2: Order Item belongs to user
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('id, orders!inner(parent_id)')
      .eq('id', order_item_id)
      .single()
    
    if (!orderItem || (orderItem.orders as any).parent_id !== user.id) {
      return NextResponse.json({ error: 'Order item not found or not owned by you' }, { status: 403 })
    }

    // Upsert assignment
    const { data, error } = await supabase
      .from('child_products')
      .upsert({
        order_item_id,
        child_id,
        active: true
      }, { onConflict: 'child_id,order_item_id' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
