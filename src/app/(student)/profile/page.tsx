// src/app/(student)/profile/page.tsx

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EnrolledCourses from "@/components/profile/EnrolledCourses";
import ExamHistory from "@/components/profile/ExamHistory";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileActions from "@/components/profile/ProfileActions";
import QuickAccessCard from "@/components/profile/QuickAccessCard"; // Import the new component

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all student data in one go, with a new sort order
  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        // THIS IS THE KEY CHANGE: Sort by updatedAt to find the most recent course
        orderBy: {
          enrolledAt: 'desc' 
        },
        include: {
          course: {
            include: {
              lessons: {
                orderBy: { order: 'asc' } // Ensure lessons within the course are ordered correctly
              },
              _count: {
                select: { lessons: true }
              }
            }
          }
        },
      },
    },
  });

  if (!student) {
    redirect("/login");
  }
  
  // The most recently active enrollment will be the first in the array, if it exists.
  const mostRecentEnrollment = student.enrollments.length > 0 ? student.enrollments[0] : null;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <ProfileHeader 
          name={student.name}
          grade={student.grade}
          enrollmentCount={student.enrollments.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* The new Quick Access card gets the most prominent spot */}
            <QuickAccessCard mostRecentEnrollment={mostRecentEnrollment} />
            
            {/* The full list of courses is now secondary */}
            <EnrolledCourses enrollments={student.enrollments} />
          </div>

          <div className="space-y-8">
            <ExamHistory examHistory={student.examHistory} />
            <ProfileActions />
          </div>
        </div>
      </div>
    </div>
  );
}