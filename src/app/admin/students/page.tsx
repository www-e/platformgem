// src/app/admin/students/page.tsx

import prisma from "@/lib/prisma";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

// A small utility to map enum to readable text
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
      <h1 className="text-4xl font-bold mb-8">Manage Students</h1>
      <div className="bg-white/5 border border-white/10 rounded-2xl">
        <table className="w-full text-left text-white">
          <thead className="border-b border-white/10">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Student ID</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Grade</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="border-b border-slate-800/50 hover:bg-slate-800/40">
                <td className="p-4">{student.name}</td>
                <td className="p-4 font-mono">{student.studentId}</td>
                <td className="p-4 font-mono">{student.phone}</td>
                <td className="p-4">{gradeMap[student.grade]}</td>
                <td className="p-4">
                  <Button asChild variant="outline" size="sm" className="text-white border-slate-600 hover:bg-slate-700">
                    <Link href={`/admin/students/${student.id}`}>
                      View Details
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <p className="p-8 text-center text-gray-400">No students have registered yet.</p>
        )}
      </div>
    </div>
  );
}