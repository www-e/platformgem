// src/app/(student)/profile/page.tsx

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { BookMarked, ClipboardCheck, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const gradeMap = {
  FIRST_YEAR: "الصف الأول الثانوي",
  SECOND_YEAR: "الصف الثاني الثانوي",
  THIRD_YEAR: "الصف الثالث الثانوي",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch the student's data including their enrollments (with course details)
  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: true, // Include the full details for each enrolled course
        },
        orderBy: {
          enrolledAt: 'desc'
        }
      },
    },
  });

  if (!student) {
    redirect("/login");
  }

  const examHistory = Array.isArray(student.examHistory) ? student.examHistory : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            مرحباً، {student.name}
          </h1>
          <p className="text-gray-300 text-xl">
            هنا ملخص رحلتك التعليمية.
          </p>
          <div className="mt-4 flex items-center gap-4 text-gray-300">
             <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400"/>
                <span>{gradeMap[student.grade]}</span>
             </div>
             <span>•</span>
             <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-green-400"/>
                <span>مسجل في {student.enrollments.length} دورات</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enrolled Courses Section */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="w-6 h-6 text-green-400" />
                <span>الدورات المسجلة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.enrollments.length > 0 ? (
                  student.enrollments.map(({ course, completedLessonIds }) => (
                    <div key={course.id} className="p-4 rounded-lg bg-slate-800/50">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <Button asChild size="sm" variant="ghost" className="hover:bg-slate-700">
                          <Link href={`/courses/${course.id}`}>
                            اكمل المشاهدة
                          </Link>
                        </Button>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{completedLessonIds.length} lessons completed</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    لم تسجل في أي دورات بعد. <Link href="/dashboard" className="text-blue-400 hover:underline">تصفح الدورات</Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Exam History Section */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-blue-400" />
                <span>نتائج الإمتحانات</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                {examHistory.length > 0 ? (
                  examHistory.map((exam: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-slate-800/50 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">{exam.title}</h3>
                        <p className="text-sm text-gray-400">Date: {new Date(exam.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-400">{exam.score}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">لا توجد نتائج امتحانات مسجلة لك حتى الآن.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}