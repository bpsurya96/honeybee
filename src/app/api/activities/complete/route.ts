
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const completeSchema = z.object({
  activity_id: z.string().uuid(),
  child_id: z.string().uuid(),
  completed: z.boolean(),
  duration_mins: z.number().nullable().optional()
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const parsed = completeSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 })

    const { activity_id, child_id, completed, duration_mins } = parsed.data

    // Security check: Verify parent owns the child
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('parent_id', user.id)
      .single()
    
    if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 403 })

    if (completed) {
      const { data, error } = await supabase
        .from('child_activities')
        .upsert({
          child_id,
          activity_id,
          completed: true,
          completed_at: new Date().toISOString(),
          duration_mins: duration_mins || null
        }, { onConflict: 'child_id,activity_id' })
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ data })
    } else {
      const { error } = await supabase
        .from('child_activities')
        .delete()
        .eq('child_id', child_id)
        .eq('activity_id', activity_id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
