import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const adminClient = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

describe('Products Database Tests', () => {
  it('should be able to fetch products', async () => {
    const { data, error } = await adminClient.from('products').select('*');
    if (error) console.error("Error fetching products:", error);
    expect(error).toBeNull();
    console.log("Products count:", data?.length);
    if (data?.length && data.length > 0) {
      console.log("Sample product:", data[0]);
    }
  });

  it('should check if cart table exists', async () => {
    const { data, error } = await adminClient.from('cart').select('*').limit(1);
    if (error) {
       console.log("No cart table or error:", error.message);
    } else {
       console.log("Cart table exists.");
    }
  });
  
  it('should check if order items table exists', async () => {
    const { data, error } = await adminClient.from('orders').select('*').limit(1);
    if (error) {
       console.log("No orders table or error:", error.message);
    } else {
       console.log("Orders table exists.");
    }
  });
});
