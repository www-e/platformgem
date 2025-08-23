// src/components/student/StudentSidebar.tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  LayoutDashboard,
  Target,
  Wallet,
  Sparkles,
  FileText,
  X,
  User,
  Trophy,
} from "lucide-react";

interface StudentSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function StudentSidebar({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen
}: StudentSidebarProps) {
  // Close sidebar when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('student-sidebar');
      const mobileOverlay = document.getElementById('mobile-overlay');
      
      if (sidebar && !sidebar.contains(e.target as Node) && 
          mobileOverlay && mobileOverlay.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setSidebarOpen]);

  // Navigation items with icons and labels
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "progress", label: "Progress", icon: Target },
    { id: "payments", label: "Payments", icon: Wallet },
    { id: "recommended", label: "Recommended", icon: Sparkles },
    { id: "certificates", label: "Certificates", icon: FileText },
  ];

  return (
    <AnimatePresence>
      {(sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
        <>
          {sidebarOpen && (
            <div 
              id="mobile-overlay"
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          <motion.div
            id="student-sidebar"
            className={`fixed lg:relative z-50 lg:z-0 inset-y-0 start-0 w-64 bg-gradient-to-b from-card to-muted flex flex-col rounded-r-2xl lg:rounded-none shadow-elevation-3 lg:shadow-none ${
              sidebarOpen ? 'block' : 'hidden lg:flex'
            }`}
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display">Dashboard</h2>
                  <p className="text-xs text-muted-foreground">Student Portal</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 py-4 px-2">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start gap-3 font-primary py-5 transition-all duration-200 ${
                        isActive 
                          ? "bg-primary/10 text-primary shadow-sm font-medium" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      onClick={() => {
                        setActiveSection(item.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-4 text-black">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold font-display">Learning Streak</p>
                    <p className="text-xs opacity-90">Keep it up!</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full mt-2 font-primary"
                  onClick={() => setActiveSection("progress")}
                >
                  View Progress
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}