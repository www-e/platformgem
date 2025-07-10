// src/app/(student)/dashboard/page.tsx

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, BookImage, Tv } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollButton } from "./_components/enroll-button";
import { Button } from "@/components/ui/button";

const gradeMap = {
  FIRST_YEAR: "الصف الأول الثانوي",
  SECOND_YEAR: "الصف الثاني الثانوي",
  THIRD_YEAR: "الصف الثالث الثانوي",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.grade || !session.user.id) {
    redirect("/login");
  }

  const [courses, userEnrollments] = await prisma.$transaction([
    prisma.course.findMany({
      where: { targetGrade: session.user.grade },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    }),
  ]);

  const enrolledCourseIds = new Set(userEnrollments.map(e => e.courseId));

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-foreground mb-2">لوحة التحكم</h1>
          <p className="text-xl text-muted-foreground">
            الدورات المتاحة لمرحلة: <span className="text-primary font-semibold">{gradeMap[session.user.grade]}</span>
          </p>
        </header>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-card rounded-2xl p-12 text-center mt-20">
            <BookOpen className="w-16 h-16 text-primary mb-6" />
            <h2 className="text-2xl font-semibold text-foreground">لا توجد دورات متاحة حالياً</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
              لم يقم المسؤول بإضافة أي دورات لهذه المرحلة الدراسية بعد. يرجى التحقق مرة أخرى قريباً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course.id);
              return (
                <Card key={course.id} className="bg-card flex flex-col card-hover-effect">
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                       <BookImage className="w-16 h-16 text-muted-foreground/30" strokeWidth={1} />
                    </div>
                    <CardTitle className="text-xl text-foreground">{course.title}</CardTitle>
                    <CardDescription className="text-muted-foreground line-clamp-2 h-10">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow" />
                  <CardFooter>
                    {isEnrolled ? (
                      <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground btn-hover-effect">
                        <Link href={`/courses/${course.id}`}>
                          <Tv className="ml-2 h-5 w-5" />
                          عرض الدورة
                        </Link>
                      </Button>
                    ) : (
                      <EnrollButton courseId={course.id} />
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}