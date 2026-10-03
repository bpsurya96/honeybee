'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function adminLogin(formData: FormData) {
  const email = formData.get('username') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: 'Invalid credentials' };
  }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    // If not admin, sign them out and reject
    await supabase.auth.signOut();
    return { error: 'Unauthorized: Admin access required.' };
  }

  redirect('/admin');
}

export async function adminLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}