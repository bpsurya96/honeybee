import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: '.env' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('Authentication & Profile Integration', () => {
  let testEmail = '';
  let testPassword = 'Password123!';
  let userId = '';

  beforeAll(() => {
    testEmail = `test_user_${randomUUID()}@example.com`;
  });

  afterAll(async () => {
    if (userId) {
      await supabase.auth.admin.deleteUser(userId);
    }
  });

  it('should create a user, which automatically creates a profile and ai_credit_account', async () => {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    });

    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();
    if (!authData.user) throw new Error('User not created');
    
    userId = authData.user.id;
    expect(authData.user.email).toBe(testEmail);

    // Wait a brief moment for triggers
    await new Promise(r => setTimeout(r, 1000));
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(profileError).toBeNull();
    expect(profileData).toBeDefined();
    expect(profileData.id).toBe(userId);
    expect(profileData.role).toBe('parent');
    expect(profileData.full_name).toBe('Test User');

    const { data: creditData, error: creditError } = await supabase
      .from('ai_credit_accounts')
      .select('*')
      .eq('id', userId)
      .single();
      
    expect(creditError).toBeNull();
    expect(creditData).toBeDefined();
    expect(creditData.id).toBe(userId);
    expect(creditData.balance).toBe(0);
  });
});
