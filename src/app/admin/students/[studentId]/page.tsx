// src/app/admin/students/[studentId]/page.tsx

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddExamResultForm } from "./_components/add-exam-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentDetailPage({ params }: { params: { studentId: string }}) {
  const { studentId } = params;
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return redirect('/admin/students');
  }

  const examHistory = Array.isArray(student.examHistory) ? student.examHistory : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
      <p className="text-muted-foreground mb-8">معرف الطالب: {student.studentId || 'غير محدد'} | الدور: {student.role === 'STUDENT' ? 'طالب' : student.role}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <AddExamResultForm userId={student.id} />
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card">
            <CardHeader><CardTitle>سجل الامتحانات</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examHistory.length === 0 ? (
                  <p className="text-muted-foreground p-8 text-center">لم يتم إدخال أي نتائج امتحانات بعد.</p>
                ) : (
                  examHistory.map((exam: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50 flex justify-between items-center border border-border">
                      <div>
                        <h3 className="font-semibold text-foreground">{exam.title}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(exam.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xl font-bold text-primary">{exam.score}</span>
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