// src/components/profile/EnrolledCourses.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// This is now an async Server Component
export default async function EnrolledCourses() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Fetch only the enrollments data for THIS component
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    orderBy: { enrolledAt: 'desc' },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookMarked className="w-6 h-6 text-primary" />
          <span>الدورات المسجلة</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {enrollments.length > 0 ? (
            enrollments.map(({ course, completedLessonIds }) => {
              const totalLessons = course._count.lessons;
              const progress = totalLessons > 0 ? (completedLessonIds.length / totalLessons) * 100 : 0;
              return (
                <div key={course.id} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h3 className="font-bold text-lg text-foreground">{course.title}</h3>
                    <Button asChild variant="secondary" className="bg-secondary/90 hover:bg-secondary text-secondary-foreground btn-hover-effect shrink-0">
                      <Link href={`/courses/${course.id}`}>اكمل المشاهدة</Link>
                    </Button>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-muted-foreground">اكتمل {completedLessonIds.length} من {totalLessons} درسًا</p>
                      <p className="text-sm font-semibold text-primary">{Math.round(progress)}%</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <BookMarked className="mx-auto w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">لم تسجل في أي دورات بعد. <Link href="/dashboard" className="text-primary hover:underline">تصفح الدورات المتاحة</Link></p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}