// src/app/admin/courses/[courseId]/page.tsx

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddLessonForm } from "./_components/add-lesson-form";

export default async function CourseDetailPage({ params }: { params: { courseId: string }}) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!course) {
    return redirect("/admin/courses");
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-400 mb-8">Manage lessons for this course.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <AddLessonForm courseId={course.id} />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Existing Lessons</h2>
            <div className="space-y-4">
              {course.lessons.length === 0 ? (
                <p className="text-gray-400">No lessons added yet.</p>
              ) : (
                course.lessons.map(lesson => (
                  <div key={lesson.id} className="p-4 rounded-lg bg-slate-800/50">
                    <h3 className="font-semibold text-white">
                      {lesson.order}. {lesson.title}
                    </h3>
                    <p className="text-xs text-gray-500">Video ID: {lesson.bunnyVideoId}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}