import { test, expect } from '@playwright/test';

test.describe('Member Creation & Level Selection', () => {
  test('creates a member with admission year and assigned semester', async ({ page }) => {
    // First log in as Admin
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('urfzone4@gmail.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
    await page.waitForURL('/');

    // Navigate to Member Creation
    await page.goto('/members/new');
    
    const uniqueName = `Test Member ${Date.now()}`;
    await page.getByLabel(/name/i).fill(uniqueName);
    await page.getByLabel(/email address/i).fill(`test.e2e${Date.now()}@example.com`);
    await page.getByLabel(/phone/i).fill('+23359' + Math.floor(1000000 + Math.random() * 9000000));
    
    // Fill the new semantic fields
    const admissionInput = page.getByLabel(/admission year/i);
    if (await admissionInput.isVisible()) {
      await admissionInput.fill('2024');
    }
    
    const startYearInput = page.getByLabel(/start year/i);
    if (await startYearInput.isVisible()) {
      await startYearInput.fill('2024');
    }
    
    // Wait for the async API responses to populate the required Cell Group select and select it
    await page.locator('select#cellGroupId').selectOption({ index: 1 });

    // Submit
    await page.getByRole('button', { name: /save|create|submit/i }).click();

    // Verify redirect or success toast
    await expect(page).toHaveURL(/.*\/members/);
    await expect(page.getByRole('cell', { name: uniqueName }).first()).toBeVisible();
  });
});
