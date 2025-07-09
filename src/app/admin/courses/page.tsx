// src/app/admin/courses/page.tsx

import { Grade } from "@prisma/client";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateCourseForm } from "./_components/create-course-form";
import prisma from "@/lib/prisma";

// A small utility to map enum to readable text
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
      <h1 className="text-4xl font-bold mb-8">Manage Courses</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          {/* We are moving the form to a separate component for clarity */}
          <CreateCourseForm />
        </div>
        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader><CardTitle>Existing Courses</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <p className="text-gray-400">No courses created yet.</p>
                ) : (
                  courses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div>
                        <h3 className="font-semibold text-lg text-white">{course.title}</h3>
                        <p className="text-sm text-gray-400">{gradeMap[course.targetGrade]}</p>
                      </div>
                      <Button asChild variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
                        <Link href={`/admin/courses/${course.id}`}>
                          Manage Lessons
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