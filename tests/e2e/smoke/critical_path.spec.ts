import { test, expect } from '@playwright/test';

test.describe('Critical Path Smoke Test @smoke', () => {
  const testEmail = 'e2e_test@example.com';
  const testPassword = 'Password123!';

  test('Complete flow: Login -> Dashboard -> Products -> AI Coach', async ({ page }) => {
    // 1. Landing Page -> Login
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();

    // 2. Login
    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/Password/i).fill(testPassword);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // 3. Check where we landed (could be /onboarding or /dashboard)
    await page.waitForURL(url => url.pathname === '/onboarding' || url.pathname === '/dashboard');
    if (page.url().includes('/onboarding')) {
      await page.getByLabel(/Child's Name/i).fill('Test Baby');
      await page.getByLabel(/Date of Birth/i).fill('2023-01-01');
      await page.getByRole('button', { name: /Complete Setup/i }).click();
    }

    // 4. Dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // 5. Products Catalog
    await page.getByRole('link', { name: /Products/i }).click();
    await expect(page).toHaveURL(/.*\/products/);
    
    // 6. Navigate to AI Coach
    await page.getByRole('link', { name: /Coach/i }).click();
    await expect(page).toHaveURL(/.*\/coach/);
    await expect(page.getByText(/Your AI Coach/i)).toBeVisible();

    // 7. Logout (Navigate to Profile first)
    await page.getByRole('link', { name: /Profile/i }).click();
    await expect(page).toHaveURL(/.*\/profile/);
    await page.getByRole('button', { name: /Sign out/i }).click();
    await page.waitForURL(url => url.pathname === '/' || url.pathname === '/login');
  });
});
