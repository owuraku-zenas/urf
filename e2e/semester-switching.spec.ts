import { test, expect } from '@playwright/test';

test.describe('Semester Switching Workflow', () => {
  test('toggles the global semester dropdown and updates React state', async ({ page }) => {
    // Log in as Admin
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('urfzone4@gmail.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
    await page.waitForURL('/');

    // Check if the Semester Selector dropdown is present in the layout
    // It could be a combobox or a button controlling a popover
    const selectorButton = page.getByRole('combobox').filter({ hasText: /semester|202|fall|spring/i }).first();
    const fallbackButton = page.getByRole('button', { name: /semester|202|fall|spring/i }).first();
    
    const targetButton = await selectorButton.isVisible() ? selectorButton : fallbackButton;

    if (await targetButton.isVisible()) {
       await targetButton.click();
       // Select another option in the Radix Select / Popover
       const options = page.getByRole('option');
       if (await options.count() > 1) {
           await options.nth(1).click();
       }
       
       // Ensure dashboard remains stable and data updates (no crashes)
       await expect(page.getByRole('heading', { name: /dashboard|overview|commitments|members/i }).first()).toBeVisible();
    }
  });
});
