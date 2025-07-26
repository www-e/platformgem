#!/usr/bin/env tsx
/**
 * Migration script to transform the database from grade-based to category-based system
 * This script safely migrates existing data while preserving user information
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting migration to multi-category platform...');

  try {
    // Step 1: Create default categories
    console.log('📁 Creating default categories...');
    
    const categories = [
      {
        id: 'cat_math_general',
        name: 'الرياضيات العامة',
        description: 'دورات الرياضيات للمراحل الدراسية المختلفة',
        slug: 'math-general',
      },
      {
        id: 'cat_pt_fitness',
        name: 'التربية البدنية واللياقة',
        description: 'دورات التربية البدنية واللياقة البدنية',
        slug: 'pt-fitness',
      },
      {
        id: 'cat_nutrition',
        name: 'التغذية والصحة',
        description: 'دورات التغذية والصحة العامة',
        slug: 'nutrition',
      },
      {
        id: 'cat_swimming',
        name: 'السباحة والرياضات المائية',
        description: 'دورات السباحة والرياضات المائية',
        slug: 'swimming',
      },
      {
        id: 'cat_muscle_training',
        name: 'تدريب العضلات',
        description: 'دورات تدريب العضلات وكمال الأجسام',
        slug: 'muscle-training',
      },
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {},
        create: category,
      });
    }

    console.log('✅ Categories created successfully');

    // Step 2: Create default professor account
    console.log('👨‍🏫 Creating default professor account...');
    
    const defaultPassword = await bcrypt.hash('professor123', 10);
    
    const defaultProfessor = await prisma.user.upsert({
      where: { phone: '+201000000000' },
      update: {
        role: 'PROFESSOR',
        bio: 'أستاذ الرياضيات للمراحل الدراسية المختلفة',
        expertise: ['الرياضيات', 'الجبر', 'الهندسة'],
      },
      create: {
        id: 'prof_default_math',
        phone: '+201000000000',
        name: 'أستاذ الرياضيات',
        password: defaultPassword,
        role: 'PROFESSOR',
        bio: 'أستاذ الرياضيات للمراحل الدراسية المختلفة',
        expertise: ['الرياضيات', 'الجبر', 'الهندسة'],
        studentId: null,
      },
    });

    console.log(`✅ Default professor created: ${defaultProfessor.name} (${defaultProfessor.role})`);

    // Step 3: Update the professor account to correct role
    console.log('👑 Updating user roles...');
    
    await prisma.user.update({
      where: { phone: '+201000000000' },
      data: { role: 'PROFESSOR' },
    });
    
    console.log('✅ Professor role updated');

    // Step 4: Update existing courses
    console.log('📚 Updating existing courses...');
    
    const existingCourses = await prisma.course.findMany();
    
    for (const course of existingCourses) {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          categoryId: 'cat_math_general', // Assign to math category
          professorId: defaultProfessor.id,
          isPublished: true,
          price: null, // Keep existing courses free
        },
      });
    }

    console.log('✅ Courses updated successfully');

    // Step 5: Update existing students
    console.log('👨‍🎓 Updating student accounts...');
    
    await prisma.user.updateMany({
      where: {
        role: 'STUDENT',
      },
      data: {
        isActive: true,
      },
    });

    console.log('✅ Student accounts updated');

    console.log('🎉 Migration completed successfully!');
    console.log('📋 Summary:');
    console.log(`   - Created ${categories.length} categories`);
    console.log(`   - Created 1 default professor account`);
    console.log(`   - Updated ${existingCourses.length} courses`);
    console.log('');
    console.log('🔐 Default professor credentials:');
    console.log('   Phone: +201000000000');
    console.log('   Password: professor123');
    console.log('');
    console.log('⚠️  Remember to:');
    console.log('   1. Change the default professor password');
    console.log('   2. Update professor profile information');
    console.log('   3. Create additional categories as needed');

  } catch (error) {
    console.error('❌ Migration failed:', error);
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