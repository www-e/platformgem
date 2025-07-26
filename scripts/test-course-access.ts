// scripts/test-course-access.ts
import { PrismaClient } from "@prisma/client";
import {
  checkCourseAccess,
  enrollInFreeCourse,
  canEnrollInCourse,
} from "../src/lib/course-access";

const prisma = new PrismaClient();

async function testCourseAccess() {
  console.log("🧪 Testing Course Access Control System...\n");

  try {
    // Get test data
    const courses = await prisma.course.findMany({
      take: 2,
      include: {
        category: true,
        professor: true,
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    });

    const users = await prisma.user.findMany({
      take: 3,
      where: {
        role: {
          in: ["STUDENT", "PROFESSOR", "ADMIN"],
        },
      },
    });

    if (courses.length === 0) {
      console.log(
        "❌ No courses found. Please create some test courses first."
      );
      return;
    }

    if (users.length === 0) {
      console.log("❌ No users found. Please create some test users first.");
      return;
    }

    console.log("📚 Test Courses:");
    courses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.title}`);
      console.log(`     Category: ${course.category.name}`);
      console.log(`     Professor: ${course.professor.name}`);
      console.log(
        `     Price: ${
          course.price ? `${course.price} ${course.currency}` : "Free"
        }`
      );
      console.log(`     Published: ${course.isPublished ? "Yes" : "No"}`);
      console.log(`     Lessons: ${course._count.lessons}`);
      console.log(`     Enrollments: ${course._count.enrollments}\n`);
    });

    console.log("👥 Test Users:");
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.role})`);
    });
    console.log();

    // Test course access for different scenarios
    const testCourse = courses[0];
    console.log(`🔍 Testing access to course: "${testCourse.title}"\n`);

    // Test 1: Check if course is free or paid
    console.log("Test 1: Course Type Check");
    const isFree = !testCourse.price || Number(testCourse.price) <= 0;
    console.log(`Course is: ${isFree ? "FREE" : "PAID"}`);
    if (!isFree) {
      console.log(`Price: ${testCourse.price} ${testCourse.currency}`);
    }
    console.log();

    // Test 2: Check enrollment eligibility
    console.log("Test 2: Enrollment Eligibility Check");
    const student = users.find((u) => u.role === "STUDENT");
    if (student) {
      console.log(
        `Checking enrollment eligibility for student: ${student.name}`
      );
      const canEnroll = await canEnrollInCourse(testCourse.id);
      console.log(`Can enroll: ${canEnroll.canEnroll}`);
      console.log(`Reason: ${canEnroll.reason}`);
    }
    console.log();

    // Test 3: Test free course enrollment (if applicable)
    if (isFree && student) {
      console.log("Test 3: Free Course Enrollment");
      console.log(`Attempting to enroll ${student.name} in free course...`);

      // Check if already enrolled
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: student.id,
            courseId: testCourse.id,
          },
        },
      });

      if (existingEnrollment) {
        console.log("✅ Student is already enrolled");
      } else {
        const enrollmentResult = await enrollInFreeCourse(testCourse.id);
        console.log(
          `Enrollment result: ${
            enrollmentResult.success ? "✅ Success" : "❌ Failed"
          }`
        );
        console.log(`Message: ${enrollmentResult.message}`);
        if (enrollmentResult.enrollmentId) {
          console.log(`Enrollment ID: ${enrollmentResult.enrollmentId}`);
        }
      }
    }
    console.log();

    // Test 4: Check access for different user roles
    console.log("Test 4: Role-based Access Check");
    for (const user of users) {
      console.log(`\nChecking access for ${user.name} (${user.role}):`);

      try {
        const accessResult = await checkCourseAccess(testCourse.id);
        console.log(
          `  Has Access: ${accessResult.hasAccess ? "✅ Yes" : "❌ No"}`
        );
        console.log(`  Reason: ${accessResult.reason}`);

        if (accessResult.enrollment) {
          console.log(
            `  Enrollment Progress: ${accessResult.enrollment.progressPercent}%`
          );
        }

        if (accessResult.payment) {
          console.log(`  Payment Status: ${accessResult.payment.status}`);
        }
      } catch (error) {
        console.log(
          `  Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Test 5: Payment-to-Enrollment Flow (simulation)
    console.log("\nTest 5: Payment-to-Enrollment Flow Simulation");
    const paidCourse = courses.find((c) => c.price && Number(c.price) > 0);
    if (paidCourse && student) {
      console.log(`Testing payment flow for course: "${paidCourse.title}"`);

      // Check if there's a pending payment
      const pendingPayment = await prisma.payment.findFirst({
        where: {
          userId: student.id,
          courseId: paidCourse.id,
          status: "PENDING",
        },
      });

      if (pendingPayment) {
        console.log("✅ Found pending payment");
        console.log(`Payment ID: ${pendingPayment.id}`);
        console.log(
          `Amount: ${pendingPayment.amount} ${pendingPayment.currency}`
        );

        // Simulate successful payment webhook
        console.log("Simulating successful payment completion...");
        await prisma.$transaction(async (tx) => {
          // Update payment to completed
          await tx.payment.update({
            where: { id: pendingPayment.id },
            data: {
              status: "COMPLETED",
              paymobTxnId: "test_txn_" + Date.now(),
            },
          });

          // Create enrollment
          const enrollment = await tx.enrollment.upsert({
            where: {
              userId_courseId: {
                userId: student.id,
                courseId: paidCourse.id,
              },
            },
            create: {
              userId: student.id,
              courseId: paidCourse.id,
              progressPercent: 0,
              completedLessonIds: [],
              totalWatchTime: 0,
            },
            update: {},
          });

          console.log("✅ Payment completed and enrollment created");
          console.log(`Enrollment ID: ${enrollment.id}`);
        });
      } else {
        console.log("ℹ️  No pending payment found for this course");
      }
    } else {
      console.log("ℹ️  No paid courses available for testing");
    }

    console.log("\n✅ Course Access Control System Test Completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCourseAccess();

export { testCourseAccess };
