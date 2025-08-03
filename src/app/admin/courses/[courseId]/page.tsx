// src/app/admin/courses/[courseId]/page.tsx

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddLessonForm } from "./_components/add-lesson-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
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
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-muted-foreground mb-8">إدارة الدروس لهذه الدورة.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <AddLessonForm courseId={course.id} />
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>الدروس الحالية ({course.lessons.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.lessons.length === 0 ? (
                  <p className="text-muted-foreground p-8 text-center">لم تتم إضافة أي دروس بعد.</p>
                ) : (
                  course.lessons.map(lesson => (
                    <div key={lesson.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                      <h3 className="font-semibold text-foreground">
                        {lesson.order}. {lesson.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono pt-1">Video ID: {lesson.bunnyVideoId}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}