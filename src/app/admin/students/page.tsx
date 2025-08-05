// src/app/admin/students/page.tsx

import prisma from "@/lib/prisma";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaginationControls from "@/components/admin/PaginationControls";
import SearchInput from "@/components/admin/SearchInput";

const ITEMS_PER_PAGE = 10;

// The function signature is the key part of the fix.
export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // We access the searchParams properties here, inside the function body.
  const resolvedSearchParams = await searchParams;
  const page = typeof resolvedSearchParams.page === 'string' ? Number(resolvedSearchParams.page) : 1;
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;

  const whereClause = {
    role: 'STUDENT' as const,
    ...(query && { name: { contains: query, mode: 'insensitive' as const } }),
  };

  const [students, totalCount] = await prisma.$transaction([
    prisma.user.findMany({ where: whereClause, orderBy: { createdAt: 'desc' }, take: ITEMS_PER_PAGE, skip: (page - 1) * ITEMS_PER_PAGE }),
    prisma.user.count({ where: whereClause }),
  ]);
  
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">إدارة الطلاب</h1>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <SearchInput />
        </div>
      </div>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>قائمة الطلاب المسجلين</CardTitle>
          <CardDescription>إجمالي الطلاب المطابقين للبحث: {totalCount}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-4 font-semibold">الاسم</th><th className="p-4 font-semibold">معرف الطالب</th><th className="p-4 font-semibold">رقم الهاتف</th><th className="p-4 font-semibold">البريد الإلكتروني</th><th className="p-4 font-semibold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="p-4">{student.name}</td><td className="p-4 font-mono text-muted-foreground">{student.studentId || 'غير محدد'}</td><td className="p-4 font-mono text-muted-foreground" dir="ltr">{student.phone}</td><td className="p-4 text-muted-foreground">{student.email || 'غير محدد'}</td><td className="p-4 text-left"><Button asChild variant="outline" size="sm"><Link href={`/admin/students/${student.id}`}>عرض التفاصيل</Link></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <p className="p-8 text-center text-muted-foreground">{query ? "لم يتم العثور على طلاب مطابقين للبحث." : "لم يقم أي طالب بالتسجيل بعد."}</p>
          )}
        </CardContent>
        {totalPages > 1 && (
          <div className="p-4 border-t border-border"><PaginationControls currentPage={page} totalPages={totalPages} /></div>
        )}
      </Card>
    </div>
  );
}