const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: parent } = await supabase.from('profiles').select('id').limit(1).single();
  if (!parent) return console.log('No parent found');

  const { data: products } = await supabase.from('products').select('id, price').limit(2);
  if (!products || products.length === 0) return console.log('No products');

  const total = products.reduce((sum, p) => sum + p.price, 0);
  
  const { data: order } = await supabase.from('orders').insert({
    parent_id: parent.id,
    status: 'paid',
    delivery_status: 'processing',
    subtotal: total,
    total: total,
    payment_ref: 'dev_seed_' + Math.random().toString(36).slice(2, 9)
  }).select('id').single();

  const orderItems = products.map(p => ({
    order_id: order.id,
    product_id: p.id,
    quantity: 1,
    unit_price: p.price
  }));

  await supabase.from('order_items').insert(orderItems);
  console.log('Seeded order for parent:', parent.id);
}
run();
