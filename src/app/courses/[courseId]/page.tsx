// src/app/courses/[courseId]/page.tsx

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSignedBunnyUrl } from "@/lib/bunny";
import { redirect } from "next/navigation";
import { VideoPlayer } from "@/components/course/video-player";
import { LectureSidebar } from "@/components/course/lecture-sidebar";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { CompletionButton } from "./_components/completion-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lesson } from "@prisma/client";

interface CoursePlayerPageProps {
  params: { courseId: string; };
  searchParams: { lesson?: string; };
}

export default async function CoursePlayerPage({
  params,
  searchParams,
}: CoursePlayerPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { courseId } = params;
  const lessonIdFromQuery = searchParams.lesson;

  // Fetch enrollment, course, and lessons in one efficient query
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId,
      },
    },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!enrollment) {
    // This case should be rare, but it's a good safeguard
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-foreground text-center p-4">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-3xl font-bold">Enrollment Not Found</h1>
            <p className="text-lg text-muted-foreground mt-2">
            You are not enrolled in this course.
            </p>
        </div>
    )
  }

  const { course } = enrollment;
  const currentLesson: Lesson | undefined = lessonIdFromQuery
    ? course.lessons.find((l) => l.id === lessonIdFromQuery)
    : course.lessons[0];

  if (!currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-foreground text-center p-4">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold">Lesson Not Found</h1>
        <p className="text-lg text-muted-foreground mt-2">
          The requested lesson could not be found in this course.
        </p>
      </div>
    );
  }

  const secureVideoUrl = getSignedBunnyUrl(
    course.bunnyLibraryId,
    currentLesson.bunnyVideoId
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8 max-w-screen-2xl mx-auto">
        
        {/* Main Content */}
        <div className="flex-grow">
            <Card className="bg-card">
                <CardHeader className="p-0">
                    <VideoPlayer url={secureVideoUrl} />
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                                {currentLesson.title}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ShieldCheck className="w-5 h-5 text-secondary" />
                                <span>يتم تأمين هذا المحتوى لبث الفيديو.</span>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <CompletionButton
                                courseId={course.id}
                                lessonId={currentLesson.id}
                                isCompleted={enrollment.completedLessonIds.includes(
                                    currentLesson.id
                                )}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Sidebar */}
        <LectureSidebar
          course={course}
          currentLessonId={currentLesson.id}
          completedLessons={enrollment.completedLessonIds}
        />
      </div>
    </div>
  );
}