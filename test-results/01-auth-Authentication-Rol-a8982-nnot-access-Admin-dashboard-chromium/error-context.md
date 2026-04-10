# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-auth.spec.ts >> Authentication & Role Gating >> Auditor cannot access Admin dashboard
- Location: e2e\01-auth.spec.ts:32:7

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /\/admin\/dashboard/
Received string: "http://localhost:5173/admin/dashboard"
Timeout: 5000ms

Call log:
  - Expect "not toHaveURL" with timeout 5000ms
    8 × unexpected value "http://localhost:5173/admin/dashboard"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: S
        - generic [ref=e8]: Sovereign Audit
      - button [ref=e9] [cursor=pointer]:
        - img [ref=e10]
    - navigation [ref=e12]:
      - link "Task Dashboard" [ref=e13] [cursor=pointer]:
        - /url: /auditor/dashboard
        - img [ref=e14]
        - generic [ref=e20]: Task Dashboard
      - link "Audit Assignments" [ref=e21] [cursor=pointer]:
        - /url: /auditor/dashboard
        - img [ref=e22]
        - generic [ref=e26]: Audit Assignments
      - link "Settings" [ref=e27] [cursor=pointer]:
        - /url: /settings
        - img [ref=e28]
        - generic [ref=e32]: Settings
    - generic [ref=e36] [cursor=pointer]:
      - img [ref=e38]
      - generic [ref=e42]: Test Auditor
  - generic [ref=e43]:
    - banner [ref=e44]:
      - generic [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]: Sovereign Audit
          - generic [ref=e48]: ›
          - generic [ref=e49]: Dashboard
        - heading "Dashboard" [level=1] [ref=e50]
      - generic [ref=e51]:
        - generic [ref=e52]: gt-bharat
        - generic [ref=e53]:
          - button "Switch to Dark Mode" [ref=e54] [cursor=pointer]:
            - img [ref=e55]
          - button [ref=e57] [cursor=pointer]:
            - img [ref=e58]
    - main [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]:
            - img [ref=e65]
            - generic [ref=e68]: System Administration
          - heading "Admin Dashboard" [level=1] [ref=e69]
          - paragraph [ref=e70]: Global system overview and key performance indicators.
        - generic [ref=e71]:
          - generic [ref=e74]:
            - generic [ref=e75]:
              - paragraph [ref=e76]: Total Users
              - generic [ref=e77]:
                - heading "0" [level=3] [ref=e78]
                - img [ref=e79]
              - paragraph [ref=e82]: Active across all tenants
            - img [ref=e84]
          - generic [ref=e91]:
            - generic [ref=e92]:
              - paragraph [ref=e93]: Active Audits
              - generic [ref=e94]:
                - heading "0" [level=3] [ref=e95]
                - img [ref=e96]
              - paragraph [ref=e99]: Engagements in progress
            - img [ref=e101]
          - generic [ref=e107]:
            - generic [ref=e108]:
              - paragraph [ref=e109]: Pending Requests
              - generic [ref=e110]:
                - heading "0" [level=3] [ref=e111]
                - img [ref=e112]
              - paragraph [ref=e115]: Awaiting admin review
            - img [ref=e117]
          - generic [ref=e121]:
            - generic [ref=e122]:
              - paragraph [ref=e123]: System Health
              - generic [ref=e124]:
                - heading "99.9%" [level=3] [ref=e125]
                - img [ref=e126]
              - paragraph [ref=e129]: Operational status
            - img [ref=e131]
        - generic [ref=e134]:
          - generic [ref=e135]:
            - generic [ref=e137]:
              - generic [ref=e138]:
                - generic [ref=e139]: Recent Audits
                - generic [ref=e140]: Latest system-wide engagements
              - img [ref=e141]
            - table [ref=e147]:
              - rowgroup [ref=e148]:
                - row "Engagement Client Status" [ref=e149]:
                  - columnheader "Engagement" [ref=e150]
                  - columnheader "Client" [ref=e151]
                  - columnheader "Status" [ref=e152]
              - rowgroup [ref=e153]:
                - row "No recent audits found." [ref=e154]:
                  - cell "No recent audits found." [ref=e155]
          - generic [ref=e156]:
            - generic [ref=e158]:
              - generic [ref=e159]:
                - generic [ref=e160]: Pending Actions
                - generic [ref=e161]: Needs attention
              - img [ref=e162]
            - generic [ref=e166]: No pending exceptional requests.
  - generic:
    - generic:
      - generic:
        - generic:
          - img
          - heading "Notifications" [level=2]
        - generic:
          - button:
            - img
      - generic:
        - generic:
          - generic:
            - img
          - heading "All Caught Up" [level=3]
          - paragraph: You don't have any new notifications at the moment.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { loginAs, TEST_USERS } from './fixtures/auth';
  3  | 
  4  | test.describe('Authentication & Role Gating', () => {
  5  |   test('Login success for all roles', async ({ page }) => {
  6  |     for (const role of Object.keys(TEST_USERS) as Array<keyof typeof TEST_USERS>) {
  7  |       await loginAs(page, role);
  8  |       await expect(page).toHaveURL(new RegExp(`.*\\/${role}(?:\\/.*|$)`));
  9  |       
  10 |       // Logout to test next role (assuming a logout button exists or clear cookies)
  11 |       await page.context().clearCookies();
  12 |     }
  13 |   });
  14 | 
  15 |   test('Login failure with wrong password', async ({ page }) => {
  16 |     await page.goto('/login');
  17 |     await page.fill('[data-testid="login-tenant-input"]', 'gt-bharat');
  18 |     await page.fill('[data-testid="login-email-input"]', TEST_USERS.admin.email);
  19 |     await page.fill('[data-testid="login-password-input"]', 'wrong-password');
  20 |     await page.click('[data-testid="login-submit-btn"]');
  21 |     
  22 |     // Check for error message
  23 |     await expect(page.locator('text=/Invalid/i')).toBeVisible();
  24 |     await expect(page).toHaveURL(/\/login/);
  25 |   });
  26 | 
  27 |   test('Unauthenticated user is redirected to login', async ({ page }) => {
  28 |     await page.goto('/admin/dashboard');
  29 |     await expect(page).toHaveURL(/\/login/);
  30 |   });
  31 | 
  32 |   test('Auditor cannot access Admin dashboard', async ({ page }) => {
  33 |     await loginAs(page, 'auditor');
  34 |     await page.goto('/admin/dashboard');
  35 |     
  36 |     // Should be redirected back or show access denied
  37 |     // Based on common Guard behavior, it might redirect to / (home) or /auditor/dashboard
> 38 |     await expect(page).not.toHaveURL(/\/admin\/dashboard/);
     |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  39 |   });
  40 | 
  41 |   test('Logout clears session', async ({ page }) => {
  42 |     await loginAs(page, 'admin');
  43 |     
  44 |     // Assuming a logout button exists in the sidebar or header
  45 |     // For now, we simulate logout by navigating or clicking
  46 |     // If no data-testid exists yet, we might need to add one
  47 |     await page.click('[data-testid="user-profile-card"]');
  48 |     await page.click('[data-testid="logout-btn"]'); 
  49 |     
  50 |     await expect(page).toHaveURL(/\/login/);
  51 |     await page.goto('/admin/dashboard');
  52 |     await expect(page).toHaveURL(/\/login/);
  53 |   });
  54 | });
  55 | 
```