// src/components/profile/QuickAccessCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Lesson } from "@prisma/client";

// Define a more specific type for the prop this component expects
type EnrollmentWithCourseAndLessons = {
  course: {
    id: string;
    title: string;
    lessons: Lesson[]; // We need the full lesson objects here
    _count: { lessons: number };
  };
  completedLessonIds: string[];
} | null;

interface QuickAccessCardProps {
  mostRecentEnrollment: EnrollmentWithCourseAndLessons;
}

export default function QuickAccessCard({ mostRecentEnrollment }: QuickAccessCardProps) {
  if (!mostRecentEnrollment) {
    return null; // Don't render anything if the user has no enrollments
  }

  const { course, completedLessonIds } = mostRecentEnrollment;
  const totalLessons = course.lessons.length;
  const progress = totalLessons > 0 ? (completedLessonIds.length / totalLessons) * 100 : 0;

  // --- Logic to find the next lesson ---
  let nextLesson = null;
  // Find the first lesson in the ordered list that is NOT in the completed set
  for (const lesson of course.lessons) {
    if (!completedLessonIds.includes(lesson.id)) {
      nextLesson = lesson;
      break;
    }
  }
  // If all lessons are complete, default to the last lesson
  if (!nextLesson && totalLessons > 0) {
    nextLesson = course.lessons[totalLessons - 1];
  }
  // --- End of logic ---

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