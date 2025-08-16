// src/components/profile/QuickAccessCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, PlayCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// This is now an async Server Component
export default async function QuickAccessCard() {
  const session = await auth();
  if (!session?.user?.id) {
    return null; // Should not happen if page is protected, but good practice
  }

  // Fetch only the most recent enrollment for THIS component
  const mostRecentEnrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id },
    orderBy: { enrolledAt: 'desc' },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, order: true } // Select only what's needed
          },
          _count: {
            select: { lessons: true }
          }
        }
      }
    }
  });

  if (!mostRecentEnrollment) {
    return null; // Don't render if no enrollments
  }

  const { course, completedLessonIds } = mostRecentEnrollment;
  const totalLessons = course._count.lessons;
  const progress = totalLessons > 0 ? (completedLessonIds.length / totalLessons) * 100 : 0;

  let nextLesson = null;
  for (const lesson of course.lessons) {
    if (!completedLessonIds.includes(lesson.id)) {
      nextLesson = lesson;
      break;
    }
  }
  if (!nextLesson && totalLessons > 0) {
    nextLesson = course.lessons[totalLessons - 1];
  }

  return (
    <Card className="bg-card border-primary/20 border-2 card-hover-effect">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-primary mb-2">
            <History className="w-4 h-4" />
            <span>آخر نشاط لك</span>
        </div>
        <CardTitle className="text-2xl">{course.title}</CardTitle>
        <CardDescription>
          أكملت {completedLessonIds.length} من {totalLessons} درسًا.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-muted rounded-full h-2.5 mb-6">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        
        {nextLesson && (
          <Button asChild size="lg" className="w-full btn-hover-effect">
            <Link href={`/courses/${course.id}?lesson=${nextLesson.id}`}>
              <PlayCircle className="ml-2 h-5 w-5" />
              اكمل من حيث توقفت
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}