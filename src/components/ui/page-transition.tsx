// Performance-optimized page transition component
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { pageTransition, getReducedMotionVariants } from "@/lib/animations"
import { useOptimizedMotion } from "@/hooks/useAnimations"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className 
}) => {
  const pathname = usePathname()
  const { shouldReduceMotion } = useOptimizedMotion()
  
  // Use reduced motion variants if needed
  const variants = shouldReduceMotion 
    ? getReducedMotionVariants(pageTransition)
    : pageTransition
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        // Optimize for performance
        style={{
          willChange: 'transform, opacity',
        }}
        // Fast transitions for better UX
        transition={{
          type: "tween",
          duration: shouldReduceMotion ? 0 : 0.2,
          ease: [0.25, 1, 0.5, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for programmatic page transitions
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  
  const startTransition = React.useCallback(() => {
    setIsTransitioning(true)
    // Reset after animation completes
    setTimeout(() => setIsTransitioning(false), 300)
  }, [])
  
  return {
    isTransitioning,
    startTransition,
  }
}