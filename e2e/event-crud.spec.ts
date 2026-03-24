import { test, expect } from '@playwright/test';

test.describe('Event & Attendance Boundaries', () => {
  test('creates a native event locking into the internal Context', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('urfzone4@gmail.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|submit/i }).click();
    await page.waitForURL('/');

    await page.goto('/events/new');

    const randomEvent = `E2E Service ${Date.now()}`;
    await page.getByLabel(/event name/i).fill(randomEvent);
    
    // Use the native select fallback
    await page.locator('select[name="type"]').selectOption({ label: 'Sunday Service' }).catch(() => {});
    
    await page.getByLabel(/event date/i).fill('2026-10-10');

    await page.getByRole('button', { name: /save|create/i }).click();

    // Verify
    await page.waitForURL(url => url.pathname.endsWith('/events'));
    await expect(page.getByText(randomEvent)).toBeVisible();
  });
});
