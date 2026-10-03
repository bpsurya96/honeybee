import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const adminClient = createClient(supabaseUrl, supabaseServiceKey);
let userAClient: ReturnType<typeof createClient>;
let userAId = '';
let userBId = '';

describe('Profile RLS Security Tests', () => {
  beforeAll(async () => {
    const { data: authA } = await adminClient.auth.admin.createUser({
      email: `test_user_A_${randomUUID()}@example.com`,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: 'User A' }
    });
    userAId = authA.user!.id;

    const { data: authB } = await adminClient.auth.admin.createUser({
      email: `test_user_B_${randomUUID()}@example.com`,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: 'User B' }
    });
    userBId = authB.user!.id;
    
    // Fallback: manually create profiles if triggers are lagging on the staging DB
    await adminClient.from('profiles').upsert([
      { id: userAId, full_name: 'User A', role: 'parent' },
      { id: userBId, full_name: 'User B', role: 'parent' }
    ]);

    userAClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    await userAClient.auth.signInWithPassword({
      email: authA.user!.email!,
      password: 'Password123!',
    });
    
  }, 20000);

  afterAll(async () => {
    if (userAId) await adminClient.auth.admin.deleteUser(userAId);
    if (userBId) await adminClient.auth.admin.deleteUser(userBId);
  });

  it('should prevent User A from reading User B profile', async () => {
    const { error } = await userAClient.from('profiles').select('*').eq('id', userBId).single();
    expect(error).toBeDefined();
    expect(error?.code).toBe('PGRST116');
  });

  it('should prevent User A from updating User B profile', async () => {
    const { error } = await userAClient.from('profiles').update({ full_name: 'Hacked' }).eq('id', userBId).select().single();
    expect(error).toBeDefined();
    expect(error?.code).not.toBeNull();
    
    const { data: checkData, error: checkError } = await adminClient.from('profiles').select('full_name').eq('id', userBId).single();
    expect(checkError).toBeNull();
    expect(checkData?.full_name).toBe('User B');
  });
});
