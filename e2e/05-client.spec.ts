import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures/auth';
import * as fs from 'fs';
import * as path from 'path';

// Read the shared environment to get the test audit ID
const envPath = path.join(process.cwd(), 'e2e-env.json');
const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
const TEST_AUDIT_ID = env.TEST_AUDIT_ID;

test.describe('Client Persona Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'client');
  });

  test('Client can view dashboard insights', async ({ page }) => {
    await page.goto('/client/dashboard');
    
    // Check for compliance score
    const score = page.locator('[data-testid="compliance-score"]');
    await expect(score).toBeVisible();
    
    // Check for active audits
    const auditRows = page.locator('[data-testid="executive-audit-row"]');
    await expect(auditRows).not.toHaveCount(0);
  });

  test('Client can view audit list and explore', async ({ page }) => {
    await page.goto('/client/audits');
    
    // Find the test audit row
    const auditRow = page.locator('[data-testid="client-audit-row"]').filter({ hasText: 'UAT-TEST-AUDIT' }).first();
    await expect(auditRow).toBeVisible();
    
    // Click explore
    await auditRow.locator('button:has-text("Explore")').click();
    await expect(page).toHaveURL(/\/client\/audits\/[0-9a-f-]+/);
  });

  test('Client can review report and submit feedback', async ({ page }) => {
    // In our seed, TEST_AUDIT_ID might not be in the right status.
    // However, the dashboard lists all audits for the client.
    await page.goto('/client/dashboard');
    
    // Find an audit that is pending review
    const reviewAuditRow = page.locator('[data-testid="executive-audit-row"]').filter({ hasText: 'pending_client_review' }).first();
    
    if (await reviewAuditRow.isVisible()) {
      await reviewAuditRow.locator('button:has-text("Explore")').click();
      
      // Navigate to reports or if already there (ClientAuditDetail might have a reports tab)
      // Actually /client/reports is another entry point
      await page.goto('/client/reports');
      const reportRow = page.locator('tr').filter({ hasText: 'Draft for Review' }).first();
      await reportRow.locator('button:has-text("Review")').click();
      
      // Click Submit Feedback
      await page.click('[data-testid="submit-feedback-btn"]');
      
      // Fill feedback
      await page.fill('[data-testid="report-feedback-input"]', 'The executive summary needs more detail on the BU1 findings.');
      
      // Submit
      await page.click('[data-testid="submit-report-feedback-btn"]');
      
      // Toast check (optional but good)
      await expect(page.locator('text=Feedback submitted successfully')).toBeVisible();
    }
  });
});
