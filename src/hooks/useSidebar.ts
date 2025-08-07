// Hook for managing intelligent sidebar state
"use client";

import { useState, useEffect } from "react";

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      // Auto-close on mobile, auto-open on desktop
      if (mobile) {
        setIsOpen(false);
      } else {
        // Check localStorage for desktop preference
        const savedState = localStorage.getItem('sidebar-open');
        setIsOpen(savedState !== null ? JSON.parse(savedState) : true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save desktop preference to localStorage
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-open', JSON.stringify(isOpen));
    }
  }, [isOpen, isMobile]);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    isMobile,
    toggle,
    open,
    close,
  };
};