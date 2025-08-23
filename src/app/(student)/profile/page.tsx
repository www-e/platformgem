// src/app/(student)/profile/page.tsx
import { Suspense } from 'react';
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileActions from "@/components/profile/ProfileActions";
import QuickAccessCard from "@/components/profile/QuickAccessCard";
import EnrolledCourses from "@/components/profile/EnrolledCourses";
import ExamHistory from "@/components/profile/ExamHistory";
import MyCertificates from "@/components/profile/MyCertificates";
import { 
  QuickAccessCardSkeleton, 
  EnrolledCoursesSkeleton,
  MyCertificatesSkeleton,
  ExamHistorySkeleton
} from '@/components/skeletons/ProfileSkeletons';
import { StudentDashboard } from "@/components/student/StudentDashboard";
import prisma from '@/lib/prisma';

// This is now the main layout component for the profile/dashboard page
export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch only the minimal data needed for the header instantly
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
        name: true,
        role: true,
        _count: {
            select: { enrollments: true }
        }
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Create user object with correct property names for ProfileHeader
  const userProfile = {
    name: user.name,
    role: user.role,
    enrollmentCount: user._count.enrollments
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 w-full">
      <div className="max-w-8xl mx-auto w-full">
        {/* ProfileHeader renders instantly with minimal data */}
        <ProfileHeader {...userProfile} />

        {/* Unified Dashboard Content */}
        <div className="mt-6">
          <StudentDashboard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-8 w-full">
          <div className="lg:col-span-2 space-y-6 w-full">
            {/* Each data-heavy component is wrapped in Suspense */}
            <Suspense fallback={<QuickAccessCardSkeleton />}>
              <QuickAccessCard />
            </Suspense>
            
            <Suspense fallback={<EnrolledCoursesSkeleton />}>
              <EnrolledCourses />
            </Suspense>
          </div>

          <div className="space-y-6 w-full">
            <Suspense fallback={<MyCertificatesSkeleton />}>
               <MyCertificates />
            </Suspense>

            <Suspense fallback={<ExamHistorySkeleton />}>
              <ExamHistory />
            </Suspense>
            
            {/* ProfileActions is static and doesn't need Suspense */}
            <ProfileActions />
          </div>
        </div>
      </div>
    </div>
  );
}