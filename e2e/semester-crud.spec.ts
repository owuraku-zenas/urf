import { test, expect } from '@playwright/test';

test.describe('Semester Architectural Locks', () => {
  test('safely navigates and isolates Admin Semester generation', async ({ page }) => {
    // 1. Log In
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('urfzone4@gmail.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/');

    // 2. Go to Admin Routes
    await page.goto('/semesters');

    // 3. Initiate the Form
    await page.getByRole('button', { name: /Add Semester|Create Semester/i }).click();

    // 4. Input Dates and Structure
    const newName = `E2E Autumn ${Date.now()}`;
    await page.getByLabel(/semester name/i).fill(newName);
    
    const academicYear = page.getByLabel(/academic year/i);
    if (await academicYear.isVisible()) {
       await academicYear.fill('2028');
    }

    await page.getByLabel(/start date/i).fill('2028-09-01');
    await page.getByLabel(/end date/i).fill('2028-12-15');

    // 5. Submit
    await page.getByRole('button', { name: /save|create/i }).click();

    // 6. Assert Validation Logic securely locks in the payload
    await expect(page.getByText(newName)).toBeVisible();
  });
});
