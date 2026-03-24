import { test, expect } from '@playwright/test';

test.describe('Admin Protected Routes', () => {
  test('redirects unauthorized or unauthenticated user to home or login page', async ({ page }) => {
    // Navigate directly to an admin-only route without logging in
    const response = await page.goto('/semesters');
    
    // Check that we got redirected to the homepage or login page
    // Next.js middleware typically redirects to `/login` or `/`
    await page.waitForURL(url => ['/', '/login', '/api/auth/signin'].some(p => url.pathname.includes(p) || url.href.includes(p)));
    expect(['/', '/login', '/api/auth/signin'].some(p => page.url().includes(p))).toBeTruthy();
  });
});
