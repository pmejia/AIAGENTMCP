import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('Rahul Shetty Academy login test', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/client');

  // Fill in login form with random credentials
  await page.getByRole('textbox', { name: 'email@example.com' }).fill('testuser12345@example.com');
  await page.getByRole('textbox', { name: 'enter your passsword' }).fill('RandomPass123!');

  // Click login button
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for potential error message or redirect
  await page.waitForTimeout(2000);
});
