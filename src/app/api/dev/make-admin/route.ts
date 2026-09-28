import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Use service role to bypass RLS for admin elevation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.from('admin_users').insert({ user_id: user.id });
    
    if (error && error.code !== '23505') throw error; // Ignore duplicate if already admin

    return NextResponse.json({ success: true, message: 'You are now an admin!' });
  } catch (err: any) {
    console.error('Make Admin error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
