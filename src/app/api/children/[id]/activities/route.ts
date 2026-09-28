import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id: child_id } = params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { activity_id, completed, notes, duration_mins } = body;

    if (!activity_id) return NextResponse.json({ error: 'activity_id required' }, { status: 400 });

    // Verify parent owns child
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('parent_id', user.id)
      .single();

    if (childError || !child) return NextResponse.json({ error: 'Child not found' }, { status: 404 });

    // Upsert child_activities
    const payload: any = {
      child_id,
      activity_id,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };
    
    if (notes !== undefined) payload.notes = notes;
    if (duration_mins !== undefined) payload.duration_mins = duration_mins;

    const { error: upsertError } = await supabase
      .from('child_activities')
      .upsert(payload, { onConflict: 'child_id, activity_id' });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Activity progress error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
