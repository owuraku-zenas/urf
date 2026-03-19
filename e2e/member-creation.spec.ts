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
    
    // Fill out the required member details
    await page.getByLabel(/name/i).fill('Test E2E Member');
    await page.getByLabel(/phone/i).fill('+233' + Math.floor(Math.random() * 1000000000));
    
    // Fill the new semantic fields
    const admissionInput = page.getByLabel(/admission year/i);
    if (await admissionInput.isVisible()) {
      await admissionInput.fill('2024');
    }
    
    const joinedSemesterSelect = page.getByLabel(/joined semester|semester joined/i);
    if (await joinedSemesterSelect.isVisible()) {
      // Depending on if it's a native select or Radix UI select
      try {
        await joinedSemesterSelect.click();
        await page.getByRole('option').nth(1).click();
      } catch (e) {
        await joinedSemesterSelect.selectOption({ index: 1 });
      }
    }

    // Submit
    await page.getByRole('button', { name: /save|create|submit/i }).click();

    // Verify redirect or success toast
    await page.waitForURL(/\/members/);
    await expect(page.getByText(/Test E2E Member/i).first()).toBeVisible();
  });
});
