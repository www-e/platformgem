// scripts/test-viewing-history.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testViewingHistory() {
  console.log("🧪 Testing Viewing History System...\n");

  try {
    // Get test data
    const courses = await prisma.course.findMany({
      take: 1,
      include: {
        lessons: {
          orderBy: { order: "asc" },
          take: 2,
        },
        professor: {
          select: { name: true },
        },
      },
    });

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      take: 2,
    });

    if (courses.length === 0 || students.length === 0) {
      console.log(
        "❌ No test data found. Please run create-test-data.ts first."
      );
      return;
    }

    const course = courses[0];
    const student = students[0];

    console.log("📚 Test Course:", course.title);
    console.log("👤 Test Student:", student.name);
    console.log("📖 Lessons:", course.lessons.length);
    console.log();

    // Test 1: Create viewing history records
    console.log("Test 1: Creating Viewing History Records");

    for (const lesson of course.lessons) {
      const viewingHistory = await prisma.viewingHistory.upsert({
        where: {
          userId_lessonId: {
            userId: student.id,
            lessonId: lesson.id,
          },
        },
        update: {
          watchedDuration: Math.floor(Math.random() * (lesson.duration || 600)),
          totalDuration: lesson.duration || 600,
          lastPosition: Math.floor(Math.random() * (lesson.duration || 600)),
          completed: Math.random() > 0.5,
        },
        create: {
          userId: student.id,
          lessonId: lesson.id,
          watchedDuration: Math.floor(Math.random() * (lesson.duration || 600)),
          totalDuration: lesson.duration || 600,
          lastPosition: Math.floor(Math.random() * (lesson.duration || 600)),
          completed: Math.random() > 0.5,
        },
      });

      console.log(`  ✅ ${lesson.title}:`);
      console.log(
        `     Watched: ${Math.floor(viewingHistory.watchedDuration / 60)}m`
      );
      console.log(
        `     Progress: ${Math.round(
          (viewingHistory.lastPosition / viewingHistory.totalDuration) * 100
        )}%`
      );
      console.log(`     Completed: ${viewingHistory.completed ? "Yes" : "No"}`);
    }
    console.log();

    // Test 2: Update enrollment progress
    console.log("Test 2: Updating Enrollment Progress");

    // Get all viewing history for this student in this course
    const allViewingHistory = await prisma.viewingHistory.findMany({
      where: {
        userId: student.id,
        lessonId: { in: course.lessons.map((l) => l.id) },
      },
    });

    const completedLessons = allViewingHistory.filter((vh) => vh.completed);
    const progressPercent = Math.round(
      (completedLessons.length / course.lessons.length) * 100
    );
    const totalWatchTime = allViewingHistory.reduce(
      (sum, vh) => sum + vh.watchedDuration,
      0
    );

    // Update enrollment
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id,
        },
      },
      update: {
        progressPercent,
        completedLessonIds: completedLessons.map((cl) => cl.lessonId),
        totalWatchTime,
        lastAccessedAt: new Date(),
      },
      create: {
        userId: student.id,
        courseId: course.id,
        progressPercent,
        completedLessonIds: completedLessons.map((cl) => cl.lessonId),
        totalWatchTime,
      },
    });

    console.log(`  ✅ Enrollment Updated:`);
    console.log(`     Progress: ${enrollment.progressPercent}%`);
    console.log(
      `     Completed Lessons: ${enrollment.completedLessonIds.length}/${course.lessons.length}`
    );
    console.log(
      `     Total Watch Time: ${Math.floor(
        enrollment.totalWatchTime / 60
      )} minutes`
    );
    console.log();

    // Test 3: Generate course analytics
    console.log("Test 3: Course Analytics");

    const analytics = await generateCourseAnalytics(course.id);
    console.log(`  📊 Course: ${analytics.course.title}`);
    console.log(`  👥 Students: ${analytics.overview.totalStudents}`);
    console.log(`  📚 Lessons: ${analytics.overview.totalLessons}`);
    console.log(
      `  ⏱️  Total Duration: ${Math.floor(
        analytics.overview.totalDuration / 60
      )} minutes`
    );
    console.log(
      `  📈 Completion Rate: ${analytics.overview.overallCompletionRate.toFixed(
        1
      )}%`
    );
    console.log(
      `  🎯 Engagement Rate: ${analytics.overview.engagementRate.toFixed(1)}%`
    );
    console.log();

    console.log("  📖 Lesson Analytics:");
    analytics.lessons.forEach((lesson) => {
      console.log(`    ${lesson.lesson.order}. ${lesson.lesson.title}`);
      console.log(
        `       Completion Rate: ${lesson.completionRate.toFixed(1)}%`
      );
      console.log(
        `       Avg Watch Time: ${Math.floor(lesson.averageWatchTime / 60)}m`
      );
    });
    console.log();

    // Test 4: Student progress tracking
    console.log("Test 4: Student Progress Tracking");

    analytics.students.forEach((studentData) => {
      console.log(`  👤 ${studentData.student.name}:`);
      console.log(`     Progress: ${studentData.progressPercent}%`);
      console.log(
        `     Completed: ${studentData.completedLessons}/${analytics.overview.totalLessons} lessons`
      );
      console.log(
        `     Watch Time: ${Math.floor(
          studentData.totalWatchTime / 60
        )} minutes`
      );
      console.log(
        `     Last Access: ${
          studentData.lastAccessedAt
            ? new Date(studentData.lastAccessedAt).toLocaleDateString("ar-EG")
            : "Never"
        }`
      );
    });
    console.log();

    console.log("✅ Viewing History System Test Completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate course analytics
async function generateCourseAnalytics(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
    },
  });

  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    select: {
      id: true,
      title: true,
      order: true,
      duration: true,
    },
    orderBy: { order: "asc" },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const viewingHistory = await prisma.viewingHistory.findMany({
    where: {
      lessonId: { in: lessons.map((l) => l.id) },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      lesson: {
        select: {
          id: true,
          title: true,
          order: true,
        },
      },
    },
  });

  const totalStudents = enrollments.length;
  const totalLessons = lessons.length;
  const totalDuration = lessons.reduce(
    (sum, lesson) => sum + (lesson.duration || 0),
    0
  );

  const studentProgress = enrollments.map((enrollment) => {
    const studentViewingHistory = viewingHistory.filter(
      (vh) => vh.user.id === enrollment.user.id
    );
    const completedLessons = studentViewingHistory.filter(
      (vh) => vh.completed
    ).length;
    const totalWatchTime = studentViewingHistory.reduce(
      (sum, vh) => sum + vh.watchedDuration,
      0
    );

    return {
      student: enrollment.user,
      enrolledAt: enrollment.enrolledAt,
      progressPercent: enrollment.progressPercent,
      completedLessons,
      totalWatchTime,
      lastAccessedAt: enrollment.lastAccessedAt,
    };
  });

  const lessonAnalytics = lessons.map((lesson) => {
    const lessonViewingHistory = viewingHistory.filter(
      (vh) => vh.lesson.id === lesson.id
    );
    const completedCount = lessonViewingHistory.filter(
      (vh) => vh.completed
    ).length;
    const totalWatchTime = lessonViewingHistory.reduce(
      (sum, vh) => sum + vh.watchedDuration,
      0
    );
    const averageWatchTime =
      lessonViewingHistory.length > 0
        ? totalWatchTime / lessonViewingHistory.length
        : 0;

    return {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        duration: lesson.duration,
      },
      completedCount,
      completionRate:
        totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0,
      totalWatchTime,
      averageWatchTime,
      viewCount: lessonViewingHistory.length,
    };
  });

  const totalCompletedLessons = viewingHistory.filter(
    (vh) => vh.completed
  ).length;
  const overallCompletionRate =
    totalLessons * totalStudents > 0
      ? (totalCompletedLessons / (totalLessons * totalStudents)) * 100
      : 0;

  const totalWatchTime = viewingHistory.reduce(
    (sum, vh) => sum + vh.watchedDuration,
    0
  );
  const engagementRate =
    totalDuration > 0
      ? (totalWatchTime / (totalDuration * totalStudents)) * 100
      : 0;

  return {
    course: course!,
    overview: {
      totalStudents,
      totalLessons,
      totalDuration,
      overallCompletionRate,
      engagementRate,
      recentActivity: 0,
    },
    students: studentProgress,
    lessons: lessonAnalytics,
  };
}

// Run the test
testViewingHistory();

export { testViewingHistory };
