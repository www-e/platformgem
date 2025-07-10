// src/app/admin/students/page.tsx

import prisma from "@/lib/prisma";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const gradeMap = {
  FIRST_YEAR: "الصف الأول الثانوي",
  SECOND_YEAR: "الصف الثاني الثانوي",
  THIRD_YEAR: "الصف الثالث الثانوي",
};

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: {
      isAdmin: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">إدارة الطلاب</h1>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>قائمة الطلاب المسجلين ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-4 font-semibold">الاسم</th>
                  <th className="p-4 font-semibold">معرف الطالب</th>
                  <th className="p-4 font-semibold">رقم الهاتف</th>
                  <th className="p-4 font-semibold">المرحلة</th>
                  <th className="p-4 font-semibold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="p-4">{student.name}</td>
                    <td className="p-4 font-mono text-muted-foreground">{student.studentId}</td>
                    <td className="p-4 font-mono text-muted-foreground" dir="ltr">{student.phone}</td>
                    <td className="p-4">{gradeMap[student.grade]}</td>
                    <td className="p-4 text-left">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/students/${student.id}`}>
                          عرض التفاصيل
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <p className="p-8 text-center text-muted-foreground">لم يقم أي طالب بالتسجيل بعد.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}