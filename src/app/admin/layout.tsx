// src/app/admin/layout.tsx
"use client";

import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Book, Users, GraduationCap, Menu, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionProvider, useSession } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// A new, reusable component for the navigation links to avoid repetition
function AdminNavLinks() {
  const pathname = usePathname();
  const navLinks = [
    { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/admin/courses", label: "الدورات", icon: Book },
    { href: "/admin/students", label: "الطلاب", icon: Users },
    { href: "/admin/payments", label: "المدفوعات", icon: CreditCard },
  ];

  return (
    <nav className="flex flex-col space-y-3">
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
  );
}

// Wrapper to use session and hooks in a client component
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    }
  });

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading...</div>;
  }

  // This check is now secondary to the middleware, but a good safeguard
  if (!session?.user?.isAdmin) {
    redirect("/"); 
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:grid md:grid-cols-[250px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="h-full bg-card p-6 border-l border-border hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
        </div>
        <AdminNavLinks />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold">Admin</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6">
              <AdminNavLinks />
            </SheetContent>
          </Sheet>
        </header>
        
        <main className="flex-grow p-4 sm:p-8 overflow-auto">
          {children}
        </main>
      </div>
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