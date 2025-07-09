// src/app/admin/layout.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Book, Users } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Middleware already protects this, but an extra check is good practice.
  if (!session?.user?.isAdmin) {
    redirect("/"); // Redirect non-admins to the home page
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <aside className="w-64 bg-slate-800/50 p-6 border-r border-white/10 hidden md:block">
        <h2 className="text-2xl font-bold mb-8 text-white">Admin Panel</h2>
        <nav className="space-y-4">
          <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/courses" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
            <Book className="w-5 h-5 text-green-400" />
            <span>Courses</span>
          </Link>
          <Link href="/admin/students" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Students</span>
          </Link>
        </nav>
      </aside>
      <main className="flex-grow p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}