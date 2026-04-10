import { Page } from '@playwright/test';

export const TEST_USERS = {
  admin:   { email: 'admin@test.com',   password: 'TestPassword123!' },
  manager: { email: 'manager@test.com', password: 'TestPassword123!' },
  auditor: { email: 'auditor@test.com', password: 'TestPassword123!' },
  client:  { email: 'client@test.com',  password: 'TestPassword123!' },
};

export async function loginAs(page: Page, role: keyof typeof TEST_USERS) {
  const credentials = TEST_USERS[role];
  
  await page.goto('/login');
  
  // Wait for inputs to be available (instrumentation will add these IDs)
  await page.fill('[data-testid="login-tenant-input"]', 'gt-bharat'); 
  await page.fill('[data-testid="login-email-input"]', credentials.email);
  await page.fill('[data-testid="login-password-input"]', credentials.password);
  await page.click('[data-testid="login-submit-btn"]');
  
  // Wait for redirect to specific role path
  await page.waitForURL(new RegExp(`.*\\/${role}(?:\\/.*|$)`));
}
