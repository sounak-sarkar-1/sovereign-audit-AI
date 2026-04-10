# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-auth.spec.ts >> Authentication & Role Gating >> Logout clears session
- Location: e2e\01-auth.spec.ts:41:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('[data-testid="logout-btn"]')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - generic [ref=e7]: S
          - generic [ref=e8]: Sovereign Audit
        - button [ref=e9] [cursor=pointer]:
          - img [ref=e10]
      - navigation [ref=e12]:
        - link "Dashboard" [ref=e13] [cursor=pointer]:
          - /url: /admin/dashboard
          - img [ref=e14]
          - generic [ref=e21]: Dashboard
        - link "Audit Oversight" [ref=e22] [cursor=pointer]:
          - /url: /admin/audit-oversight
          - img [ref=e23]
          - generic [ref=e28]: Audit Oversight
        - link "Audit Logs" [ref=e29] [cursor=pointer]:
          - /url: /admin/audit-logs
          - img [ref=e30]
          - generic [ref=e35]: Audit Logs
        - link "Mappings" [ref=e36] [cursor=pointer]:
          - /url: /admin/mappings
          - img [ref=e37]
          - generic [ref=e40]: Mappings
        - link "Exceptional Requests" [ref=e41] [cursor=pointer]:
          - /url: /admin/exceptional-requests
          - img [ref=e42]
          - generic [ref=e45]: Exceptional Requests
        - link "User Management" [ref=e46] [cursor=pointer]:
          - /url: /admin/users
          - img [ref=e47]
          - generic [ref=e53]: User Management
        - link "Business Units" [ref=e54] [cursor=pointer]:
          - /url: /admin/business-units
          - img [ref=e55]
          - generic [ref=e58]: Business Units
        - link "Audit Templates" [ref=e59] [cursor=pointer]:
          - /url: /admin/templates
          - img [ref=e60]
          - generic [ref=e64]: Audit Templates
        - link "AI Model Config" [ref=e65] [cursor=pointer]:
          - /url: /admin/ai-models
          - img [ref=e66]
          - generic [ref=e69]: AI Model Config
        - link "Access Control" [ref=e70] [cursor=pointer]:
          - /url: /admin/access-control
          - img [ref=e71]
          - generic [ref=e75]: Access Control
        - link "Settings" [ref=e76] [cursor=pointer]:
          - /url: /settings
          - img [ref=e77]
          - generic [ref=e81]: Settings
      - generic [ref=e85] [cursor=pointer]:
        - img [ref=e87]
        - generic [ref=e91]: Admin User
    - generic [ref=e92]:
      - banner [ref=e93]:
        - generic [ref=e94]:
          - generic [ref=e95]:
            - generic [ref=e96]: Sovereign Audit
            - generic [ref=e97]: ›
            - generic [ref=e98]: Dashboard
          - heading "Dashboard" [level=1] [ref=e99]
        - generic [ref=e100]:
          - generic [ref=e101]: gt-bharat
          - generic [ref=e102]:
            - button "Switch to Dark Mode" [ref=e103] [cursor=pointer]:
              - img [ref=e104]
            - button [ref=e106] [cursor=pointer]:
              - img [ref=e107]
      - main [ref=e110]:
        - generic [ref=e111]:
          - generic [ref=e112]:
            - generic [ref=e113]:
              - img [ref=e114]
              - generic [ref=e117]: System Administration
            - heading "Admin Dashboard" [level=1] [ref=e118]
            - paragraph [ref=e119]: Global system overview and key performance indicators.
          - generic [ref=e120]:
            - generic [ref=e123]:
              - generic [ref=e124]:
                - paragraph [ref=e125]: Total Users
                - generic [ref=e126]:
                  - heading "0" [level=3] [ref=e127]
                  - img [ref=e128]
                - paragraph [ref=e131]: Active across all tenants
              - img [ref=e133]
            - generic [ref=e140]:
              - generic [ref=e141]:
                - paragraph [ref=e142]: Active Audits
                - generic [ref=e143]:
                  - heading "0" [level=3] [ref=e144]
                  - img [ref=e145]
                - paragraph [ref=e148]: Engagements in progress
              - img [ref=e150]
            - generic [ref=e156]:
              - generic [ref=e157]:
                - paragraph [ref=e158]: Pending Requests
                - generic [ref=e159]:
                  - heading "0" [level=3] [ref=e160]
                  - img [ref=e161]
                - paragraph [ref=e164]: Awaiting admin review
              - img [ref=e166]
            - generic [ref=e170]:
              - generic [ref=e171]:
                - paragraph [ref=e172]: System Health
                - generic [ref=e173]:
                  - heading "99.9%" [level=3] [ref=e174]
                  - img [ref=e175]
                - paragraph [ref=e178]: Operational status
              - img [ref=e180]
          - generic [ref=e183]:
            - generic [ref=e184]:
              - generic [ref=e186]:
                - generic [ref=e187]:
                  - generic [ref=e188]: Recent Audits
                  - generic [ref=e189]: Latest system-wide engagements
                - img [ref=e190]
              - table [ref=e196]:
                - rowgroup [ref=e197]:
                  - row "Engagement Client Status" [ref=e198]:
                    - columnheader "Engagement" [ref=e199]
                    - columnheader "Client" [ref=e200]
                    - columnheader "Status" [ref=e201]
                - rowgroup [ref=e202]:
                  - row "No recent audits found." [ref=e203]:
                    - cell "No recent audits found." [ref=e204]
            - generic [ref=e205]:
              - generic [ref=e207]:
                - generic [ref=e208]:
                  - generic [ref=e209]: Pending Actions
                  - generic [ref=e210]: Needs attention
                - img [ref=e211]
              - generic [ref=e215]: No pending exceptional requests.
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
  - dialog [ref=e217]:
    - generic [ref=e218]:
      - button "Profile" [active] [ref=e219] [cursor=pointer]:
        - img
        - text: Profile
      - button "Password" [ref=e220] [cursor=pointer]:
        - img
        - text: Password
      - button "Logout" [ref=e222] [cursor=pointer]:
        - img
        - text: Logout
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
  38 |     await expect(page).not.toHaveURL(/\/admin\/dashboard/);
  39 |   });
  40 | 
  41 |   test('Logout clears session', async ({ page }) => {
  42 |     await loginAs(page, 'admin');
  43 |     
  44 |     // Assuming a logout button exists in the sidebar or header
  45 |     // For now, we simulate logout by navigating or clicking
  46 |     // If no data-testid exists yet, we might need to add one
  47 |     await page.click('[data-testid="user-profile-card"]');
> 48 |     await page.click('[data-testid="logout-btn"]'); 
     |                ^ Error: page.click: Test timeout of 120000ms exceeded.
  49 |     
  50 |     await expect(page).toHaveURL(/\/login/);
  51 |     await page.goto('/admin/dashboard');
  52 |     await expect(page).toHaveURL(/\/login/);
  53 |   });
  54 | });
  55 | 
```