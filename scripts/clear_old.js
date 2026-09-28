const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetProducts() {
  console.log('Clearing old data...');
  
  // Delete dependent data first
  await supabase.from('child_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('child_activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Delete core tables
  const { error: err1 } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.error('Error deleting products:', err1);
  
  // Since we already inserted the new product in the previous script, we should just delete the old ones.
  // Wait, if I delete all products now, it will also delete the new product I just inserted!
  // Let me just fetch all products, and delete those whose slug is not 'dev-kit-2-3'.
  const { data: prods } = await supabase.from('products').select('id, slug');
  for (const p of prods) {
    if (p.slug !== 'dev-kit-2-3') {
       const { error } = await supabase.from('products').delete().eq('id', p.id);
       if (error) console.error('Error deleting product', p.slug, error);
       else console.log('Deleted old product:', p.slug);
    }
  }

  console.log('Old products cleared.');
}
resetProducts();
