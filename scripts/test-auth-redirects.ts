// scripts/test-auth-redirects.ts
// Test script for authentication redirects

import { getRoleBasedRedirectUrl, isCorrectDashboardForRole, getRoleNavigation } from '../src/lib/auth-redirects';
import { UserRole } from '@prisma/client';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

class AuthRedirectTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Testing Authentication Redirects...\n');
    
    this.testRoleBasedRedirects();
    this.testDashboardValidation();
    this.testRoleNavigation();
    
    this.printResults();
  }

  private testRoleBasedRedirects(): void {
    console.log('📋 Testing Role-Based Redirects...');
    
    // Test admin redirect
    this.runTest('Admin redirect', () => {
      const url = getRoleBasedRedirectUrl(UserRole.ADMIN);
      if (url !== '/admin') {
        throw new Error(`Expected /admin, got ${url}`);
      }
      return 'Admin redirects to /admin';
    });

    // Test professor redirect
    this.runTest('Professor redirect', () => {
      const url = getRoleBasedRedirectUrl(UserRole.PROFESSOR);
      if (url !== '/professor') {
        throw new Error(`Expected /professor, got ${url}`);
      }
      return 'Professor redirects to /professor';
    });

    // Test student redirect
    this.runTest('Student redirect', () => {
      const url = getRoleBasedRedirectUrl(UserRole.STUDENT);
      if (url !== '/dashboard') {
        throw new Error(`Expected /dashboard, got ${url}`);
      }
      return 'Student redirects to /dashboard';
    });
  }

  private testDashboardValidation(): void {
    console.log('📋 Testing Dashboard Validation...');
    
    // Test admin dashboard access
    this.runTest('Admin dashboard validation', () => {
      const isCorrect = isCorrectDashboardForRole('/admin/categories', UserRole.ADMIN);
      if (!isCorrect) {
        throw new Error('Admin should have access to /admin routes');
      }
      
      const isIncorrect = isCorrectDashboardForRole('/professor', UserRole.ADMIN);
      if (isIncorrect) {
        throw new Error('Admin should not be validated for /professor routes');
      }
      
      return 'Admin dashboard validation working';
    });

    // Test professor dashboard access
    this.runTest('Professor dashboard validation', () => {
      const isCorrect = isCorrectDashboardForRole('/professor/courses', UserRole.PROFESSOR);
      if (!isCorrect) {
        throw new Error('Professor should have access to /professor routes');
      }
      
      const isIncorrect = isCorrectDashboardForRole('/admin', UserRole.PROFESSOR);
      if (isIncorrect) {
        throw new Error('Professor should not be validated for /admin routes');
      }
      
      return 'Professor dashboard validation working';
    });

    // Test student dashboard access
    this.runTest('Student dashboard validation', () => {
      const isCorrect = isCorrectDashboardForRole('/dashboard', UserRole.STUDENT);
      if (!isCorrect) {
        throw new Error('Student should have access to /dashboard routes');
      }
      
      const isIncorrect = isCorrectDashboardForRole('/admin', UserRole.STUDENT);
      if (isIncorrect) {
        throw new Error('Student should not be validated for /admin routes');
      }
      
      return 'Student dashboard validation working';
    });
  }

  private testRoleNavigation(): void {
    console.log('📋 Testing Role Navigation...');
    
    // Test admin navigation
    this.runTest('Admin navigation', () => {
      const nav = getRoleNavigation(UserRole.ADMIN);
      if (!nav.some(item => item.href === '/admin')) {
        throw new Error('Admin navigation should include /admin');
      }
      if (!nav.some(item => item.href === '/admin/categories')) {
        throw new Error('Admin navigation should include /admin/categories');
      }
      return 'Admin navigation items correct';
    });

    // Test professor navigation
    this.runTest('Professor navigation', () => {
      const nav = getRoleNavigation(UserRole.PROFESSOR);
      if (!nav.some(item => item.href === '/professor')) {
        throw new Error('Professor navigation should include /professor');
      }
      if (!nav.some(item => item.href === '/professor/courses')) {
        throw new Error('Professor navigation should include /professor/courses');
      }
      return 'Professor navigation items correct';
    });

    // Test student navigation
    this.runTest('Student navigation', () => {
      const nav = getRoleNavigation(UserRole.STUDENT);
      if (!nav.some(item => item.href === '/dashboard')) {
        throw new Error('Student navigation should include /dashboard');
      }
      if (!nav.some(item => item.href === '/courses')) {
        throw new Error('Student navigation should include /courses');
      }
      return 'Student navigation items correct';
    });
  }

  private runTest(testName: string, testFunction: () => string): void {
    try {
      const message = testFunction();
      this.results.push({
        name: testName,
        status: 'PASS',
        message
      });
      console.log(`  ✅ ${testName}`);
    } catch (error: any) {
      this.results.push({
        name: testName,
        status: 'FAIL',
        message: error.message
      });
      console.log(`  ❌ ${testName}: ${error.message}`);
    }
  }

  private printResults(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = totalTests - passedTests;

    console.log('\n' + '='.repeat(60));
    console.log('🎯 AUTH REDIRECT TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Authentication redirects are working perfectly!');
    } else {
      console.log(`\n⚠️ ${failedTests} tests failed. Please review and fix the issues.`);
      
      console.log('\nFailed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`  ❌ ${result.name}: ${result.message}`);
        });
    }
  }
}

// Run the tests
async function main() {
  const tester = new AuthRedirectTester();
  await tester.runAllTests();
}

main().catch(console.error);

export { AuthRedirectTester };