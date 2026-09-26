/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const completeSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const parsed = completeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
    }

    const { product_id } = parsed.data

    // Verify child ownership
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', id)
      .eq('parent_id', user.id)
      .single()
    
    if (!child) return NextResponse.json({ error: 'Child not found or not owned by you' }, { status: 403 })

    // Fetch all activities for this product
    const { data: activities } = await supabase
      .from('activities')
      .select('id')
      .eq('product_id', product_id)
      
    if (!activities || activities.length === 0) {
      return NextResponse.json({ success: true, message: 'No activities to complete' })
    }
    
    // Insert/upsert completion records for all activities
    const upserts = activities.map(act => ({
      child_id: id,
      activity_id: act.id,
      completed: true,
      completed_at: new Date().toISOString()
    }))
    
    const { error } = await supabase
      .from('child_activities')
      .upsert(upserts, { onConflict: 'child_id,activity_id' })
      
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
