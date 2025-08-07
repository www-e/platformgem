// src/components/shared/navbar.tsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { InstantLink } from "@/components/ui/instant-navigation";
import { 
  GraduationCap, 
  LogIn, 
  Menu, 
  X, 
  LayoutDashboard, 
  User, 
  LogOut, 
  UserPlus,
  Search,
  Bell,
  Settings,
  BookOpen,
  Award,
  Command
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useOptimizedMotion, useScrollAnimation } from "@/hooks/useAnimations";
import { fadeInUp, slideInRight } from "@/lib/animations";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(0);
  const pathname = usePathname();
  const { shouldReduceMotion } = useOptimizedMotion();
  const { scrollY } = useScrollAnimation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Glass morphism effect based on scroll
  const isScrolled = scrollY > 20;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Enhanced navigation links with icons and descriptions
  const navLinks = [
    { 
      href: "/courses", 
      label: "الدورات", 
      icon: BookOpen, 
      description: "استكشف الدورات المتاحة",
      public: true 
    },
    { 
      href: "/dashboard", 
      label: "لوحة التحكم", 
      icon: LayoutDashboard, 
      description: "إدارة حسابك",
      protected: true 
    },
    { 
      href: "/profile", 
      label: "الملف الشخصي", 
      icon: User, 
      description: "معلوماتك الشخصية",
      protected: true 
    },
    { 
      href: "/certificates", 
      label: "الشهادات", 
      icon: Award, 
      description: "شهاداتك المحققة",
      protected: true 
    },
  ];

  // Smart search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      // Escape to close search
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSearchOpen && searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const NavLink = ({ 
    href, 
    label, 
    icon: Icon, 
    description,
    isMobile = false 
  }: { 
    href: string; 
    label: string; 
    icon: React.ElementType;
    description?: string;
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
          <Icon className={cn(
            "flex-shrink-0 transition-colors",
            isActive ? "text-primary-600" : "text-neutral-500 group-hover:text-neutral-700",
            isMobile ? "h-5 w-5" : "h-4 w-4"
          )} />
          <div className="flex flex-col">
            <span className="leading-arabic-tight">{label}</span>
            {description && isMobile && (
              <span className="text-xs text-neutral-500 leading-arabic-normal">{description}</span>
            )}
          </div>
        </InstantLink>
      </motion.div>
    );
  };

  return (
    <motion.nav 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-white/20 shadow-elevation-2" 
          : "bg-white/95 border-b border-neutral-200"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
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

          {/* Smart Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <motion.div
                className={cn(
                  "relative transition-all duration-200",
                  isSearchOpen && "ring-2 ring-primary-500 ring-offset-2"
                )}
                layout
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="البحث في الدورات... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-primary",
                    "focus:outline-none focus:bg-white focus:border-primary-300 transition-all duration-200",
                    "placeholder:text-neutral-500"
                  )}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-neutral-100 px-1.5 font-mono text-xs text-neutral-600">
                    <Command className="h-3 w-3" />K
                  </kbd>
                </div>
              </motion.div>
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchOpen && searchQuery && (
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-elevation-4 overflow-hidden"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="p-2">
                      <div className="text-xs text-neutral-500 px-2 py-1 font-primary">نتائج البحث</div>
                      {/* Mock search results */}
                      <div className="space-y-1">
                        <button className="w-full text-right px-2 py-2 hover:bg-neutral-50 rounded text-sm font-primary">
                          دورة تطوير المواقع
                        </button>
                        <button className="w-full text-right px-2 py-2 hover:bg-neutral-50 rounded text-sm font-primary">
                          دورة التسويق الرقمي
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks
              .filter(link => link.public || (link.protected && status === "authenticated"))
              .map(link => (
                <NavLink key={link.href} {...link} />
              ))}
          </div>

          {/* Auth Buttons / User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {status === "loading" && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-neutral-200 rounded-full animate-pulse" />
                <div className="w-20 h-8 bg-neutral-200 rounded animate-pulse" />
              </div>
            )}
            
            {status === "unauthenticated" && (
              <motion.div 
                className="flex items-center space-x-2"
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
                className="flex items-center space-x-3"
                variants={slideInRight}
                initial="initial"
                animate="animate"
              >
                {/* Notifications */}
                <motion.button
                  className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 h-5 w-5 bg-error text-white text-xs rounded-full flex items-center justify-center font-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {notifications}
                    </motion.span>
                  )}
                </motion.button>

                {/* Settings */}
                <motion.button
                  className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Settings className="h-5 w-5" />
                </motion.button>

                {/* User Avatar & Logout */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {session?.user?.name?.charAt(0) || 'U'}
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
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Search Button */}
            <motion.button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="h-5 w-5" />
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              className="md:hidden border-t border-neutral-200 p-4"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="البحث في الدورات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-primary focus:outline-none focus:bg-white focus:border-primary-300 transition-all duration-200"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-white/20 shadow-elevation-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {/* Navigation Links */}
              {navLinks
                .filter(link => link.public || (link.protected && status === "authenticated"))
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
              
              {/* Auth Buttons */}
              {status === "unauthenticated" && (
                <motion.div 
                  className="space-y-3"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 }}
                >
                  <NavLink href="/login" label="تسجيل الدخول" icon={LogIn} description="ادخل إلى حسابك" isMobile />
                  <NavLink href="/signup" label="إنشاء حساب" icon={UserPlus} description="انضم إلى المنصة" isMobile />
                </motion.div>
              )}
              
              {status === "authenticated" && (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 }}
                >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}