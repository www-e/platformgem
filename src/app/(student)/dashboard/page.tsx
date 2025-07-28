// src/app/(student)/dashboard/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentDashboard } from "@/components/student/StudentDashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STUDENT' || !session.user.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <StudentDashboard />
      </div>
    </div>
  );
}