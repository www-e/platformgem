// src/app/(student)/profile/page.tsx

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { BookMarked, ClipboardCheck, Award, User, Target } from "lucide-react";
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

  // Optimized query to get enrollments with course details AND the total lesson count for each course
  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              _count: {
                select: { lessons: true } // This efficiently gets the total number of lessons
              }
            }
          }
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

  // Safely parse exam history
  const examHistory = Array.isArray(student.examHistory) ? student.examHistory : [];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="bg-card border border-border rounded-xl p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary">
                <User className="w-8 h-8 text-primary"/>
            </div>
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    مرحباً، {student.name}
                </h1>
                <p className="text-lg text-muted-foreground">
                    هنا ملخص رحلتك التعليمية.
                </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
             <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">مرحلتك الدراسية</p>
                <p className="font-semibold text-foreground flex items-center justify-center gap-2 pt-1"><Award className="w-5 h-5 text-yellow-400"/> {gradeMap[student.grade]}</p>
             </div>
             <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">الدورات المسجلة</p>
                <p className="font-semibold text-foreground flex items-center justify-center gap-2 pt-1"><BookMarked className="w-5 h-5 text-green-400"/> {student.enrollments.length} دورات</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Enrolled Courses Section */}
          <Card className="lg:col-span-2 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookMarked className="w-6 h-6 text-primary" />
                <span>الدورات المسجلة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {student.enrollments.length > 0 ? (
                  student.enrollments.map(({ course, completedLessonIds }) => {
                    const totalLessons = course._count.lessons;
                    const progress = totalLessons > 0 ? (completedLessonIds.length / totalLessons) * 100 : 0;
                    return (
                        <div key={course.id} className="p-4 rounded-lg bg-muted/50">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <h3 className="font-bold text-lg text-foreground">{course.title}</h3>
                                <Button asChild variant="secondary" className="bg-secondary/90 hover:bg-secondary text-secondary-foreground btn-hover-effect shrink-0">
                                <Link href={`/courses/${course.id}`}>
                                    اكمل المشاهدة
                                </Link>
                                </Button>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm text-muted-foreground">
                                        اكتمل {completedLessonIds.length} من {totalLessons} درسًا
                                    </p>
                                    <p className="text-sm font-semibold text-primary">{Math.round(progress)}%</p>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                    <div 
                                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )
                  })
                ) : (
                  <div className="text-center py-10">
                    <BookMarked className="mx-auto w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      لم تسجل في أي دورات بعد. <Link href="/dashboard" className="text-primary hover:underline">تصفح الدورات المتاحة</Link>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Exam History Section */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ClipboardCheck className="w-6 h-6 text-primary" />
                <span>نتائج الإمتحانات</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                {examHistory.length > 0 ? (
                  examHistory.map((exam: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-foreground">{exam.title}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(exam.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-2xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{exam.score}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                     <Target className="mx-auto w-12 h-12 text-muted-foreground/50 mb-4" />
                     <p className="text-muted-foreground">لا توجد نتائج امتحانات مسجلة لك حتى الآن.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}