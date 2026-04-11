import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from './fixtures/auth';

test.describe('Authentication & Role Gating', () => {
  test('Login success for all roles', async ({ page }) => {
    for (const role of Object.keys(TEST_USERS) as Array<keyof typeof TEST_USERS>) {
      await loginAs(page, role);
      await expect(page).toHaveURL(new RegExp(`.*\\/${role}(?:\\/.*|$)`));
      
      // Logout to test next role (assuming a logout button exists or clear cookies)
      await page.context().clearCookies();
    }
  });

  test('Login failure with wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="login-tenant-input"]', 'gt-bharat');
    await page.fill('[data-testid="login-email-input"]', TEST_USERS.admin.email);
    await page.fill('[data-testid="login-password-input"]', 'wrong-password');
    await page.click('[data-testid="login-submit-btn"]');
    
    // Check for error message
    await expect(page.locator('text=/Invalid/i')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Auditor cannot access Admin dashboard', async ({ page }) => {
    await loginAs(page, 'auditor');
    await page.goto('/admin/dashboard');
    
    // Should be redirected back to auditor's dashboard by the frontend RoleGuard
    await expect(page).toHaveURL(/\/auditor\/dashboard/);
  });

  test('Logout clears session', async ({ page }) => {
    await loginAs(page, 'admin');
    
    // Assuming a logout button exists in the sidebar or header
    // For now, we simulate logout by navigating or clicking
    // If no data-testid exists yet, we might need to add one
    await page.click('[data-testid="user-profile-card"]');
    await page.click('[data-testid="logout-btn"]'); 
    
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
