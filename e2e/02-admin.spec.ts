import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures/auth';

test.describe('Admin Persona Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('Admin can view dashboard summary and audits', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    
    // Check for audit-oversight-row (at least one from seed)
    const rows = page.locator('[data-testid="audit-oversight-row"]');
    await expect(rows).not.toHaveCount(0);
  });

  test('Admin can search for users', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('h1')).toContainText('User Management');
    
    // Search for the seeded manager
    await page.fill('[data-testid="user-search-input"]', 'manager@test.com');
    
    // Row should be visible
    const row = page.locator('[data-testid="user-table-row"]').first();
    await expect(row).toBeVisible();
    await expect(row).toContainText('manager@test.com');
  });

  test('Admin can review and approve exceptional actions', async ({ page }) => {
    await page.goto('/admin/exceptional-requests');
    await expect(page.locator('h1')).toContainText('Exceptional Requests');
    
    // Click on the first pending request
    const requestRow = page.locator('[data-testid="exceptional-request-row"]').first();
    await expect(requestRow).toBeVisible();
    await requestRow.click();
    
    // Check for drawer components
    await expect(page.locator('text=Review Request')).toBeVisible();
    
    // Fill admin comment
    await page.fill('textarea[placeholder*="notes or rejection reason"]', 'Approved via E2E test automated flow.');
    
    // Upload evidence
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="evidence-upload-input"]', { force: true }); // It's hidden but label is clicked
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('./e2e/fixtures/test-evidence.pdf');
    
    // Click Approve
    await page.click('[data-testid="approve-request-btn"]');
    
    // Should show success toast and close drawer
    await expect(page.locator('text=approved successfully')).toBeVisible();
    await expect(page.locator('text=Review Request')).not.toBeVisible();
  });
});
