// src/components/ui/mobile-interactions.tsx - Mobile-First Touch Interactions
"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// Touch Target Component - Ensures 44px minimum touch targets
interface TouchTargetProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  haptic?: boolean;
}

export function TouchTarget({ 
  children, 
  className, 
  onClick, 
  disabled = false,
  haptic = true 
}: TouchTargetProps) {
  const handleClick = () => {
    if (disabled) return;
    
    // Haptic feedback simulation
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onClick?.();
  };

  return (
    <motion.button
      className={cn(
        "min-h-[44px] min-w-[44px] flex items-center justify-center",
        "touch-manipulation select-none",
        "transition-all duration-150",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
}

// Swipeable Card Component
interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  swipeThreshold?: number;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
  swipeThreshold = 100
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Haptic feedback for swipe actions
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    if (Math.abs(offset.y) > swipeThreshold || Math.abs(velocity.y) > 500) {
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Reset position
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={cn("cursor-grab active:cursor-grabbing", className)}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ x, y, rotateX, rotateY }}
      whileDrag={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
}

// Pull to Refresh Component
interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePanStart = () => {
    if (containerRef.current?.scrollTop === 0) {
      setPullDistance(0);
    }
  };

  const handlePan = (event: any, info: PanInfo) => {
    if (containerRef.current?.scrollTop === 0 && info.offset.y > 0) {
      setPullDistance(Math.min(info.offset.y, 100));
    }
  };

  const handlePanEnd = async (event: any, info: PanInfo) => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-primary-50 z-10"
          initial={{ opacity: 0, y: -50 }}
          animate={{ 
            opacity: pullDistance > 30 ? 1 : 0.5, 
            y: pullDistance - 50 
          }}
        >
          <div className="flex items-center gap-2 text-primary-600">
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
              className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full"
            />
            <span className="text-sm font-primary">
              {isRefreshing ? 'جاري التحديث...' : pullDistance > 60 ? 'اتركه للتحديث' : 'اسحب للتحديث'}
            </span>
          </div>
        </motion.div>
      )}
      
      <motion.div
        style={{ y: pullDistance * 0.5 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Mobile Navigation Drawer
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: 'left' | 'right' | 'bottom';
}

export function MobileDrawer({ 
  isOpen, 
  onClose, 
  children, 
  position = 'right' 
}: MobileDrawerProps) {
  const variants = {
    left: {
      closed: { x: '-100%' },
      open: { x: 0 }
    },
    right: {
      closed: { x: '100%' },
      open: { x: 0 }
    },
    bottom: {
      closed: { y: '100%' },
      open: { y: 0 }
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <motion.div
        className={cn(
          "fixed z-50 bg-white shadow-xl",
          position === 'left' && "top-0 left-0 h-full w-80 max-w-[80vw]",
          position === 'right' && "top-0 right-0 h-full w-80 max-w-[80vw]",
          position === 'bottom' && "bottom-0 left-0 right-0 max-h-[80vh] rounded-t-2xl"
        )}
        variants={variants[position]}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag={position === 'bottom' ? 'y' : 'x'}
        dragConstraints={{ 
          [position === 'bottom' ? 'top' : position]: 0,
          [position === 'bottom' ? 'bottom' : (position === 'left' ? 'right' : 'left')]: 0
        }}
        onDragEnd={(event, info) => {
          const threshold = 100;
          const shouldClose = position === 'bottom' 
            ? info.offset.y > threshold
            : Math.abs(info.offset.x) > threshold;
          
          if (shouldClose) {
            onClose();
          }
        }}
      >
        {/* Drag Handle for bottom drawer */}
        {position === 'bottom' && (
          <div className="flex justify-center py-3">
            <div className="w-12 h-1 bg-neutral-300 rounded-full" />
          </div>
        )}
        
        {children}
      </motion.div>
    </>
  );
}

// Touch-optimized Form Components
interface TouchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password';
  placeholder?: string;
  error?: string;
  className?: string;
}

export function TouchInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  className
}: TouchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-neutral-700 font-primary">
        {label}
      </label>
      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          "w-full min-h-[44px] px-4 py-3 text-base",
          "border-2 rounded-lg transition-all duration-200",
          "touch-manipulation font-primary",
          isFocused 
            ? "border-primary-500 ring-2 ring-primary-200" 
            : "border-neutral-300",
          error && "border-red-500 ring-2 ring-red-200"
        )}
        // Mobile-specific attributes
        autoCapitalize={type === 'email' ? 'none' : 'sentences'}
        autoCorrect={type === 'email' || type === 'password' ? 'off' : 'on'}
        spellCheck={type === 'email' || type === 'password' ? false : true}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 font-primary"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Mobile-optimized Button
interface TouchButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function TouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className
}: TouchButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center font-medium rounded-lg",
    "touch-manipulation select-none transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    disabled && "opacity-50 cursor-not-allowed",
    fullWidth && "w-full"
  );

  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-neutral-600 text-white hover:bg-neutral-700 focus:ring-neutral-500",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
    ghost: "text-primary-600 hover:bg-primary-50 focus:ring-primary-500"
  };

  const sizeClasses = {
    sm: "min-h-[40px] px-3 py-2 text-sm",
    md: "min-h-[44px] px-4 py-3 text-base",
    lg: "min-h-[48px] px-6 py-4 text-lg"
  };

  const handleClick = () => {
    if (disabled || loading) return;
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onClick?.();
  };

  return (
    <motion.button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      onClick={handleClick}
      disabled={disabled || loading}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {loading && (
        <motion.div
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </motion.button>
  );
}

// Gesture Recognition Hook
export function useGestures(
  elementRef: React.RefObject<HTMLElement>,
  callbacks: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onPinch?: (scale: number) => void;
    onDoubleTap?: () => void;
  }
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let lastTap = 0;
    let pinchDistance = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        pinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const threshold = 50;

        // Check for swipe gestures
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
              callbacks.onSwipeRight?.();
            } else {
              callbacks.onSwipeLeft?.();
            }
          }
        } else {
          if (Math.abs(deltaY) > threshold) {
            if (deltaY > 0) {
              callbacks.onSwipeDown?.();
            } else {
              callbacks.onSwipeUp?.();
            }
          }
        }

        // Check for double tap
        const now = Date.now();
        if (now - lastTap < 300) {
          callbacks.onDoubleTap?.();
        }
        lastTap = now;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && callbacks.onPinch) {
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = currentDistance / pinchDistance;
        callbacks.onPinch(scale);
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [callbacks]);
}