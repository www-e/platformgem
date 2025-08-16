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
import prisma from '@/lib/prisma';

// This is now the main layout component for the profile page
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

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ProfileHeader renders instantly with minimal data */}
        <ProfileHeader 
          name={user.name}
          role={user.role}
          enrollmentCount={user._count.enrollments}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* Each data-heavy component is wrapped in Suspense */}
            <Suspense fallback={<QuickAccessCardSkeleton />}>
              <QuickAccessCard />
            </Suspense>
            
            <Suspense fallback={<EnrolledCoursesSkeleton />}>
              <EnrolledCourses />
            </Suspense>
          </div>

          <div className="space-y-8">
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