// src/app/admin/layout.tsx
"use client"; // Required for using usePathname hook

import { auth } from "@/lib/auth"; // Although this is a server component, the check is good
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Book, Users, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionProvider, useSession } from "next-auth/react";

// Wrapper to use session and hooks in a client component
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    }
  });
  const pathname = usePathname();

  // Middleware and session check should handle this, but it's a good safeguard
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-background">Loading...</div>; // Or a spinner
  }
  if (!session?.user?.isAdmin) {
    redirect("/"); // Redirect non-admins to the home page
  }

  const navLinks = [
    { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/admin/courses", label: "الدورات", icon: Book },
    { href: "/admin/students", label: "الطلاب", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 bg-card p-6 border-r border-border hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-10">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
        </div>
        <nav className="space-y-3">
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}>
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-grow p-4 sm:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// The main export remains a Server Component that provides the session
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  )
}