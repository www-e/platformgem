// src/app/courses/[courseId]/page.tsx

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSignedBunnyUrl } from "@/lib/bunny";
import { redirect } from "next/navigation";

import { VideoPlayer } from "@/components/course/video-player";
import { LectureSidebar } from "@/components/course/lecture-sidebar";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { CompletionButton } from "./_components/completion-button";
import type { Lesson, Course, Enrollment } from "@prisma/client";

interface CoursePlayerPageProps {
  params: {
    courseId: string;
  };
  searchParams: {
    lesson?: string;
  };
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

  // 1. Fetch enrollment + course + lessons in one go
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
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
            orderBy: { order: "asc" as const },
          },
        },
      },
    },
  });

  const { course } = enrollment;

  // 2. Determine current lesson
  const currentLesson: Lesson | undefined = lessonIdFromQuery
    ? course.lessons.find((l: Lesson) => l.id === lessonIdFromQuery)
    : course.lessons[0];

  if (!currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white text-center p-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold">Lesson Not Found</h1>
        <p className="text-lg text-gray-400 mt-2">
          The requested lesson could not be found in this course.
        </p>
      </div>
    );
  }

  // 3. Generate secure video URL
  const secureVideoUrl = getSignedBunnyUrl(
    course.bunnyLibraryId,
    currentLesson.bunnyVideoId
  );

  return (
    <div className="min-h-screen bg-slate-900 p-4 lg:p-8">
      <div className="flex flex-col md:flex-row gap-8 max-w-screen-2xl mx-auto">
        {/* Main Content */}
        <main className="flex-grow">
          <VideoPlayer url={secureVideoUrl} />

          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {currentLesson.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <ShieldCheck className="w-5 h-5" />
              <span>Secure video stream enabled.</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <CompletionButton
              courseId={course.id}
              lessonId={currentLesson.id}
              isCompleted={enrollment.completedLessonIds.includes(
                currentLesson.id
              )}
            />
          </div>
        </main>

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
