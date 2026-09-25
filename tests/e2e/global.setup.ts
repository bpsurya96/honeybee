import { test as setup } from '@playwright/test';

setup('create test user', async ({ request }) => {
  const response = await request.post('/api/dev/seed-test-user');
  
  if (!response.ok()) {
    console.error('Failed to seed test user:', await response.text());
  } else {
    console.log('Test user seeded via API');
  }
});
