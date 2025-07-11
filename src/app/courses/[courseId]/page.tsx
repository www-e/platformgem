// src/app/courses/[courseId]/page.tsx
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LectureSidebar } from "@/components/course/lecture-sidebar";
import { AlertTriangle, BookOpen, CheckCircle2, PlayCircle } from "lucide-react";
import CoursePlayerClient from "@/components/course/CoursePlayerClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function CoursePlayerPage({
  params,
  searchParams,
}: {
  params: { courseId: string; };
  searchParams: { lesson?: string; };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { courseId } = params;
  const lessonIdFromQuery = searchParams.lesson;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: courseId } },
    include: {
      course: {
        include: { lessons: { orderBy: { order: "asc" } } }
      }
    }
  });

  if (!enrollment) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-foreground text-center p-4">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-3xl font-bold">Enrollment Not Found</h1>
            <p className="text-lg text-muted-foreground mt-2">You are not enrolled in this course.</p>
        </div>
    );
  }

  const { course } = enrollment;
  const currentLesson = lessonIdFromQuery
    ? course.lessons.find((l) => l.id === lessonIdFromQuery)
    : course.lessons[0];

  if (!currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-foreground text-center p-4">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold">Lesson Not Found</h1>
        <p className="text-lg text-muted-foreground mt-2">The requested lesson could not be found.</p>
      </div>
    );
  }

  const currentLessonIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentLessonIndex > 0 ? course.lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < course.lessons.length - 1 ? course.lessons[currentLessonIndex + 1] : null;
  const isCompleted = enrollment.completedLessonIds.includes(currentLesson.id);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8 max-w-screen-2xl mx-auto">
        
        <div className="flex-grow">
          <CoursePlayerClient
            courseId={course.id}
            bunnyLibraryId={course.bunnyLibraryId}
            currentLesson={currentLesson}
            isCompleted={isCompleted}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
          />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-full lg:w-80 xl:w-96 flex-shrink-0">
          <LectureSidebar
            course={course}
            currentLessonId={currentLesson.id}
            completedLessons={enrollment.completedLessonIds}
          />
        </div>
        
        {/* Mobile Accordion */}
        <div className="block lg:hidden">
            <Accordion type="single" collapsible className="bg-card rounded-lg">
                <AccordionItem value="lessons" className="border-b-0">
                    <AccordionTrigger className="text-lg p-4 hover:no-underline">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5"/>
                            قائمة الدروس
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-2">
                        {course.lessons.map(lesson => {
                             const isLessonCompleted = enrollment.completedLessonIds.includes(lesson.id);
                             const isCurrent = lesson.id === currentLesson.id;
                             return (
                                <Link key={lesson.id} href={`/courses/${course.id}?lesson=${lesson.id}`} className={cn(`flex items-center gap-4 p-3 rounded-lg w-full text-right`, isCurrent && 'bg-primary/20')}>
                                    <div className="flex-shrink-0">
                                        {isLessonCompleted ? <CheckCircle2 className="w-5 h-5 text-secondary" /> : <PlayCircle className="w-5 h-5 text-muted-foreground" />}
                                    </div>
                                    <p className={cn(`font-medium`, isCurrent ? 'text-primary' : 'text-foreground')}>{lesson.title}</p>
                                </Link>
                             )
                        })}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>

      </div>
    </div>
  );
}