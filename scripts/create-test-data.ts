// scripts/create-test-data.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🔧 Creating test data for course access control...\n');

  try {
    // Create test category
    const category = await prisma.category.upsert({
      where: { slug: 'programming' },
      update: {},
      create: {
        name: 'البرمجة',
        slug: 'programming',
        description: 'دورات البرمجة وتطوير البرمجيات',
        iconUrl: '/icons/code.svg'
      }
    });
    console.log('✅ Category created:', category.name);

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const admin = await prisma.user.upsert({
      where: { phone: '01000000001' },
      update: {},
      create: {
        name: 'مدير النظام',
        email: 'admin@test.com',
        phone: '01000000001',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    const professor = await prisma.user.upsert({
      where: { phone: '01000000002' },
      update: {},
      create: {
        name: 'د. أحمد محمد',
        email: 'professor@test.com',
        phone: '01000000002',
        password: hashedPassword,
        role: 'PROFESSOR',
        bio: 'أستاذ علوم الحاسوب',
        expertise: ['JavaScript', 'React', 'Node.js']
      }
    });

    const student = await prisma.user.upsert({
      where: { phone: '01000000003' },
      update: {},
      create: {
        name: 'محمد علي',
        email: 'student@test.com',
        phone: '01000000003',
        password: hashedPassword,
        role: 'STUDENT'
      }
    });

    console.log('✅ Users created:');
    console.log(`  - Admin: ${admin.name}`);
    console.log(`  - Professor: ${professor.name}`);
    console.log(`  - Student: ${student.name}`);

    // Create test courses
    const freeCourse = await prisma.course.upsert({
      where: { id: 'free-course-test' },
      update: {},
      create: {
        id: 'free-course-test',
        title: 'مقدمة في البرمجة - مجاني',
        description: 'دورة مجانية لتعلم أساسيات البرمجة',
        price: 0,
        currency: 'EGP',
        isPublished: true,
        categoryId: category.id,
        professorId: professor.id,
        thumbnailUrl: '/placeholder-course.jpg',
        bunnyLibraryId: 'test-library-free'
      }
    });

    const paidCourse = await prisma.course.upsert({
      where: { id: 'paid-course-test' },
      update: {},
      create: {
        id: 'paid-course-test',
        title: 'تطوير تطبيقات الويب المتقدمة',
        description: 'دورة متقدمة لتطوير تطبيقات الويب باستخدام React و Node.js',
        price: 299,
        currency: 'EGP',
        isPublished: true,
        categoryId: category.id,
        professorId: professor.id,
        thumbnailUrl: '/placeholder-course.jpg',
        bunnyLibraryId: 'test-library-paid'
      }
    });

    console.log('✅ Courses created:');
    console.log(`  - Free Course: ${freeCourse.title}`);
    console.log(`  - Paid Course: ${paidCourse.title} (${paidCourse.price} ${paidCourse.currency})`);

    // Create test lessons
    const freeLessons = await Promise.all([
      prisma.lesson.upsert({
        where: { id: 'lesson-1-free' },
        update: {},
        create: {
          id: 'lesson-1-free',
          title: 'مقدمة في البرمجة',
          order: 1,
          duration: 600, // 10 minutes
          bunnyVideoId: 'test-video-1',
          courseId: freeCourse.id
        }
      }),
      prisma.lesson.upsert({
        where: { id: 'lesson-2-free' },
        update: {},
        create: {
          id: 'lesson-2-free',
          title: 'المتغيرات والثوابت',
          order: 2,
          duration: 900, // 15 minutes
          bunnyVideoId: 'test-video-2',
          courseId: freeCourse.id
        }
      })
    ]);

    const paidLessons = await Promise.all([
      prisma.lesson.upsert({
        where: { id: 'lesson-1-paid' },
        update: {},
        create: {
          id: 'lesson-1-paid',
          title: 'إعداد بيئة التطوير',
          order: 1,
          duration: 1200, // 20 minutes
          bunnyVideoId: 'test-video-3',
          courseId: paidCourse.id
        }
      }),
      prisma.lesson.upsert({
        where: { id: 'lesson-2-paid' },
        update: {},
        create: {
          id: 'lesson-2-paid',
          title: 'بناء أول تطبيق React',
          order: 2,
          duration: 1800, // 30 minutes
          bunnyVideoId: 'test-video-4',
          courseId: paidCourse.id
        }
      })
    ]);

    console.log('✅ Lessons created:');
    console.log(`  - Free course lessons: ${freeLessons.length}`);
    console.log(`  - Paid course lessons: ${paidLessons.length}`);

    // Create a test enrollment for the student in the free course
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: freeCourse.id
        }
      },
      update: {},
      create: {
        userId: student.id,
        courseId: freeCourse.id,
        progressPercent: 25,
        completedLessonIds: [freeLessons[0].id],
        totalWatchTime: 600
      }
    });

    console.log('✅ Test enrollment created for student in free course');

    // Create a test pending payment for the paid course
    const payment = await prisma.payment.upsert({
      where: { id: 'test-payment-1' },
      update: {},
      create: {
        id: 'test-payment-1',
        userId: student.id,
        courseId: paidCourse.id,
        amount: paidCourse.price ? Number(paidCourse.price) : 0,
        currency: paidCourse.currency,
        status: 'PENDING',
        paymobOrderId: 'test-order-123',
        paymobResponse: {
          orderId: 'test-order-123',
          paymentKey: 'test-key-123'
        }
      }
    });

    console.log('✅ Test pending payment created for paid course');

    console.log('\n🎉 Test data creation completed!');
    console.log('\nTest accounts:');
    console.log('  Admin: admin@test.com / password123');
    console.log('  Professor: professor@test.com / password123');
    console.log('  Student: student@test.com / password123');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestData();

export { createTestData };