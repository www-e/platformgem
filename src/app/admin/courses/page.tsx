// src/app/admin/courses/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import SearchInput from '@/components/admin/SearchInput';
import PaginationControls from '@/components/admin/PaginationControls';
import CourseActions from '@/components/admin/CourseActions';
import CreateCourseDialog from "@/components/admin/CreateCourseDialog";

const gradeMap = {
  FIRST_YEAR: "الصف الأول الثانوي",
  SECOND_YEAR: "الصف الثاني الثانوي",
  THIRD_YEAR: "الصف الثالث الثانوي",
};

const ITEMS_PER_PAGE = 8;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;

  const whereClause = {
    ...(query && {
      title: {
        contains: query,
        mode: 'insensitive',
      },
    }),
  };

  const [courses, totalCount] = await prisma.$transaction([
    prisma.course.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    }),
    prisma.course.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-grow">
            <h1 className="text-3xl font-bold">إدارة الدورات</h1>
            <p className="text-muted-foreground">إنشاء وتعديل وحذف الدورات التعليمية.</p>
        </div>
        <div className="flex items-center gap-2">
            <SearchInput />
            <CreateCourseDialog />
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>قائمة الدورات</CardTitle>
          <CardDescription>
            إجمالي الدورات المطابقة للبحث: {totalCount}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.length > 0 ? (
              courses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{gradeMap[course.targetGrade]}</p>
                  </div>
                  <CourseActions course={course} />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground p-8 text-center">
                {query ? "لم يتم العثور على دورات مطابقة للبحث." : "لم يتم إنشاء أي دورات بعد."}
              </p>
            )}
          </div>
        </CardContent>
        {totalPages > 1 && (
          <div className="p-4 border-t border-border">
            <PaginationControls currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </Card>
    </div>
  );
}