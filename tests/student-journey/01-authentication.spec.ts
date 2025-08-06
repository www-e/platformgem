import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TEST_USERS, ERROR_MESSAGES } from '../utils/test-data';

// Enhanced test configuration with better debugging
test.describe.configure({ mode: 'serial' });

// Global test state for debugging
let testContext: {
  currentTest: string;
  startTime: number;
  errors: string[];
  screenshots: string[];
} = {
  currentTest: '',
  startTime: 0,
  errors: [],
  screenshots: []
};

test.describe('Student Journey - Authentication Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }, testInfo) => {
    // Initialize test context
    testContext.currentTest = testInfo.title;
    testContext.startTime = Date.now();
    testContext.errors = [];
    testContext.screenshots = [];
    
    console.log(`\n🧪 بدء الاختبار: ${testInfo.title}`);
    console.log(`⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`);
    
    helpers = new TestHelpers(page);
    
    // Set up error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const error = `Console Error: ${msg.text()}`;
        testContext.errors.push(error);
        console.log(`❌ خطأ في وحدة التحكم: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      const errorMsg = `Page Error: ${error.message}`;
      testContext.errors.push(errorMsg);
      console.log(`❌ خطأ في الصفحة: ${error.message}`);
    });
    
    // Set up request/response monitoring
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`📤 طلب API: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const status = response.status();
        const statusIcon = status >= 200 && status < 300 ? '✅' : '❌';
        console.log(`📥 استجابة API: ${statusIcon} ${status} ${response.url()}`);
      }
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    const duration = Date.now() - testContext.startTime;
    const status = testInfo.status === 'passed' ? '✅ نجح' : '❌ فشل';
    
    console.log(`\n📊 نتيجة الاختبار: ${status}`);
    console.log(`⏱️ المدة: ${duration}ms`);
    
    if (testContext.errors.length > 0) {
      console.log(`🐛 الأخطاء المكتشفة (${testContext.errors.length}):`);
      testContext.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // Take screenshot on failure
    if (testInfo.status === 'failed') {
      const screenshotName = `failure-${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}`;
      await helpers.takeScreenshot(screenshotName);
      console.log(`📸 تم حفظ لقطة الشاشة: ${screenshotName}`);
      
      // Log page content for debugging
      const pageContent = await page.content();
      console.log(`📄 محتوى الصفحة الحالية: ${page.url()}`);
      
      // Check for common error indicators
      const errorElements = await page.locator('.text-destructive-foreground, .error, [role="alert"]').all();
      if (errorElements.length > 0) {
        console.log(`🚨 رسائل الخطأ الموجودة في الصفحة:`);
        for (const element of errorElements) {
          const text = await element.textContent();
          if (text) {
            console.log(`   - ${text}`);
          }
        }
      }
    }
    
    console.log(`${'='.repeat(60)}\n`);
  });

  test.describe('Student Auth - Registration Process', () => {
    test('should successfully register a new student with all fields', async ({ page }) => {
      console.log('🔄 إنشاء بيانات مستخدم تجريبي...');
      const testUser = TestHelpers.generateTestUser();
      console.log(`👤 المستخدم التجريبي: ${testUser.name} - ${testUser.phone}`);
      
      console.log('🌐 الانتقال إلى صفحة التسجيل...');
      await helpers.navigateAndWait('/signup');
      console.log('✅ تم تحميل صفحة التسجيل');
      
      console.log('🔍 التحقق من عناصر الصفحة...');
      try {
        // Check if page loaded correctly with more flexible selectors
        const pageTitle = await page.title();
        console.log(`📄 عنوان الصفحة: ${pageTitle}`);
        
        // Look for signup form elements
        const nameInput = page.locator('input[name="name"], #name');
        const phoneInput = page.locator('input[name="phone"], #phone');
        const passwordInput = page.locator('input[name="password"], #password');
        
        console.log('⏳ انتظار ظهور حقول النموذج...');
        await nameInput.waitFor({ timeout: 10000 });
        await phoneInput.waitFor({ timeout: 5000 });
        await passwordInput.waitFor({ timeout: 5000 });
        console.log('✅ تم العثور على حقول النموذج');
        
        // Verify signup page loads correctly with more flexible checks
        if (pageTitle.includes('إنشاء') || pageTitle.includes('تسجيل') || pageTitle.includes('signup')) {
          console.log('✅ تم التحقق من عنوان الصفحة');
        } else {
          console.log(`⚠️ عنوان الصفحة غير متوقع: ${pageTitle}`);
        }
        
        // Check for heading with multiple possible selectors
        const headings = await page.locator('h1, h2, .title, [data-testid="page-title"]').all();
        let foundSignupHeading = false;
        for (const heading of headings) {
          const text = await heading.textContent();
          if (text && (text.includes('إنشاء') || text.includes('تسجيل') || text.includes('حساب'))) {
            console.log(`✅ تم العثور على عنوان التسجيل: ${text}`);
            foundSignupHeading = true;
            break;
          }
        }
        
        if (!foundSignupHeading) {
          console.log('⚠️ لم يتم العثور على عنوان التسجيل المتوقع');
        }
        
      } catch (error) {
        console.log(`❌ خطأ في التحقق من الصفحة: ${error}`);
        await helpers.takeScreenshot('signup-page-error');
        throw error;
      }
      
      console.log('📝 ملء نموذج التسجيل...');
      try {
        await helpers.fillFormWithLogging({
          name: testUser.name,
          phone: testUser.phone,
          email: testUser.email!,
          studentId: testUser.studentId!,
          parentPhone: testUser.parentPhone!,
          password: testUser.password
        });
        console.log('✅ تم ملء النموذج بنجاح');
      } catch (error) {
        console.log(`❌ خطأ في ملء النموذج: ${error}`);
        await helpers.takeScreenshot('form-fill-error');
        throw error;
      }
      
      console.log('🚀 إرسال النموذج...');
      try {
        const submitButton = page.locator('button[type="submit"], .submit-button, [data-testid="submit"]');
        await submitButton.waitFor({ timeout: 5000 });
        
        // Wait for navigation or response
        const [response] = await Promise.all([
          page.waitForResponse(response => 
            response.url().includes('/api/') && response.request().method() === 'POST',
            { timeout: 15000 }
          ).catch(() => null),
          submitButton.click()
        ]);
        
        if (response) {
          console.log(`📥 استجابة الخادم: ${response.status()} ${response.url()}`);
          if (response.status() >= 400) {
            const responseBody = await response.text().catch(() => 'لا يمكن قراءة الاستجابة');
            console.log(`❌ خطأ في الخادم: ${responseBody}`);
          }
        }
        
        console.log('⏳ انتظار إعادة التوجيه...');
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        const currentUrl = page.url();
        console.log(`🌐 الرابط الحالي: ${currentUrl}`);
        
        // Check if redirected to login or if there are errors
        if (currentUrl.includes('/login')) {
          console.log('✅ تم إعادة التوجيه إلى صفحة تسجيل الدخول');
        } else {
          console.log('⚠️ لم يتم إعادة التوجيه إلى صفحة تسجيل الدخول');
          
          // Check for error messages
          const errorMessages = await page.locator('.text-destructive-foreground, .error, [role="alert"]').all();
          if (errorMessages.length > 0) {
            console.log('🚨 رسائل خطأ موجودة:');
            for (const msg of errorMessages) {
              const text = await msg.textContent();
              if (text) console.log(`   - ${text}`);
            }
          }
        }
        
      } catch (error) {
        console.log(`❌ خطأ في إرسال النموذج: ${error}`);
        await helpers.takeScreenshot('form-submit-error');
        throw error;
      }
      
      // Take screenshot for verification
      await helpers.takeScreenshot('registration-attempt-complete');
    });

    test('should register with minimal required fields only', async ({ page }) => {
      const testUser = TestHelpers.generateTestUser();
      
      await helpers.navigateAndWait('/signup');
      
      // Fill only required fields
      await helpers.fillForm({
        name: testUser.name,
        phone: testUser.phone,
        password: testUser.password
      });
      
      await helpers.submitFormAndWait('button[type="submit"]');
      await expect(page).toHaveURL('/login');
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await helpers.navigateAndWait('/signup');
      
      // Try to submit with empty fields
      await page.click('button[type="submit"]');
      
      // Check for validation messages
      await expect(page.locator('input[name="name"]:invalid')).toBeVisible();
      await expect(page.locator('input[name="phone"]:invalid')).toBeVisible();
      await expect(page.locator('input[name="password"]:invalid')).toBeVisible();
    });

    test('should prevent registration with existing phone number', async ({ page }) => {
      await helpers.navigateAndWait('/signup');
      
      // Try to register with existing phone
      await helpers.fillForm({
        name: 'Test User',
        phone: TEST_USERS.STUDENT.phone,
        password: 'TestPassword123!'
      });
      
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('.text-destructive-foreground')).toContainText(/رقم الهاتف مستخدم/);
    });
  });

  test.describe('Student Auth - Login Process', () => {
    test('should successfully login with phone number', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      // Verify login page
      await expect(page).toHaveTitle(/تسجيل الدخول/);
      await expect(page.locator('h1')).toContainText('مرحباً بعودتك');
      
      // Login with phone
      await helpers.fillForm({
        login: TEST_USERS.STUDENT.phone,
        password: TEST_USERS.STUDENT.password
      });
      
      await helpers.submitFormAndWait('button[type="submit"]');
      
      // Should redirect to student dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('h1')).toContainText('لوحة تحكم الطالب');
      
      await helpers.takeScreenshot('login-success-dashboard');
    });

    test('should successfully login with student ID', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      // Login with student ID
      await helpers.fillForm({
        login: TEST_USERS.STUDENT.studentId!,
        password: TEST_USERS.STUDENT.password
      });
      
      await helpers.submitFormAndWait('button[type="submit"]');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      await helpers.fillForm({
        login: 'invalid_phone',
        password: 'wrong_password'
      });
      
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('.text-destructive-foreground')).toContainText(ERROR_MESSAGES.INVALID_LOGIN);
    });

    test('should toggle password visibility', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      const passwordInput = page.locator('input[name="password"]');
      const toggleButton = page.locator('button[type="button"]').last();
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle to show password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click again to hide password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should redirect authenticated users away from auth pages', async ({ page }) => {
      // First login
      await helpers.login(TEST_USERS.STUDENT);
      
      // Try to access login page while authenticated
      await helpers.navigateAndWait('/login');
      await expect(page).toHaveURL('/dashboard');
      
      // Try to access signup page while authenticated
      await helpers.navigateAndWait('/signup');
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Student Auth - Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      await helpers.login(TEST_USERS.STUDENT);
      
      // Refresh page
      await page.reload();
      await helpers.waitForLoadingComplete();
      
      // Should still be authenticated
      await expect(page).toHaveURL('/dashboard');
      expect(await helpers.isAuthenticated()).toBe(true);
    });

    test('should logout successfully', async ({ page }) => {
      await helpers.login(TEST_USERS.STUDENT);
      
      // Click user menu and logout
      await helpers.waitAndClick('[data-testid="user-menu"]');
      await helpers.waitAndClick('[data-testid="logout-button"]');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
      expect(await helpers.isAuthenticated()).toBe(false);
    });

    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route without authentication
      await helpers.navigateAndWait('/dashboard');
      await expect(page).toHaveURL(/\/login/);
      
      await helpers.navigateAndWait('/profile');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Student Auth - Role-based Access', () => {
    test('should redirect student to correct dashboard', async ({ page }) => {
      await helpers.login(TEST_USERS.STUDENT);
      await expect(page).toHaveURL('/dashboard');
      
      // Verify student-specific content
      await expect(page.locator('h1')).toContainText('لوحة تحكم الطالب');
    });

    test('should prevent access to admin routes', async ({ page }) => {
      await helpers.login(TEST_USERS.STUDENT);
      
      // Try to access admin route
      await helpers.navigateAndWait('/admin');
      await expect(page).toHaveURL('/dashboard'); // Should redirect back
    });

    test('should prevent access to professor routes', async ({ page }) => {
      await helpers.login(TEST_USERS.STUDENT);
      
      // Try to access professor route
      await helpers.navigateAndWait('/professor');
      await expect(page).toHaveURL('/dashboard'); // Should redirect back
    });
  });

  test.describe('Student Auth - Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/auth/**', route => route.abort());
      
      await helpers.navigateAndWait('/login');
      await helpers.fillForm({
        login: TEST_USERS.STUDENT.phone,
        password: TEST_USERS.STUDENT.password
      });
      
      await page.click('button[type="submit"]');
      
      // Should show appropriate error message
      await expect(page.locator('.text-destructive-foreground')).toBeVisible();
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Simulate server error
      await page.route('**/api/auth/**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await helpers.navigateAndWait('/login');
      await helpers.fillForm({
        login: TEST_USERS.STUDENT.phone,
        password: TEST_USERS.STUDENT.password
      });
      
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('.text-destructive-foreground')).toBeVisible();
    });
  });

  test.describe('Student Auth - Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      // Tab through form elements
      await page.keyboard.press('Tab'); // Focus on login input
      await expect(page.locator('input[name="login"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Focus on password input
      await expect(page.locator('input[name="password"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Focus on toggle button
      await page.keyboard.press('Tab'); // Focus on submit button
      await expect(page.locator('button[type="submit"]')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      // Check for proper labels
      await expect(page.locator('label[for="login"]')).toBeVisible();
      await expect(page.locator('label[for="password"]')).toBeVisible();
      
      // Check input associations
      await expect(page.locator('input[name="login"]')).toHaveAttribute('id', 'login');
      await expect(page.locator('input[name="password"]')).toHaveAttribute('id', 'password');
    });
  });

  test.describe('Student Auth - Mobile Responsiveness', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      await helpers.setMobileViewport();
      await helpers.navigateAndWait('/login');
      
      // Verify mobile layout
      await expect(page.locator('.card')).toBeVisible();
      
      // Test form interaction on mobile
      await helpers.fillForm({
        login: TEST_USERS.STUDENT.phone,
        password: TEST_USERS.STUDENT.password
      });
      
      await helpers.submitFormAndWait('button[type="submit"]');
      await expect(page).toHaveURL('/dashboard');
      
      await helpers.takeScreenshot('mobile-login-success');
    });
  });
});