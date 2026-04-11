import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const loginAsAdmin = async (page: any) => {
  await page.goto('/login');
  await page.fill('[data-testid="login-email-input"]', 'admin@test.com');
  await page.fill('[data-testid="login-password-input"]', 'TestPassword123!');
  await page.fill('[data-testid="login-tenant-input"]', 'gt-bharat');
  await page.click('[data-testid="login-submit-btn"]');
  
  // Wait for login response then navigation to dashboard
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/auth/login') && resp.status() === 201),
    page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 }),
  ]);
  
  // Wait for sidebar to be visible and have items
  await page.waitForSelector('nav', { timeout: 15000 });
  
  // Navigate via Sidebar
  const link = page.locator('nav').getByText('Exceptional Requests');
  await expect(link).toBeVisible({ timeout: 10000 });
  await link.click();

  await page.waitForURL(/\/admin\/exceptional-requests/);
  await page.waitForSelector('[data-testid="exceptional-requests-title"]', { timeout: 15000 });
};

test.describe('Admin Exceptional Requests', () => {
  test('Exceptional Requests List loads correctly', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId('exceptional-requests-title')).toBeVisible({ timeout: 10000 });
    // Tab filter should be present
    await expect(page.locator('button:has-text("pending")').first()).toBeVisible();
  });

  test('Reject request with validation', async ({ page }) => {
    await loginAsAdmin(page);

    const row = page.locator('[data-testid="exceptional-request-row"]').first();
    if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip();
      return;
    }

    await row.click();
    await page.waitForSelector('[data-testid="reject-request-btn"]', { timeout: 8000 });

    // Click reject without comment → should show validation
    await page.click('[data-testid="reject-request-btn"]');
    await expect(page.locator('body')).toContainText('A rejection comment (min 10 chars) is required', { timeout: 5000 });

    // Fill short comment → still fails
    await page.fill('[data-testid="admin-comment-input"]', 'Short');
    await page.click('[data-testid="reject-request-btn"]');
    await expect(page.locator('body')).toContainText('A rejection comment (min 10 chars) is required', { timeout: 5000 });

    // Valid rejection
    await page.fill('[data-testid="admin-comment-input"]', 'This request is not justified by the provided evidence.');
    await page.click('[data-testid="reject-request-btn"]');
    await expect(page.locator('body')).toContainText('Request rejected successfully', { timeout: 10000 });
  });

  test('Approve request with validation (missing file)', async ({ page }) => {
    await loginAsAdmin(page);

    const row = page.locator('[data-testid="exceptional-request-row"]').first();
    if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip();
      return;
    }

    await row.click();
    await page.waitForSelector('[data-testid="approve-request-btn"]', { timeout: 8000 });

    // Click approve without file → should show validation
    await page.click('[data-testid="approve-request-btn"]');
    await expect(page.locator('body')).toContainText('Evidence file is required for approval', { timeout: 5000 });
  });

  test('Approve request successfully with mock file', async ({ page }) => {
    await loginAsAdmin(page);

    const row = page.locator('[data-testid="exceptional-request-row"]').first();
    if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip();
      return;
    }

    const filePath = path.join(__dirname, 'mock-evidence.txt');
    fs.writeFileSync(filePath, 'Mock evidence for E2E testing.');

    try {
      await row.click();
      await page.waitForSelector('[data-testid="approve-request-btn"]', { timeout: 8000 });

      // File input is hidden behind the styled drop zone — use setInputFiles directly
      await page.setInputFiles('#evidence', filePath);
      await expect(page.locator('body')).toContainText('mock-evidence.txt', { timeout: 5000 });

      await page.fill('[data-testid="admin-comment-input"]', 'Approved as per protocol.');
      await page.click('[data-testid="approve-request-btn"]');

      await expect(page.locator('body')).toContainText('Request approved successfully', { timeout: 10000 });
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });
});
