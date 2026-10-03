import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
let hackerClient: ReturnType<typeof createClient>;
let userId = '';
let hackerId = '';
let orderId = '';

describe('Orders RLS Tests', () => {
  beforeAll(async () => {
    // Create User A
    const { data: authA } = await adminClient.auth.admin.createUser({
      email: `test_orderA_${randomUUID()}@example.com`, password: 'Password123!', email_confirm: true, user_metadata: { full_name: 'Order User A' }
    });
    userId = authA.user!.id;
    await adminClient.from('profiles').upsert([{ id: userId, full_name: 'Order User A', role: 'parent' }]);

    // Create Hacker (User B)
    const { data: authB } = await adminClient.auth.admin.createUser({
      email: `test_hacker_${randomUUID()}@example.com`, password: 'Password123!', email_confirm: true, user_metadata: { full_name: 'Hacker B' }
    });
    hackerId = authB.user!.id;
    await adminClient.from('profiles').upsert([{ id: hackerId, full_name: 'Hacker B', role: 'parent' }]);

    // Insert an order for User A
    const { data: orderData } = await adminClient.from('orders').insert({
      parent_id: userId, shipping_name: 'N/A', shipping_phone: 'N/A', shipping_line1: 'N/A', shipping_city: 'N/A', shipping_state: 'N/A', shipping_pincode: 'N/A', subtotal: 100, total: 100, status: 'pending'
    }).select().single();
    orderId = orderData.id;

    // Login hacker
    hackerClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    await hackerClient.auth.signInWithPassword({ email: authB.user!.email!, password: 'Password123!' });
  }, 20000);

  afterAll(async () => {
    if (userId) await adminClient.auth.admin.deleteUser(userId);
    if (hackerId) await adminClient.auth.admin.deleteUser(hackerId);
  });

  it('should prevent hacker from reading User A order', async () => {
    const { data, error } = await hackerClient.from('orders').select('*').eq('id', orderId).single();
    expect(error).toBeDefined();
    expect(error?.code).toBe('PGRST116');
  });
});
