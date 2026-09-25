import { test as setup, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

setup('create test user', async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Skipping user creation because SUPABASE_SERVICE_ROLE_KEY is not available');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const email = 'e2e_test@example.com';
  const password = 'Password123!';

  // Try to create the user with auto-confirm
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'E2E Test User' }
  });

  if (error && error.message.includes('already exists')) {
    console.log('Test user already exists');
  } else if (error) {
    console.error('Error creating test user:', error);
  } else {
    console.log('Test user created successfully');
  }
});
