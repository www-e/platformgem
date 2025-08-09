// src/app/admin/layout.tsx
"use client";

import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard, Book, Users, GraduationCap, Menu, CreditCard, Activity, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionProvider, useSession } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced navigation component with hover animations
function AdminNavLinks({ isCollapsed = false, onItemClick }: { isCollapsed?: boolean; onItemClick?: () => void }) {
  const pathname = usePathname();
  const navLinks = [
    { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/admin/courses", label: "الدورات", icon: Book },
    { href: "/admin/students", label: "الطلاب", icon: Users },
    { href: "/admin/professors", label: "المدربين", icon: Users },
    { href: "/admin/payments", label: "المدفوعات", icon: CreditCard },
    { href: "/admin/logs", label: "سجلات النظام", icon: Activity },
    { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <nav className="flex flex-col space-y-2">
      {navLinks.map((link, index) => {
        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              href={link.href} 
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:shadow-md"
              )}
            >
              <link.icon className={cn(
                "w-5 h-5 transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

// Enhanced sidebar component with auto-hide functionality
function EnhancedSidebar({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const shouldExpand = isHovered || !isCollapsed;

  return (
    <div className="relative">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 80 }}
        animate={{ width: shouldExpand ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed left-0 top-0 h-full bg-card/95 backdrop-blur-sm border-r border-border/50 z-50 hidden md:flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: shouldExpand ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <GraduationCap className="h-8 w-8 text-primary" />
            </motion.div>
            <AnimatePresence>
              {shouldExpand && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-foreground">لوحة التحكم</h2>
                  <p className="text-sm text-muted-foreground">نظام إدارة التعلم</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <AdminNavLinks isCollapsed={!shouldExpand} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full justify-center"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content with dynamic margin */}
      <motion.div
        initial={{ marginLeft: 80 }}
        animate={{ marginLeft: shouldExpand ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen hidden md:block"
      >
        {children}
      </motion.div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen">
        {children}
      </div>
    </div>
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <GraduationCap className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  // This check is now secondary to the middleware, but a good safeguard
  if (!session?.user?.isAdmin) {
    redirect("/"); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <EnhancedSidebar>
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold">لوحة التحكم</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6 w-80">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">لوحة التحكم</h2>
                    <p className="text-sm text-muted-foreground">نظام إدارة التعلم</p>
                  </div>
                </div>
              </div>
              <AdminNavLinks />
            </SheetContent>
          </Sheet>
        </header>
        
        <main className="flex-grow p-4 sm:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </EnhancedSidebar>
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