// src/app/courses/[courseId]/page.tsx

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSignedBunnyUrl } from "@/lib/bunny";
import { redirect } from "next/navigation";

import { VideoPlayer } from "@/components/course/video-player";
import { LectureSidebar } from "@/components/course/lecture-sidebar";
import { AlertTriangle, ShieldCheck } from "lucide-react";

// This is a special interface that Next.js uses for pages with dynamic routes and search params.
interface CoursePlayerPageProps {
  params: {
    courseId: string;
  };
  searchParams: {
    lesson: string; // The lesson ID will come from a URL query like ?lesson=...
  };
}

export default async function CoursePlayerPage({ params, searchParams }: CoursePlayerPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { courseId } = params;
  const { lesson: lessonIdFromQuery } = searchParams;

  // 1. Fetch the user's enrollment record for this specific course.
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId,
      },
      // Include the full course data and all its lessons in one query.
      course: {
        include: {
          lessons: {
            orderBy: {
              order: 'asc', // Ensure lessons are sorted correctly.
            },
          },
        },
      },
    },
  });

  // 2. SECURITY CHECK: If no enrollment is found, the user does not have access.
  if (!enrollment || !enrollment.course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white text-center p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-lg text-gray-400 mt-2">
          You are not enrolled in this course or it does not exist.
        </p>
      </div>
    );
  }

  const { course } = enrollment;

  // 3. Determine which lesson to display.
  // If a lesson ID is provided in the URL, use that. Otherwise, default to the first lesson.
  const currentLesson = lessonIdFromQuery
    ? course.lessons.find(l => l.id === lessonIdFromQuery)
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

  // 4. Generate the secure, signed video URL for the current lesson.
  const secureVideoUrl = getSignedBunnyUrl(currentLesson.bunnyVideoId);

  return (
    <div className="min-h-screen bg-slate-900 p-4 lg:p-8">
      <div className="flex flex-col md:flex-row gap-8 max-w-screen-2xl mx-auto">
        {/* Main Content: Video Player */}
        <main className="flex-grow">
          <VideoPlayer url={secureVideoUrl} />
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{currentLesson.title}</h1>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <ShieldCheck className="w-5 h-5" />
                <span>Secure video stream enabled.</span>
              </div>
              {/* We can add lesson description or materials info here later */}
          </div>
        </main>

        {/* Sidebar: Lecture List */}
        <LectureSidebar 
            course={course}
            currentLessonId={currentLesson.id}
            completedLessons={enrollment.completedLessonIds}
        />
      </div>
    </div>
  );
}