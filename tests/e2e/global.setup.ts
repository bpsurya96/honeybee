import { test as setup } from '@playwright/test';

setup('create test user', async ({ request }) => {
  const response = await request.post('/api/dev/seed-test-user');
  
  if (!response.ok()) {
    const text = await response.text();
    // Ignore error if user already exists
    if (!text.includes('already been registered') && !text.includes('already exists')) {
      console.error('Failed to seed test user:', text);
    } else {
      console.log('Test user already exists. Skipping seed.');
    }
  } else {
    console.log('Test user seeded via API');
  }
});