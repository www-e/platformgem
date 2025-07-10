// src/app/admin/courses/page.tsx

import { Grade } from "@prisma/client";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCourseForm } from "./_components/create-course-form";
import prisma from "@/lib/prisma";

const gradeMap = {
  FIRST_YEAR: "الصف الأول الثانوي",
  SECOND_YEAR: "الصف الثاني الثانوي",
  THIRD_YEAR: "الصف الثالث الثانوي",
};

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">إدارة الدورات</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <CreateCourseForm />
        </div>
        <div className="lg:col-span-2">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>الدورات الحالية ({courses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <p className="text-muted-foreground p-8 text-center">لم يتم إنشاء أي دورات بعد.</p>
                ) : (
                  courses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{gradeMap[course.targetGrade]}</p>
                      </div>
                      <Button asChild variant="outline">
                        <Link href={`/admin/courses/${course.id}`}>
                          إدارة الدروس
                        </Link>
                      </Button>
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