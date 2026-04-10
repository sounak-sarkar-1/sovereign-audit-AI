import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures/auth';
import * as fs from 'fs';
import * as path from 'path';

// Read the shared environment to get the test audit ID
const envPath = path.join(process.cwd(), 'e2e-env.json');
const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
const TEST_AUDIT_ID = env.TEST_AUDIT_ID;

test.describe('Auditor Persona Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'auditor');
  });

  test('Auditor can view assigned audits and open workspace', async ({ page }) => {
    await page.goto('/auditor/dashboard');
    
    // Find the test audit card
    const auditCard = page.locator('[data-testid="auditor-audit-card"]').filter({ hasText: 'UAT-TEST-AUDIT' }).first();
    await expect(auditCard).toBeVisible();
    
    // Open workspace
    await auditCard.locator('[data-testid="open-workspace-btn"]').click();
    await expect(page).toHaveURL(/\/auditor\/workspace\/[0-9a-f-]+/);
  });

  test('Auditor can submit a response for a line item', async ({ page }) => {
    await page.goto(`/auditor/workspace/${TEST_AUDIT_ID}`);
    
    // Find a line item that is not started
    const lineItem = page.locator('[data-testid="line-item-card"]').first();
    await expect(lineItem).toBeVisible();
    
    // Click submit assurance
    await lineItem.locator('[data-testid="submit-assurance-btn"]').click();
    
    // Fill response
    await page.fill('[data-testid="response-text-input"]', 'Internal controls are in place and functioning effectively as per the SOP.');
    await page.fill('[data-testid="manager-comment-input"]', 'Evidence is attached to the BU folder.');
    
    // Submit
    await page.click('[data-testid="submit-for-review-btn"]');
    
    // Check if status changed to Submitted
    await expect(lineItem.locator('text=Submitted')).toBeVisible();
  });

  test('Auditor can raise an exception request', async ({ page }) => {
    await page.goto(`/auditor/workspace/${TEST_AUDIT_ID}`);
    
    // Find another line item
    const lineItem = page.locator('[data-testid="line-item-card"]').nth(1);
    await expect(lineItem).toBeVisible();
    
    // Open menu and select Raise Exception
    await lineItem.locator('button').filter({ has: page.locator('svg') }).last().click(); // MoreVertical
    await page.click('text=Raise Exception');
    
    // Fill justification (min 20 chars)
    await page.fill('[data-testid="exception-justification-input"]', 'The control cannot be tested because the relevant system was decommissioned last month.');
    
    // Submit
    await page.click('[data-testid="raise-exception-confirm-btn"]');
    
    // Check if status changed to Exc. Pending
    await expect(lineItem.locator('text=Exc. Pending')).toBeVisible();
  });
});
