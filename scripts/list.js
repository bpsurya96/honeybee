const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
async function list() {
  const { data } = await supabase.from('products').select('slug');
  console.log('Products:', data);
}
list();
