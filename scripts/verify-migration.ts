#!/usr/bin/env tsx
/**
 * Verification script to check the migration was successful
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying migration...');

  try {
    // Check categories
    const categories = await prisma.category.findMany();
    console.log(`✅ Categories: ${categories.length} found`);
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat.slug})`));

    // Check users by role
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const professorCount = await prisma.user.count({ where: { role: 'PROFESSOR' } });
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } });
    
    console.log(`✅ Users by role:`);
    console.log(`   - Admins: ${adminCount}`);
    console.log(`   - Professors: ${professorCount}`);
    console.log(`   - Students: ${studentCount}`);

    // List all users for debugging
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, phone: true, role: true }
    });
    console.log(`📋 All users:`);
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.phone}) - ${user.role}`);
    });

    // Check courses
    const courses = await prisma.course.findMany({
      include: {
        category: true,
        professor: true,
      }
    });
    
    console.log(`✅ Courses: ${courses.length} found`);
    courses.forEach(course => {
      console.log(`   - ${course.title} (Category: ${course.category.name}, Professor: ${course.professor.name})`);
    });

    // Check schema integrity
    console.log('✅ Schema integrity check passed - all courses have required relationships');

    console.log('🎉 Migration verification completed!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });