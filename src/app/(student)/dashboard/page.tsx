// src/app/(student)/dashboard/page.tsx

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const gradeMap = {
  FIRST_YEAR: "الصف الأول الثانوي",
  SECOND_YEAR: "الصف الثاني الثانوي",
  THIRD_YEAR: "الصف الثالث الثانوي",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.grade) {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    where: {
      targetGrade: session.user.grade,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">لوحة التحكم</h1>
          <p className="text-lg text-blue-300">
            الدورات المتاحة لك: {gradeMap[session.user.grade]}
          </p>
        </div>
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-blue-400 mb-4" />
            <h2 className="text-2xl font-semibold text-white">لا توجد دورات متاحة حالياً</h2>
            <p className="text-gray-400 mt-2">
              يرجى التحقق مرة أخرى قريباً، سيقوم المسؤول بإضافة دورات جديدة قريباً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="bg-white/5 backdrop-blur-lg border border-white/10 text-white rounded-2xl flex flex-col card-hover">
                <CardHeader>
                  <div className="aspect-video bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
                     <p className="text-slate-400">Thumbnail</p>
                  </div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription className="text-gray-400 line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow" />
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href={`/courses/${course.id}`}>
                      عرض الدورة
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}