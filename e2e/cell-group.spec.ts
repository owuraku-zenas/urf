import { test, expect } from '@playwright/test';

test.describe('Cell Group Management CRUD', () => {
  test('creates a cell group correctly', async ({ page }) => {
    // 1. Authenticate
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('urfzone4@gmail.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
    await page.waitForURL('/');

    // 2. Navigate 
    await page.goto('/cell-groups');
    
    // 3. Open Modal / Page
    await page.getByRole('button', { name: /Add Cell Group|Create/i }).click();

    // 4. Input Fields
    const randomGroupName = `E2E Cell ${Date.now()}`;
    await page.getByLabel(/name/i).fill(randomGroupName);
    await page.getByLabel(/description/i).fill('A secure test group generated strictly by Playwright E2E suites.');

    // 5. Submit
    await page.getByRole('button', { name: /save|create/i }).click();

    // 6. Assert Success
    await expect(page.getByText(randomGroupName)).toBeVisible();
  });
});
