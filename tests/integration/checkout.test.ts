import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

describe('Checkout Database RPC Tests', () => {
  let userId = '';
  let productId = '';

  beforeAll(async () => {
    // Create a user
    const { data: authA } = await adminClient.auth.admin.createUser({
      email: `test_checkout_${randomUUID()}@example.com`,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: 'Checkout Tester' }
    });
    userId = authA.user!.id;
    await adminClient.from('profiles').upsert([{ id: userId, full_name: 'Checkout Tester', role: 'parent' }]);

    // Fetch a product
    const { data: productData } = await adminClient.from('products').select('id, price, name').limit(1).single();
    if (productData) {
      productId = productData.id;
    }
  }, 20000);

  afterAll(async () => {
    if (userId) await adminClient.auth.admin.deleteUser(userId);
  });

  it('should successfully execute create_order_transaction RPC', async () => {
    expect(productId).toBeTruthy();

    const idempotencyKey = `chk-${userId}-${Date.now()}`;
    const items = [
      { product_id: productId, product_name: 'Test Product', quantity: 2, unit_price: 1000 }
    ];

    const { data: orderId, error: txError } = await adminClient.rpc('create_order_transaction', {
      p_parent_id: userId,
      p_idempotency_key: idempotencyKey,
      p_shipping_name: 'Test Name',
      p_shipping_phone: '1234567890',
      p_shipping_line1: '123 Test St',
      p_shipping_city: 'Test City',
      p_shipping_state: 'Test State',
      p_shipping_pincode: '12345',
      p_subtotal: 2000,
      p_total: 2000,
      p_items: items,
      p_child_ids: []
    });

    console.log("RPC result:", orderId, txError);

    // Verify order was created
    const { data: order } = await adminClient.from('orders').select('*').eq('id', orderId).single();
    expect(order).toBeDefined();
    expect(order.parent_id).toBe(userId);
    expect(order.total).toBe(2000);
    expect(order.status).toBe('pending');
  });
});
