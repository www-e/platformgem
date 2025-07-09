// src/components/shared/navbar.tsx

"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn, Menu, X, LayoutDashboard, User } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, protected: true },
    { href: "/profile", label: "Profile", icon: User, protected: true },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <span className="text-white text-xl font-bold">EduPlatform</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "authenticated" && navLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {link.label}
                </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {status === "loading" && <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />}
            {status === "unauthenticated" && (
              <>
                <Button variant="ghost" className="text-white hover:bg-slate-800" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    تسجيل الدخول
                  </Link>
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link href="/signup">إنشاء حساب</Link>
                </Button>
              </>
            )}
            {status === "authenticated" && (
                <Button variant="destructive" onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                    تسجيل الخروج
                </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {status === "authenticated" && navLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  {link.label}
                </Link>
            ))}
            <div className="border-t border-slate-700 my-2" />
            {status === "unauthenticated" && (
                <>
                <Link href="/login" className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    تسجيل الدخول
                </Link>
                <Link href="/signup" className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors">
                    إنشاء حساب
                </Link>
                </>
            )}
            {status === "authenticated" && (
                <Button variant="destructive" onClick={handleLogout} className="w-full mt-2 bg-red-600 hover:bg-red-700">
                    تسجيل الخروج
                </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}