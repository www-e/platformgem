// src/components/student/StudentSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  LayoutDashboard,
  Target,
  Wallet,
  Sparkles,
  FileText,
  Menu,
  X
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
            className={`fixed lg:relative z-50 lg:z-0 inset-y-0 start-0 w-64 bg-card border-e border-border flex flex-col rounded-lg p-4 lg:p-0 lg:rounded-none lg:border-r ${
              sidebarOpen ? 'block' : 'hidden lg:flex'
            }`}
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex items-center justify-between p-4 lg:hidden">
              <h2 className="text-xl font-bold font-display">Navigation</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2 p-2 flex-1">
              <Button
                variant={activeSection === "overview" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 font-primary"
                onClick={() => {
                  setActiveSection("overview");
                  setSidebarOpen(false);
                }}
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </Button>
              <Button
                variant={activeSection === "courses" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 font-primary"
                onClick={() => {
                  setActiveSection("courses");
                  setSidebarOpen(false);
                }}
              >
                <BookOpen className="h-4 w-4" />
                My Courses
              </Button>
              <Button
                variant={activeSection === "progress" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 font-primary"
                onClick={() => {
                  setActiveSection("progress");
                  setSidebarOpen(false);
                }}
              >
                <Target className="h-4 w-4" />
                Progress
              </Button>
              <Button
                variant={activeSection === "payments" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 font-primary"
                onClick={() => {
                  setActiveSection("payments");
                  setSidebarOpen(false);
                }}
              >
                <Wallet className="h-4 w-4" />
                Payments
              </Button>
              <Button
                variant={activeSection === "recommended" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 font-primary"
                onClick={() => {
                  setActiveSection("recommended");
                  setSidebarOpen(false);
                }}
              >
                <Sparkles className="h-4 w-4" />
                Recommended
              </Button>
              <Button
                variant={activeSection === "certificates" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 font-primary"
                onClick={() => {
                  setActiveSection("certificates");
                  setSidebarOpen(false);
                }}
              >
                <FileText className="h-4 w-4" />
                Certificates
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}