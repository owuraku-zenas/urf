import { test, expect } from '@playwright/test';

test.describe('Admin Protected Routes', () => {
  test('redirects unauthorized or unauthenticated user to home or login page', async ({ page }) => {
    // Navigate directly to an admin-only route without logging in
    const response = await page.goto('/semesters');
    
    // Check that we got redirected to the homepage or login page
    // Next.js middleware typically redirects to `/login` or `/`
    await page.waitForTimeout(1000); // Give Next.js router a moment
    expect(['/', '/login'].some(p => page.url().endsWith(p))).toBeTruthy();
  });
});
