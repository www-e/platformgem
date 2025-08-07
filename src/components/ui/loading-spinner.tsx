// Performance-optimized loading spinner
"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { spinnerRotate } from "@/lib/animations"
import { useOptimizedMotion } from "@/hooks/useAnimations"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg"
  className?: string
  color?: "primary" | "secondary" | "neutral"
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "default",
  className,
  color = "primary"
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8"
  }
  
  const colorClasses = {
    primary: "border-primary-500",
    secondary: "border-secondary-500",
    neutral: "border-neutral-500"
  }
  
  if (shouldReduceMotion) {
    // Static loading indicator for reduced motion
    return (
      <div 
        className={cn(
          "rounded-full border-2 border-t-transparent",
          sizeClasses[size],
          colorClasses[color],
          "opacity-75",
          className
        )}
        aria-label="جاري التحميل"
      />
    )
  }
  
  return (
    <motion.div
      className={cn(
        "rounded-full border-2 border-t-transparent",
        sizeClasses[size],
        colorClasses[color],
        // Performance optimizations
        "will-change-transform transform-gpu",
        className
      )}
      variants={spinnerRotate}
      animate="animate"
      aria-label="جاري التحميل"
      style={{
        // Optimize for 60fps rotation
        transformOrigin: 'center',
      }}
    />
  )
}

// Skeleton loader for better perceived performance
export const SkeletonLoader: React.FC<{
  className?: string
  lines?: number
}> = ({ className, lines = 3 }) => {
  return (
    <div className={cn("animate-pulse space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-neutral-200 rounded",
            // Vary widths for more realistic skeleton
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}