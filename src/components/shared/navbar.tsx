// src/components/shared/navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InstantLink } from "@/components/ui/instant-navigation";
import {
  GraduationCap,
  LogIn,
  Menu,
  X,
  LayoutDashboard, // kept in imports not needed anymore, can be removed
  User,
  LogOut,
  UserPlus,
  BookOpen,
  Award, // not used now
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useOptimizedMotion, useScrollAnimation } from "@/hooks/useAnimations";
import { fadeInUp, slideInRight } from "@/lib/animations";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { shouldReduceMotion } = useOptimizedMotion();
  const { scrollY } = useScrollAnimation();

  const isScrolled = scrollY > 20;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Navigation links: removed /dashboard and /certificates
  const navLinks = [
    {
      href: "/courses",
      label: "الدورات",
      icon: BookOpen,
      public: true,
    },
    {
      href: "/profile",
      label: "الملف الشخصي",
      icon: User,
      protected: true,
    },
  ];

  const NavLink = ({
    href,
    label,
    icon: Icon,
    isMobile = false,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
    isMobile?: boolean;
  }) => {
    const isActive = pathname.startsWith(href);

    return (
      <motion.div
        whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <InstantLink
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 font-primary group",
            isActive
              ? "bg-primary-50 text-primary-700 border border-primary-200"
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
            isMobile && "py-3"
          )}
          preloadOnHover
          onClick={() => setIsMenuOpen(false)}
        >
          <Icon
            className={cn(
              "flex-shrink-0 transition-colors",
              isActive ? "text-primary-600" : "text-neutral-500 group-hover:text-neutral-700",
              isMobile ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <span className="leading-arabic-tight">{label}</span>
        </InstantLink>
      </motion.div>
    );
  };

  // Close mobile menu on route changes (optional safety)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4">
        <motion.nav
          className={cn(
            "mx-auto w-fit rounded-2xl transition-all duration-300 shadow-elevation-4",
            isScrolled
              ? "bg-white/80 backdrop-blur-md border border-white/20 shadow-elevation-6"
              : "bg-white/95 border border-neutral-200/50"
          )}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="px-6 py-3">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
                <InstantLink
                  href="/"
                  className="flex-shrink-0 flex items-center gap-3 group"
                  preloadOnHover
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="relative">
                    <GraduationCap className="h-8 w-8 text-primary-600 transition-transform group-hover:rotate-12" />
                    <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-neutral-900 text-xl font-bold font-display leading-arabic-tight">
                    منصة التعلم
                  </span>
                </InstantLink>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
                {navLinks
                  .filter((link) => link.public || (link.protected && status === "authenticated"))
                  .map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
              </div>

              {/* Auth Buttons / User Menu - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                {status === "loading" && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-neutral-200 rounded-full animate-pulse" />
                    <div className="w-20 h-8 bg-neutral-200 rounded animate-pulse" />
                  </div>
                )}

                {status === "unauthenticated" && (
                  <motion.div
                    className="flex items-center gap-2"
                    variants={slideInRight}
                    initial="initial"
                    animate="animate"
                  >
                    <Button variant="ghost" size="sm" asChild>
                      <InstantLink href="/login" preloadOnHover>
                        <LogIn className="ml-2 h-4 w-4" />
                        تسجيل الدخول
                      </InstantLink>
                    </Button>
                    <Button variant="primary" size="sm" asChild>
                      <InstantLink href="/signup" preloadOnHover>
                        <UserPlus className="ml-2 h-4 w-4" />
                        إنشاء حساب
                      </InstantLink>
                    </Button>
                  </motion.div>
                )}

                {status === "authenticated" && (
                  <motion.div
                    className="flex items-center gap-3"
                    variants={slideInRight}
                    initial="initial"
                    animate="animate"
                  >
                    {/* User Avatar & Logout */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-black text-sm font-semibold">
                        {session?.user?.name?.charAt(0) || "U"}
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="ml-2 h-4 w-4" />
                        خروج
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-2">
                <motion.button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-sm mx-auto px-4 z-40"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="bg-white/95 backdrop-blur-md border border-neutral-200/50 rounded-2xl shadow-elevation-6 p-4">
              <div className="space-y-3">
                {navLinks
                  .filter((link) => link.public || (link.protected && status === "authenticated"))
                  .map((link, index) => (
                    <motion.div
                      key={link.href}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                    >
                      <NavLink {...link} isMobile />
                    </motion.div>
                  ))}

                <div className="border-t border-neutral-200 my-4" />

                {status === "unauthenticated" && (
                  <motion.div
                    className="space-y-3"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.3 }}
                  >
                    <NavLink href="/login" label="تسجيل الدخول" icon={LogIn} isMobile />
                    <NavLink href="/signup" label="إنشاء حساب" icon={UserPlus} isMobile />
                  </motion.div>
                )}

                {status === "authenticated" && (
                  <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors w-full font-primary"
                    >
                      <LogOut className="h-5 w-5" />
                      <div className="flex flex-col text-right">
                        <span>تسجيل الخروج</span>
                        <span className="text-xs text-neutral-500">إنهاء الجلسة الحالية</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for content */}
      <div className="h-20" />
    </>
  );
}
