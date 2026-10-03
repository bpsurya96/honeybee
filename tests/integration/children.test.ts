import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
let userClient: ReturnType<typeof createClient>;
let hackerClient: ReturnType<typeof createClient>;
let userId = '';
let hackerId = '';
let childId = '';

describe('Children CRUD & Authorization Tests', () => {
  beforeAll(async () => {
    const { data: authA } = await adminClient.auth.admin.createUser({
      email: `test_parent_${randomUUID()}@example.com`,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: 'Parent' }
    });
    userId = authA.user!.id;
    await adminClient.from('profiles').upsert([{ id: userId, full_name: 'Parent', role: 'parent' }]);

    const { data: authB } = await adminClient.auth.admin.createUser({
      email: `test_hacker_${randomUUID()}@example.com`,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: 'Hacker' }
    });
    hackerId = authB.user!.id;
    await adminClient.from('profiles').upsert([{ id: hackerId, full_name: 'Hacker', role: 'parent' }]);

    userClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    await userClient.auth.signInWithPassword({ email: authA.user!.email!, password: 'Password123!' });

    hackerClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    await hackerClient.auth.signInWithPassword({ email: authB.user!.email!, password: 'Password123!' });
  }, 20000);

  afterAll(async () => {
    if (userId) await adminClient.auth.admin.deleteUser(userId);
    if (hackerId) await adminClient.auth.admin.deleteUser(hackerId);
  });

  it('should allow parent to create a child', async () => {
    const { data, error } = await userClient
      .from('children')
      .insert({
        name: 'Test Child',
        date_of_birth: '2020-01-01',
        gender: 'female',
        parent_id: userId
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.name).toBe('Test Child');
    childId = data.id;
  });

  it('should prevent hacker from reading the child', async () => {
    const { error } = await hackerClient.from('children').select('*').eq('id', childId).single();
    expect(error).toBeDefined();
    expect(error?.code).toBe('PGRST116');
  });

  it('should prevent hacker from updating the child', async () => {
    const { error } = await hackerClient
      .from('children')
      .update({ name: 'Hacked Name' })
      .eq('id', childId)
      .select()
      .single();
    expect(error).toBeDefined();
    expect(error?.code).not.toBeNull();
  });

  it('should allow parent to update the child', async () => {
    const { data, error } = await userClient
      .from('children')
      .update({ name: 'Updated Name' })
      .eq('id', childId)
      .select()
      .single();
    expect(error).toBeNull();
    expect(data.name).toBe('Updated Name');
  });

  it('should prevent hacker from deleting the child', async () => {
    await hackerClient.from('children').delete().eq('id', childId);
    
    const { data: checkData } = await adminClient.from('children').select('id').eq('id', childId).single();
    expect(checkData?.id).toBe(childId);
  });

  it('should allow parent to soft-delete the child', async () => {
    const { error: updateError } = await adminClient.from('children').update({ is_deleted: true }).eq('id', childId);
    expect(updateError).toBeNull();
    
    const { error } = await userClient.from('children').select('*').eq('id', childId).single();
    expect(error?.code).toBe('PGRST116');
  });
});
