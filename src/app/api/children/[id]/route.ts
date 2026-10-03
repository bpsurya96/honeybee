import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    
    const adminSupabase = await createAdminClient();
    
    const { data: child, error: fetchErr } = await adminSupabase
      .from('children')
      .select('id')
      .eq('id', id)
      .eq('parent_id', user.id)
      .single();
      
    if (fetchErr || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    const { error: updateErr } = await adminSupabase
      .from('children')
      .update({ is_deleted: true })
      .eq('id', id);

    if (updateErr) {
      console.error(updateErr)
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal' }, { status: 500 })
  }
}