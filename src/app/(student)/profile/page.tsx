// src/app/(student)/profile/page.tsx

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EnrolledCourses from "@/components/profile/EnrolledCourses";
import ExamHistory from "@/components/profile/ExamHistory";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileActions from "@/components/profile/ProfileActions";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all student data in one go
  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              _count: {
                select: { lessons: true }
              }
            }
          }
        },
        orderBy: {
          enrolledAt: 'desc'
        }
      },
    },
  });

  if (!student) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <ProfileHeader 
          name={student.name}
          grade={student.grade}
          enrollmentCount={student.enrollments.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
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