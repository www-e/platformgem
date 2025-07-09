// src/app/admin/students/[studentId]/page.tsx

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddExamResultForm } from "./_components/add-exam-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const gradeMap = {
  FIRST_YEAR: "الصف الأول الثانوي",
  SECOND_YEAR: "الصف الثاني الثانوي",
  THIRD_YEAR: "الصف الثالث الثانوي",
};

export default async function StudentDetailPage({ params }: { params: { studentId: string }}) {
  const student = await prisma.user.findUnique({
    where: { id: params.studentId },
  });

  if (!student) {
    return redirect('/admin/students');
  }

  // Safely parse the exam history JSON
  const examHistory = Array.isArray(student.examHistory) ? student.examHistory : [];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">{student.name}</h1>
      <p className="text-gray-400 mb-8">Student ID: {student.studentId} | Grade: {gradeMap[student.grade]}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <AddExamResultForm userId={student.id} />
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader><CardTitle>Exam History</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examHistory.length === 0 ? (
                  <p className="text-gray-400">No exam results entered yet.</p>
                ) : (
                  examHistory.map((exam: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-slate-800/50 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-white">{exam.title}</h3>
                        <p className="text-sm text-gray-400">Date: {new Date(exam.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xl font-bold text-blue-400">{exam.score}</span>
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