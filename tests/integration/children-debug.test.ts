import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const adminClient = createClient(supabaseUrl, supabaseServiceKey);
let userClient: ReturnType<typeof createClient>;
let userId = '';

describe('Children DB Tests', () => {
  beforeAll(async () => {
    const { data: authA } = await adminClient.auth.admin.createUser({
      email: `test_parent_${randomUUID()}@example.com`,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: 'Parent' }
    });
    userId = authA.user!.id;
    await adminClient.from('profiles').upsert([{ id: userId, full_name: 'Parent', role: 'parent' }]);

    userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    const { error: signInError } = await userClient.auth.signInWithPassword({ email: authA.user!.email!, password: 'Password123!' });
    if (signInError) throw new Error("SignIn error: " + signInError.message);
  }, 20000);

  afterAll(async () => {
    if (userId) await adminClient.auth.admin.deleteUser(userId);
  });

  it('should allow parent to create a child', async () => {
    const { data: sessionData } = await userClient.auth.getSession();
    console.log("Session UID:", sessionData.session?.user.id, "Target UID:", userId);
    
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

    if (error) console.error("Insert error:", error);

    expect(error).toBeNull();
  });
});
