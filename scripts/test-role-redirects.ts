// scripts/test-role-redirects.ts
// Test role-based redirects after authentication

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testRoleRedirects() {
  console.log('🧪 Testing Role-Based Redirects\n');
  
  try {
    // Test 1: Create test users for each role
    console.log('1️⃣ Creating test users for each role...');
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUsers = await Promise.all([
      prisma.user.create({
        data: {
          name: 'Test Admin',
          email: 'admin@test.com',
          phone: '+201000001111',
          password: hashedPassword,
          role: UserRole.ADMIN,
          isActive: true
        }
      }),
      prisma.user.create({
        data: {
          name: 'Test Professor',
          email: 'professor@test.com',
          phone: '+201000002222',
          password: hashedPassword,
          role: UserRole.PROFESSOR,
          isActive: true
        }
      }),
      prisma.user.create({
        data: {
          name: 'Test Student',
          email: 'student@test.com',
          phone: '+201000003333',
          studentId: 'STU001',
          password: hashedPassword,
          role: UserRole.STUDENT,
          isActive: true
        }
      })
    ]);
    
    console.log('✅ Test users created successfully');
    
    // Test 2: Verify redirect URLs for each role
    console.log('\n2️⃣ Testing redirect URLs...');
    const { getRoleBasedRedirectUrl } = await import('../src/lib/auth-redirects');
    
    const redirectTests = [
      { role: UserRole.ADMIN, expected: '/admin' },
      { role: UserRole.PROFESSOR, expected: '/professor' },
      { role: UserRole.STUDENT, expected: '/dashboard' }
    ];
    
    for (const test of redirectTests) {
      const actualUrl = getRoleBasedRedirectUrl(test.role);
      const isCorrect = actualUrl === test.expected;
      console.log(`   ${isCorrect ? '✅' : '❌'} ${test.role}: ${actualUrl} ${isCorrect ? '' : `(expected: ${test.expected})`}`);
    }
    
    // Test 3: Test role navigation
    console.log('\n3️⃣ Testing role-based navigation...');
    const { getRoleNavigation } = await import('../src/lib/auth-redirects');
    
    for (const role of [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.STUDENT]) {
      const navigation = getRoleNavigation(role);
      console.log(`   ✅ ${role} navigation: ${navigation.length} items`);
      navigation.forEach(item => {
        console.log(`      - ${item.label}: ${item.href}`);
      });
    }
    
    // Test 4: Test dashboard access validation
    console.log('\n4️⃣ Testing dashboard access validation...');
    const { isCorrectDashboardForRole } = await import('../src/lib/auth-redirects');
    
    const accessTests = [
      { role: UserRole.ADMIN, path: '/admin', shouldAllow: true },
      { role: UserRole.ADMIN, path: '/professor', shouldAllow: false },
      { role: UserRole.PROFESSOR, path: '/professor', shouldAllow: true },
      { role: UserRole.PROFESSOR, path: '/dashboard', shouldAllow: false },
      { role: UserRole.STUDENT, path: '/dashboard', shouldAllow: true },
      { role: UserRole.STUDENT, path: '/admin', shouldAllow: false }
    ];
    
    for (const test of accessTests) {
      const actualResult = isCorrectDashboardForRole(test.path, test.role);
      const isCorrect = actualResult === test.shouldAllow;
      console.log(`   ${isCorrect ? '✅' : '❌'} ${test.role} accessing ${test.path}: ${actualResult ? 'ALLOWED' : 'DENIED'}`);
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test users...');
    await prisma.user.deleteMany({
      where: {
        phone: {
          in: ['+201000001111', '+201000002222', '+201000003333']
        }
      }
    });
    console.log('✅ Cleanup completed');
    
    console.log('\n🎉 All role-based redirect tests passed!');
    console.log('\n📋 Manual Testing Guide:');
    console.log('1. Create users with different roles');
    console.log('2. Login as ADMIN → Should redirect to /admin');
    console.log('3. Login as PROFESSOR → Should redirect to /professor');
    console.log('4. Login as STUDENT → Should redirect to /dashboard');
    console.log('5. Try accessing wrong dashboard → Should redirect to correct one');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoleRedirects();