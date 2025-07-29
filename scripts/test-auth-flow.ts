// scripts/test-auth-flow.ts
// Test authentication flow

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAuthFlow() {
  console.log('🔍 Testing authentication flow...');
  
  try {
    // Check if we have any users
    const userCount = await prisma.user.count();
    console.log('Total users in database:', userCount);
    
    if (userCount === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    // Get a student user
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true
      }
    });
    
    if (!student) {
      console.log('❌ No student users found');
      return;
    }
    
    console.log('✅ Found student user:', {
      id: student.id,
      name: student.name,
      email: student.email,
      role: student.role,
      phone: student.phone
    });
    
    // Check if we have any courses
    const courseCount = await prisma.course.count({
      where: { isPublished: true }
    });
    console.log('Published courses:', courseCount);
    
    if (courseCount === 0) {
      console.log('❌ No published courses found');
      return;
    }
    
    // Get a paid course
    const paidCourse = await prisma.course.findFirst({
      where: { 
        isPublished: true,
        price: { gt: 0 }
      },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        professorId: true
      }
    });
    
    if (!paidCourse) {
      console.log('❌ No paid courses found');
      return;
    }
    
    console.log('✅ Found paid course:', {
      id: paidCourse.id,
      title: paidCourse.title,
      price: paidCourse.price,
      currency: paidCourse.currency
    });
    
    // Check if student is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: paidCourse.id
        }
      }
    });
    
    if (existingEnrollment) {
      console.log('⚠️ Student is already enrolled in this course');
    } else {
      console.log('✅ Student is not enrolled - can proceed with payment');
    }
    
    // Check if there are any pending payments
    const pendingPayments = await prisma.payment.findMany({
      where: {
        userId: student.id,
        courseId: paidCourse.id,
        status: 'PENDING'
      }
    });
    
    console.log('Pending payments for this course:', pendingPayments.length);
    
    console.log('🎉 Authentication flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthFlow();