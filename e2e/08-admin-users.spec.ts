import { test, expect } from '@playwright/test';

test.describe('Admin User Management', () => {
  const testUser = {
    fullName: `Test Auditor ${Date.now()}`,
    email: `auditor_${Date.now()}@example.com`,
    role: 'auditor',
    phone: '+919999999999',
    password: 'Password123!'
  };

  test.beforeEach(async ({ page }) => {
    // Login as Admin
    await page.goto('/login');
    await page.fill('[data-testid="login-email-input"]', 'admin@test.com');
    await page.fill('[data-testid="login-password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="login-tenant-input"]', 'gt-bharat');
    await page.click('[data-testid="login-submit-btn"]');

    // Wait for dashboard and navigate to User Management
    await page.waitForURL(/\/admin\/dashboard/);
    await page.click('[data-testid="sidebar-link-user-management"]');
    await page.waitForURL(/\/admin\/users/);
  });

  test('User List loads correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('User Management');
    const userRows = page.locator('[data-testid="user-table-row"]');
    await expect(userRows.first()).toBeVisible();
  });

  test('Create, Search, View, Edit, and Deactivate User', async ({ page }) => {
    // 1. Create User
    await page.click('[data-testid="create-user-btn"]');
    await page.fill('[data-testid="user-fullname-input"]', testUser.fullName);
    await page.fill('[data-testid="user-email-input"]', testUser.email);
    // Role defaults to Auditor, so we leave it
    await page.fill('[data-testid="user-phone-input"]', testUser.phone);
    await page.fill('[data-testid="user-password-input"]', testUser.password);
    
    // Intercept create request
    const createPromise = page.waitForResponse(res => 
      res.url().includes('/api/v1/admin/users') && res.request().method() === 'POST'
    );
    await page.click('[data-testid="user-submit-btn"]');
    const createRes = await createPromise;
    expect(createRes.status()).toBe(201);
    
    // Verify success toast
    await expect(page.locator('text=User created successfully')).toBeVisible();

    // 2. Search User
    await page.fill('[data-testid="user-search-input"]', testUser.email);
    // Debounce wait
    await page.waitForTimeout(1000);
    const searchedUser = page.locator('[data-testid="user-table-row"]').filter({ hasText: testUser.email });
    await expect(searchedUser).toBeVisible();

    // 3. View Details
    await searchedUser.locator('button').click(); // Dropdown trigger
    await page.click('text=View Details');
    await page.waitForURL(/\/admin\/users\/.+/);
    await expect(page.locator('h2')).toContainText(testUser.fullName);
    await expect(page.locator('text=' + testUser.email)).toBeVisible();

    // 4. Edit User
    await page.goBack();
    await page.waitForURL(/\/admin\/users/);
    await page.fill('[data-testid="user-search-input"]', testUser.email);
    await page.waitForTimeout(500);
    
    await searchedUser.locator('button').click();
    await page.click('text=Edit User');
    
    const updatedName = testUser.fullName + ' Updated';
    await page.fill('[data-testid="user-fullname-input"]', updatedName);
    
    const updatePromise = page.waitForResponse(res => 
      res.url().includes('/api/v1/admin/users') && res.request().method() === 'PUT'
    );
    await page.click('[data-testid="user-save-btn"]');
    const updateRes = await updatePromise;
    expect(updateRes.status()).toBe(200);
    await expect(page.locator('text=User updated successfully')).toBeVisible();

    // 5. Deactivate (Delete) User
    await page.fill('[data-testid="user-search-input"]', testUser.email);
    await page.waitForTimeout(500);
    await searchedUser.locator('button').click();
    await page.click('text=Delete User');
    
    // Confirm in AlertDialog
    await page.click('button:has-text("Delete")');
    await expect(page.locator('text=User deleted successfully')).toBeVisible();
    
    // Verify user is gone or state updated
    await page.fill('[data-testid="user-search-input"]', testUser.email);
    await page.waitForTimeout(1000);
    await expect(page.locator('text=No users found.')).toBeVisible();
  });
});
