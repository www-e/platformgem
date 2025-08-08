// src/components/navigation/MobileNavigation.tsx - Mobile-First Navigation
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TouchTarget, MobileDrawer } from "@/components/ui/mobile-interactions";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  User,
  Search,
  Bell,
  Menu,
  X,
  Settings,
  LogOut,
  Award,
  BarChart3,
  CreditCard,
  Heart,
  HelpCircle,
  ChevronRight,
  Zap,
  Trophy,
  Target,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    level?: number;
    xp?: number;
  };
  notifications?: number;
}

const mainNavItems = [
  { href: "/dashboard", label: "الرئيسية", icon: Home },
  { href: "/courses", label: "الدورات", icon: BookOpen },
  { href: "/search", label: "البحث", icon: Search },
  { href: "/profile", label: "الملف الشخصي", icon: User }
];

const drawerNavItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: Home },
  { href: "/courses", label: "دوراتي", icon: BookOpen },
  { href: "/achievements", label: "الإنجازات", icon: Trophy },
  { href: "/progress", label: "التقدم", icon: BarChart3 },
  { href: "/goals", label: "الأهداف", icon: Target },
  { href: "/schedule", label: "الجدول", icon: Calendar },
  { href: "/certificates", label: "الشهادات", icon: Award },
  { href: "/payments", label: "المدفوعات", icon: CreditCard },
  { href: "/favorites", label: "المفضلة", icon: Heart },
  { href: "/settings", label: "الإعدادات", icon: Settings },
  { href: "/help", label: "المساعدة", icon: HelpCircle }
];

export function MobileNavigation({ user, notifications = 0 }: MobileNavigationProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Header */}
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-30 bg-white transition-all duration-200",
          isScrolled && "shadow-md backdrop-blur-sm bg-white/95"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-bold text-neutral-900 font-display">
              المنصة
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <TouchTarget className="relative">
              <Bell className="w-6 h-6 text-neutral-600" />
              {notifications > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </TouchTarget>

            {/* Menu Button */}
            <TouchTarget onClick={() => setIsDrawerOpen(true)}>
              <Menu className="w-6 h-6 text-neutral-600" />
            </TouchTarget>
          </div>
        </div>
      </motion.header>

      {/* Bottom Navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-200 safe-area-pb"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center justify-around py-2">
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <TouchTarget
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 transition-colors duration-200",
                    active ? "text-primary-600" : "text-neutral-500"
                  )}
                  haptic={true}
                >
                  <motion.div
                    animate={active ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                  <span className="text-xs font-primary leading-none">
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      className="w-1 h-1 bg-primary-600 rounded-full"
                      layoutId="activeIndicator"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </TouchTarget>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Navigation Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <MobileDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            position="right"
          >
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-900 font-display">
                  القائمة
                </h2>
                <TouchTarget onClick={() => setIsDrawerOpen(false)}>
                  <X className="w-6 h-6 text-neutral-600" />
                </TouchTarget>
              </div>

              {/* User Profile Section */}
              {user && (
                <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-black" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 font-display">
                        {user.name}
                      </h3>
                      <p className="text-sm text-neutral-600 font-primary">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  {user.level && user.xp && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="font-primary text-neutral-700">
                          المستوى {user.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="font-primary text-neutral-700">
                          {user.xp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto">
                <div className="py-2">
                  {drawerNavItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href}>
                        <TouchTarget
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200",
                            active 
                              ? "bg-primary-50 text-primary-700 border-r-4 border-primary-500" 
                              : "text-neutral-700 hover:bg-neutral-50"
                          )}
                          haptic={true}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="flex-1 font-primary">{item.label}</span>
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </TouchTarget>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-neutral-200 p-4">
                <TouchTarget
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  haptic={true}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-primary">تسجيل الخروج</span>
                </TouchTarget>
              </div>
            </div>
          </MobileDrawer>
        )}
      </AnimatePresence>

      {/* Safe area spacers */}
      <div className="h-16" /> {/* Top spacer for header */}
      <div className="h-20" /> {/* Bottom spacer for navigation */}
    </>
  );
}

// Mobile Search Bar Component
interface MobileSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function MobileSearchBar({ 
  onSearch, 
  placeholder = "ابحث عن الدورات...",
  suggestions = []
}: MobileSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className={cn(
            "w-full min-h-[44px] pl-10 pr-4 py-3 text-base",
            "border-2 rounded-xl transition-all duration-200",
            "touch-manipulation font-primary bg-neutral-50",
            isFocused 
              ? "border-primary-500 ring-2 ring-primary-200 bg-white" 
              : "border-transparent"
          )}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <TouchTarget
                key={index}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 first:rounded-t-xl last:rounded-b-xl"
                onClick={() => handleSearch(suggestion)}
              >
                <Search className="w-4 h-4 text-neutral-400" />
                <span className="font-primary text-neutral-700">{suggestion}</span>
              </TouchTarget>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}