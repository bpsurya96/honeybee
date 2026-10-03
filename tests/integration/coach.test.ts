import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

describe('AI Coach & Credits DB Tests', () => {
  let userId = '';

  beforeAll(async () => {
    const { data: authA } = await adminClient.auth.admin.createUser({
      email: `test_coach_${randomUUID()}@example.com`,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: 'Coach Tester' }
    });
    userId = authA.user!.id;
    
    await adminClient.from('profiles').upsert({ id: userId, full_name: 'Coach Tester', role: 'parent' });
    await adminClient.from('ai_credit_accounts').upsert({ id: userId, balance: 10 });
  }, 20000);

  afterAll(async () => {
    if (userId) await adminClient.auth.admin.deleteUser(userId);
  });

  it('should successfully execute deduct_ai_credits RPC', async () => {
    const { data: initialAccount } = await adminClient.from('ai_credit_accounts').select('balance').eq('id', userId).single();
    expect(initialAccount.balance).toBe(10);

    const idempotencyKey = `chat-test-${userId}-${Date.now()}`;
    const { error: deductError } = await adminClient.rpc('deduct_ai_credits', {
      p_parent_id: userId,
      p_amount: 1,
      p_description: 'Test Deduction',
      p_idem_key: idempotencyKey
    });

    expect(deductError).toBeNull();

    const { data: finalAccount } = await adminClient.from('ai_credit_accounts').select('balance').eq('id', userId).single();
    expect(finalAccount.balance).toBe(9);
    
    // Check transactions table
    const { data: tx } = await adminClient.from('ai_credit_transactions').select('*').eq('idempotency_key', idempotencyKey).single();
    expect(tx).toBeDefined();
    expect(tx.amount).toBe(-1);
  });
});
