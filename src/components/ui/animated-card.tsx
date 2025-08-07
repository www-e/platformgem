// Performance-optimized animated card component
"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { Card, CardProps } from "./card"
import { cardHover, fadeInUp, getReducedMotionVariants } from "@/lib/animations"
import { useOptimizedMotion, useInViewOptimized } from "@/hooks/useAnimations"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends CardProps {
  motionProps?: Omit<HTMLMotionProps<"div">, keyof CardProps>
  enableHover?: boolean
  enableInView?: boolean
  delay?: number
}

export const AnimatedCard = React.forwardRef<
  HTMLDivElement,
  AnimatedCardProps
>(({ 
  className, 
  motionProps, 
  enableHover = true, 
  enableInView = true,
  delay = 0,
  children,
  ...props 
}, ref) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  const { ref: inViewRef, isInView } = useInViewOptimized()
  
  // Combine refs
  const combinedRef = React.useCallback((node: HTMLDivElement | null) => {
    if (ref) {
      if (typeof ref === 'function') ref(node)
      else ref.current = node
    }
    if (inViewRef) {
      inViewRef.current = node
    }
  }, [ref, inViewRef])
  
  // Use reduced motion variants if needed
  const hoverVariants = shouldReduceMotion 
    ? getReducedMotionVariants(cardHover)
    : cardHover
    
  const inViewVariants = shouldReduceMotion
    ? getReducedMotionVariants(fadeInUp)
    : fadeInUp
  
  return (
    <motion.div
      ref={combinedRef}
      className={cn(
        // Performance optimizations
        "will-change-transform transform-gpu",
        className
      )}
      // In-view animation
      variants={enableInView ? inViewVariants : enableHover ? hoverVariants : undefined}
      initial={enableInView ? "initial" : undefined}
      animate={enableInView && isInView ? "animate" : undefined}
      // Hover animation
      whileHover={enableHover ? "whileHover" : undefined}
      // Stagger delay
      transition={{
        delay: delay,
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  )
})

AnimatedCard.displayName = "AnimatedCard"