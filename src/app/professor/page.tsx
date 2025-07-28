// src/app/professor/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfessorDashboard } from "@/components/professor/ProfessorDashboard";

export default async function ProfessorDashboardPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'PROFESSOR') {
    redirect('/login');
  }

  return <ProfessorDashboard />;
}