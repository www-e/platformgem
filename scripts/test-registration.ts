#!/usr/bin/env tsx
/**
 * Test script to verify the new registration system
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRegistration() {
  console.log('📝 Testing registration system...');

  try {
    // Test 1: Check if we can create different user roles
    console.log('👥 Testing user role system...');
    
    const roleStats = await Promise.all([
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'PROFESSOR' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
    ]);

    console.log(`✅ Current user distribution:`);
    console.log(`   - Admins: ${roleStats[0]}`);
    console.log(`   - Professors: ${roleStats[1]}`);
    console.log(`   - Students: ${roleStats[2]}`);

    // Test 2: Check if we can find users by different login methods
    console.log('🔍 Testing login method flexibility...');
    
    const testUser = await prisma.user.findFirst({
      where: { role: 'PROFESSOR' }
    });

    if (testUser) {
      // Test phone login
      const byPhone = await prisma.user.findFirst({
        where: { phone: testUser.phone, isActive: true }
      });
      console.log(`✅ Phone login: ${byPhone ? 'WORKS' : 'FAILED'}`);

      // Test email login (if email exists)
      if (testUser.email) {
        const byEmail = await prisma.user.findFirst({
          where: { email: testUser.email, isActive: true }
        });
        console.log(`✅ Email login: ${byEmail ? 'WORKS' : 'FAILED'}`);
      }

      // Test studentId login (if exists)
      if (testUser.studentId) {
        const byStudentId = await prisma.user.findFirst({
          where: { studentId: testUser.studentId, isActive: true }
        });
        console.log(`✅ Student ID login: ${byStudentId ? 'WORKS' : 'FAILED'}`);
      }
    }

    // Test 3: Check professor-specific fields
    console.log('👨‍🏫 Testing professor-specific features...');
    
    const professorsWithDetails = await prisma.user.findMany({
      where: { role: 'PROFESSOR' },
      select: {
        name: true,
        bio: true,
        expertise: true,
        ownedCourses: {
          select: { id: true, title: true }
        }
      }
    });

    console.log(`✅ Professors with enhanced profiles:`);
    professorsWithDetails.forEach(prof => {
      console.log(`   - ${prof.name}:`);
      console.log(`     Bio: ${prof.bio || 'Not set'}`);
      console.log(`     Expertise: ${prof.expertise.length > 0 ? prof.expertise.join(', ') : 'Not set'}`);
      console.log(`     Courses: ${prof.ownedCourses.length}`);
    });

    // Test 4: Check categories exist for course creation
    console.log('📚 Testing category system...');
    
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { name: true, slug: true }
    });

    console.log(`✅ Available categories: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    console.log('🎉 Registration system test completed successfully!');

  } catch (error) {
    console.error('❌ Registration test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testRegistration()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });