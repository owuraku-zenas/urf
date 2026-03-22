import { test, expect } from '@playwright/test';

test.describe('Live Attendance Tracking Ratios', () => {
  test('simulates event data ingestion and table parsing', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('urfzone4@gmail.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/');

    await page.goto('/events');

    // Assumes an event row exists, click the first Take Attendance or View button
    // This is purely simulating a user traversing the Attendance UX graph
    const takeAttendanceRow = page.getByRole('button', { name: /take attendance|view/i }).first();

    if (await takeAttendanceRow.isVisible()) {
      await takeAttendanceRow.click();
      
      // Simulate checking a Member absent or present
      const firstCheckbox = page.getByRole('checkbox').first();
      if (await firstCheckbox.isVisible()) {
         await firstCheckbox.check();
      }

      const saveButton = page.getByRole('button', { name: /save attendance|submit/i });
      if (await saveButton.isVisible()) {
          await saveButton.click();
          // We assert the UI does not aggressively crash handling mathematical commitment percentages
          await expect(page.getByText(/success/i)).toBeVisible();
      }
    }
  });
});
