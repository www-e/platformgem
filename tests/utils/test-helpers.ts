import { Page, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

export interface TestUser {
  name: string;
  phone: string;
  email?: string;
  password: string;
  studentId?: string;
  parentPhone?: string;
}

export interface TestCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  professorId: string;
}

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Generate a test user with realistic Arabic data
   */
  static generateTestUser(): TestUser {
    const arabicNames = [
      'أحمد محمد علي',
      'فاطمة أحمد حسن',
      'محمد عبدالله سالم',
      'عائشة محمود إبراهيم',
      'عمر خالد يوسف',
      'زينب علي محمد',
      'يوسف أحمد عبدالرحمن',
      'مريم حسن علي'
    ];

    return {
      name: faker.helpers.arrayElement(arabicNames),
      phone: `010${faker.number.int({ min: 10000000, max: 99999999 })}`,
      email: faker.internet.email(),
      password: 'TestPassword123!',
      studentId: faker.number.int({ min: 100000, max: 999999 }).toString(),
      parentPhone: `011${faker.number.int({ min: 10000000, max: 99999999 })}`
    };
  }

  /**
   * Navigate to a page and wait for it to load with detailed logging
   */
  async navigateAndWait(url: string, waitForSelector?: string) {
    console.log(`🌐 الانتقال إلى: ${url}`);
    
    try {
      const response = await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      if (response) {
        console.log(`📥 استجابة الصفحة: ${response.status()} ${response.statusText()}`);
        
        if (response.status() >= 400) {
          console.log(`❌ خطأ في تحميل الصفحة: ${response.status()}`);
        } else {
          console.log(`✅ تم تحميل الصفحة بنجاح`);
        }
      }
      
      if (waitForSelector) {
        console.log(`⏳ انتظار العنصر: ${waitForSelector}`);
        await this.page.waitForSelector(waitForSelector, { timeout: 10000 });
        console.log(`✅ تم العثور على العنصر: ${waitForSelector}`);
      }
      
      // Additional wait for page to be fully loaded
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const finalUrl = this.page.url();
      console.log(`🎯 الرابط النهائي: ${finalUrl}`);
      
    } catch (error) {
      console.log(`❌ خطأ في التنقل إلى ${url}: ${error}`);
      await this.takeScreenshot('navigation-error');
      throw error;
    }
  }

  /**
   * Fill form fields with data
   */
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[name="${field}"]`, value);
    }
  }

  /**
   * Fill form fields with detailed logging
   */
  async fillFormWithLogging(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      console.log(`📝 ملء حقل "${field}"...`);
      try {
        // Try multiple selectors for each field
        const selectors = [
          `[name="${field}"]`,
          `#${field}`,
          `input[placeholder*="${field}"]`,
          `[data-testid="${field}"]`
        ];
        
        let filled = false;
        for (const selector of selectors) {
          const element = this.page.locator(selector);
          if (await element.count() > 0) {
            await element.waitFor({ timeout: 5000 });
            await element.fill(value);
            console.log(`✅ تم ملء حقل "${field}" بالقيمة: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
            filled = true;
            break;
          }
        }
        
        if (!filled) {
          console.log(`❌ لم يتم العثور على حقل "${field}"`);
          // List available form fields for debugging
          const allInputs = await this.page.locator('input, select, textarea').all();
          console.log('🔍 الحقول المتاحة:');
          for (const input of allInputs) {
            const name = await input.getAttribute('name');
            const id = await input.getAttribute('id');
            const placeholder = await input.getAttribute('placeholder');
            const type = await input.getAttribute('type');
            console.log(`   - name: ${name}, id: ${id}, placeholder: ${placeholder}, type: ${type}`);
          }
          throw new Error(`Field "${field}" not found`);
        }
      } catch (error) {
        console.log(`❌ خطأ في ملء حقل "${field}": ${error}`);
        throw error;
      }
    }
  }

  /**
   * Wait for navigation after form submission (updated for modern Playwright)
   */
  async submitFormAndWait(submitSelector: string, expectedUrl?: string) {
    console.log(`🚀 إرسال النموذج باستخدام المحدد: ${submitSelector}`);
    
    try {
      // Modern approach using waitForURL instead of deprecated waitForNavigation
      await Promise.all([
        this.page.waitForURL(url => url.pathname !== this.page.url(), { timeout: 15000 }),
        this.page.click(submitSelector)
      ]);
      
      console.log(`✅ تم إرسال النموذج وإعادة التوجيه إلى: ${this.page.url()}`);
      
      if (expectedUrl) {
        await expect(this.page).toHaveURL(new RegExp(expectedUrl));
        console.log(`✅ تم التحقق من الرابط المتوقع: ${expectedUrl}`);
      }
    } catch (error) {
      console.log(`❌ خطأ في إرسال النموذج: ${error}`);
      console.log(`🌐 الرابط الحالي: ${this.page.url()}`);
      throw error;
    }
  }

  /**
   * Enhanced form submission with better error handling
   */
  async submitFormWithLogging(submitSelector: string, expectedUrl?: string) {
    console.log(`🚀 محاولة إرسال النموذج...`);
    
    try {
      // Find submit button with multiple selectors
      const selectors = [
        submitSelector,
        'button[type="submit"]',
        '.submit-button',
        '[data-testid="submit"]',
        'input[type="submit"]'
      ];
      
      let submitButton = null;
      for (const selector of selectors) {
        const element = this.page.locator(selector);
        if (await element.count() > 0) {
          submitButton = element;
          console.log(`✅ تم العثور على زر الإرسال: ${selector}`);
          break;
        }
      }
      
      if (!submitButton) {
        console.log('❌ لم يتم العثور على زر الإرسال');
        // List available buttons for debugging
        const allButtons = await this.page.locator('button, input[type="submit"]').all();
        console.log('🔍 الأزرار المتاحة:');
        for (const button of allButtons) {
          const text = await button.textContent();
          const type = await button.getAttribute('type');
          const className = await button.getAttribute('class');
          console.log(`   - text: ${text}, type: ${type}, class: ${className}`);
        }
        throw new Error('Submit button not found');
      }
      
      // Wait for button to be enabled
      await submitButton.waitFor({ state: 'visible', timeout: 5000 });
      
      const isDisabled = await submitButton.isDisabled();
      if (isDisabled) {
        console.log('⚠️ زر الإرسال معطل، محاولة الانتظار...');
        await this.page.waitForTimeout(1000);
      }
      
      // Click and wait for response
      const [response] = await Promise.all([
        this.page.waitForResponse(response => 
          response.url().includes('/api/') && 
          ['POST', 'PUT', 'PATCH'].includes(response.request().method()),
          { timeout: 15000 }
        ).catch(() => null),
        submitButton.click()
      ]);
      
      if (response) {
        console.log(`📥 استجابة الخادم: ${response.status()} ${response.url()}`);
        
        if (response.status() >= 400) {
          const responseText = await response.text().catch(() => 'لا يمكن قراءة الاستجابة');
          console.log(`❌ خطأ في الخادم: ${responseText}`);
        }
      }
      
      // Wait for page to settle
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const currentUrl = this.page.url();
      console.log(`🌐 الرابط بعد الإرسال: ${currentUrl}`);
      
      if (expectedUrl) {
        const urlRegex = new RegExp(expectedUrl);
        if (urlRegex.test(currentUrl)) {
          console.log(`✅ تم التحقق من الرابط المتوقع: ${expectedUrl}`);
        } else {
          console.log(`⚠️ الرابط لا يطابق المتوقع. متوقع: ${expectedUrl}, فعلي: ${currentUrl}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ خطأ في إرسال النموذج: ${error}`);
      await this.takeScreenshot('form-submission-error');
      throw error;
    }
  }

  /**
   * Check if user is authenticated by looking for dashboard elements
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Login with test credentials
   */
  async login(user: TestUser) {
    await this.navigateAndWait('/login');
    
    await this.fillForm({
      login: user.phone,
      password: user.password
    });

    await this.submitFormAndWait('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await this.page.waitForURL(/\/(dashboard|admin|professor)/);
  }

  /**
   * Register a new test user
   */
  async register(user: TestUser) {
    await this.navigateAndWait('/signup');
    
    const formData: Record<string, string> = {
      name: user.name,
      phone: user.phone,
      password: user.password
    };

    if (user.email) formData.email = user.email;
    if (user.studentId) formData.studentId = user.studentId;
    if (user.parentPhone) formData.parentPhone = user.parentPhone;

    await this.fillForm(formData);
    await this.submitFormAndWait('button[type="submit"]');
  }

  /**
   * Logout current user
   */
  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/login');
  }

  /**
   * Wait for element to be visible and clickable
   */
  async waitAndClick(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
    await this.page.click(selector);
  }

  /**
   * Scroll element into view and click
   */
  async scrollAndClick(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.click(selector);
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout = 30000) {
    return await this.page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }

  /**
   * Check if element contains text
   */
  async elementContainsText(selector: string, text: string): Promise<boolean> {
    try {
      const element = await this.page.locator(selector);
      const content = await element.textContent();
      return content?.includes(text) || false;
    } catch {
      return false;
    }
  }

  /**
   * Get element text content
   */
  async getElementText(selector: string): Promise<string> {
    const element = await this.page.locator(selector);
    return await element.textContent() || '';
  }

  /**
   * Check if page has specific title
   */
  async hasPageTitle(title: string): Promise<boolean> {
    const pageTitle = await this.page.title();
    return pageTitle.includes(title);
  }

  /**
   * Wait for loading to complete with detailed logging
   */
  async waitForLoadingComplete() {
    console.log('⏳ انتظار اكتمال التحميل...');
    
    try {
      // Wait for common loading indicators to disappear
      const loadingSelectors = [
        '[data-testid="loading"]',
        '.loading',
        '.spinner',
        '.loader',
        '[aria-label*="loading"]',
        '[aria-label*="تحميل"]'
      ];
      
      for (const selector of loadingSelectors) {
        const elements = await this.page.locator(selector).count();
        if (elements > 0) {
          console.log(`⏳ انتظار اختفاء مؤشر التحميل: ${selector}`);
          await this.page.waitForSelector(selector, { state: 'hidden', timeout: 15000 });
          console.log(`✅ اختفى مؤشر التحميل: ${selector}`);
        }
      }
      
      // Wait for network to be idle
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      console.log('✅ اكتمل تحميل الصفحة');
      
    } catch (error) {
      console.log(`⚠️ انتهت مهلة انتظار التحميل: ${error}`);
      // Don't throw error, just log it as loading indicators might not be present
    }
  }

  /**
   * Simulate mobile viewport
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Simulate desktop viewport
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }
}