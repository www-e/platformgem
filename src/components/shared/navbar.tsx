// src/components/shared/navbar.tsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn, Menu, X, LayoutDashboard, User, LogOut, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navLinks = [
    { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, protected: true },
    { href: "/profile", label: "الملف الشخصي", icon: User, protected: true },
    // You can add more links here in the future
  ];

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType; }) => {
    const isActive = pathname.startsWith(href);
    return (
      <Link href={href} onClick={() => setIsMenuOpen(false)} className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
      )}>
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-foreground text-xl font-bold">EduPlatform</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {status === "authenticated" && navLinks.map(link => (
                <NavLink key={link.href} {...link} />
            ))}
          </div>

          {/* Auth Buttons / User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {status === "loading" && <div className="w-24 h-10 bg-muted rounded-md animate-pulse" />}
            {status === "unauthenticated" && (
              <>
                <Button variant="ghost" className="text-muted-foreground" asChild>
                  <Link href="/login">
                    <LogIn className="ml-2 h-4 w-4" />
                    تسجيل الدخول
                  </Link>
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground btn-hover-effect" asChild>
                  <Link href="/signup">
                    <UserPlus className="ml-2 h-4 w-4" />
                    إنشاء حساب
                  </Link>
                </Button>
              </>
            )}
            {status === "authenticated" && (
                <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-card border-b border-border shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
             {status === "authenticated" && navLinks.map(link => (
                <NavLink key={link.href} {...link} />
            ))}
             <div className="border-t border-border my-3" />
            {status === "unauthenticated" && (
                <>
                  <NavLink href="/login" label="تسجيل الدخول" icon={LogIn} />
                  <NavLink href="/signup" label="إنشاء حساب" icon={UserPlus} />
                </>
            )}
            {status === "authenticated" && (
                <NavLink href="#" label="تسجيل الخروج" icon={LogOut} />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}