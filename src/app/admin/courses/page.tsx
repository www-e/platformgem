// src/app/admin/courses/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import SearchInput from '@/components/admin/SearchInput';
import PaginationControls from '@/components/admin/PaginationControls';
import CourseActions from '@/components/admin/CourseActions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 8;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = typeof resolvedSearchParams.page === 'string' ? Number(resolvedSearchParams.page) : 1;
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;

  const whereClause = {
    ...(query && {
      title: {
        contains: query,
        mode: 'insensitive' as const,
      },
    }),
  };

  const [coursesRaw, totalCount] = await prisma.$transaction([
    prisma.course.findMany({
      where: whereClause,
      include: {
        category: {
          select: { name: true }
        },
        professor: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    }),
    prisma.course.count({ where: whereClause }),
  ]);

  // Convert Decimal to number for client serialization
  const courses = coursesRaw.map(course => ({
    ...course,
    price: course.price ? Number(course.price) : null
  }));

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
            <Button asChild>
              <Link href="/admin/courses/new">
                <Plus className="w-4 h-4 mr-2" />
                إضافة دورة
              </Link>
            </Button>
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
                    <p className="text-sm text-muted-foreground">الفئة: {course.category.name} | الأستاذ: {course.professor.name}</p>
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