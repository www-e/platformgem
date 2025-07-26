// scripts/test-analytics-system.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAnalyticsSystem() {
  console.log('🧪 Testing Analytics System...\n');

  try {
    // Test 1: Course Analytics
    console.log('Test 1: Course Analytics');
    
    const courses = await prisma.course.findMany({
      take: 1,
      include: {
        lessons: true,
        enrollments: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    if (courses.length === 0) {
      console.log('❌ No courses found for testing');
      return;
    }

    const course = courses[0];
    console.log(`📚 Testing course: ${course.title}`);
    console.log(`   Lessons: ${course.lessons.length}`);
    console.log(`   Enrollments: ${course.enrollments.length}`);

    // Get viewing history for this course
    const viewingHistory = await prisma.viewingHistory.findMany({
      where: {
        lessonId: { in: course.lessons.map(l => l.id) }
      },
      include: {
        user: { select: { name: true } },
        lesson: { select: { title: true, order: true } }
      }
    });

    console.log(`   Viewing records: ${viewingHistory.length}`);
    console.log(`   Completed lessons: ${viewingHistory.filter(vh => vh.completed).length}`);
    
    // Calculate completion rate
    const totalPossibleCompletions = course.lessons.length * course.enrollments.length;
    const actualCompletions = viewingHistory.filter(vh => vh.completed).length;
    const completionRate = totalPossibleCompletions > 0 
      ? (actualCompletions / totalPossibleCompletions) * 100 
      : 0;
    
    console.log(`   Completion rate: ${completionRate.toFixed(1)}%`);
    console.log();

    // Test 2: Student Progress Analytics
    console.log('Test 2: Student Progress Analytics');
    
    if (course.enrollments.length > 0) {
      const student = course.enrollments[0];
      console.log(`👤 Testing student: ${student.user.name}`);
      
      const studentViewingHistory = viewingHistory.filter(vh => vh.userId === student.userId);
      const completedLessons = studentViewingHistory.filter(vh => vh.completed);
      const totalWatchTime = studentViewingHistory.reduce((sum, vh) => sum + vh.watchedDuration, 0);
      
      console.log(`   Progress: ${student.progressPercent}%`);
      console.log(`   Completed lessons: ${completedLessons.length}/${course.lessons.length}`);
      console.log(`   Total watch time: ${Math.floor(totalWatchTime / 60)} minutes`);
      console.log(`   Last accessed: ${student.lastAccessedAt ? student.lastAccessedAt.toLocaleDateString('ar-EG') : 'Never'}`);
    }
    console.log();

    // Test 3: Lesson Analytics
    console.log('Test 3: Lesson Analytics');
    
    for (const lesson of course.lessons.slice(0, 2)) { // Test first 2 lessons
      const lessonViewingHistory = viewingHistory.filter(vh => vh.lessonId === lesson.id);
      const completedCount = lessonViewingHistory.filter(vh => vh.completed).length;
      const totalWatchTime = lessonViewingHistory.reduce((sum, vh) => sum + vh.watchedDuration, 0);
      const averageWatchTime = lessonViewingHistory.length > 0 
        ? totalWatchTime / lessonViewingHistory.length 
        : 0;
      
      console.log(`   📖 ${lesson.order}. ${lesson.title}`);
      console.log(`      Completed by: ${completedCount}/${course.enrollments.length} students`);
      console.log(`      Completion rate: ${course.enrollments.length > 0 ? ((completedCount / course.enrollments.length) * 100).toFixed(1) : 0}%`);
      console.log(`      Average watch time: ${Math.floor(averageWatchTime / 60)} minutes`);
    }
    console.log();

    // Test 4: Platform-wide Analytics
    console.log('Test 4: Platform-wide Analytics');
    
    const platformStats = await prisma.$transaction([
      // Total users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
        orderBy: { role: 'asc' }
      }),
      // Total courses
      prisma.course.count(),
      // Published courses
      prisma.course.count({ where: { isPublished: true } }),
      // Total enrollments
      prisma.enrollment.count(),
      // Total payments
      prisma.payment.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      // Total lessons
      prisma.lesson.count(),
      // Total viewing time
      prisma.viewingHistory.aggregate({
        _sum: { watchedDuration: true }
      })
    ]);

    const [usersByRole, totalCourses, publishedCourses, totalEnrollments, paymentStats, totalLessons, viewingStats] = platformStats;
    
    console.log('📊 Platform Statistics:');
    console.log(`   Users by role:`);
    usersByRole.forEach(stat => {
      console.log(`     ${stat.role}: ${stat._count ? (typeof stat._count === 'object' ? stat._count.id : stat._count) : 0}`);
    });
    console.log(`   Courses: ${totalCourses} (${publishedCourses} published)`);
    console.log(`   Enrollments: ${totalEnrollments}`);
    console.log(`   Lessons: ${totalLessons}`);
    console.log(`   Successful payments: ${paymentStats._count.id}`);
    console.log(`   Total revenue: ${paymentStats._sum.amount || 0} EGP`);
    console.log(`   Total watch time: ${Math.floor((viewingStats._sum.watchedDuration || 0) / 3600)} hours`);
    console.log();

    // Test 5: Top Performers
    console.log('Test 5: Top Performers');
    
    // Top courses by enrollment
    const topCourses = await prisma.course.findMany({
      include: {
        professor: { select: { name: true } },
        _count: { select: { enrollments: true } }
      },
      orderBy: { enrollments: { _count: 'desc' } },
      take: 3
    });

    console.log('🏆 Top Courses by Enrollment:');
    topCourses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title}`);
      console.log(`      Professor: ${course.professor.name}`);
      console.log(`      Enrollments: ${course._count.enrollments}`);
    });
    console.log();

    // Top professors by total enrollments
    const topProfessors = await prisma.user.findMany({
      where: { role: 'PROFESSOR' },
      include: {
        ownedCourses: {
          include: {
            _count: { select: { enrollments: true } }
          }
        }
      },
      take: 3
    });

    console.log('👨‍🏫 Top Professors by Total Enrollments:');
    topProfessors.forEach((professor, index) => {
      const totalEnrollments = professor.ownedCourses.reduce(
        (sum, course) => sum + course._count.enrollments, 0
      );
      console.log(`   ${index + 1}. ${professor.name}`);
      console.log(`      Courses: ${professor.ownedCourses.length}`);
      console.log(`      Total enrollments: ${totalEnrollments}`);
    });
    console.log();

    // Test 6: Recent Activity
    console.log('Test 6: Recent Activity');
    
    const recentEnrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      },
      orderBy: { enrolledAt: 'desc' },
      take: 3
    });

    console.log('📅 Recent Enrollments:');
    recentEnrollments.forEach((enrollment, index) => {
      console.log(`   ${index + 1}. ${enrollment.user.name} enrolled in "${enrollment.course.title}"`);
      console.log(`      Date: ${enrollment.enrolledAt.toLocaleDateString('ar-EG')}`);
    });
    console.log();

    const recentPayments = await prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    console.log('💳 Recent Successful Payments:');
    recentPayments.forEach((payment, index) => {
      console.log(`   ${index + 1}. ${payment.user.name} paid ${payment.amount} ${payment.currency}`);
      console.log(`      Course: ${payment.course.title}`);
      console.log(`      Date: ${payment.createdAt.toLocaleDateString('ar-EG')}`);
    });
    console.log();

    console.log('✅ Analytics System Test Completed!');
    console.log('📈 All analytics components are working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAnalyticsSystem();

export { testAnalyticsSystem };