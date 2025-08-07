// Performance-optimized animated button component
"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { Button, ButtonProps } from "./button"
import { buttonPress, getReducedMotionVariants } from "@/lib/animations"
import { useOptimizedMotion } from "@/hooks/useAnimations"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends Omit<ButtonProps, 'asChild' | 'onDrag'> {
  motionProps?: Omit<HTMLMotionProps<"button">, keyof ButtonProps | 'onDrag'>
  enableHover?: boolean
  enableTap?: boolean
}

export const AnimatedButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(({ 
  className, 
  motionProps, 
  enableHover = true, 
  enableTap = true,
  children,
  ...props 
}, ref) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  // Use reduced motion variants if needed
  const variants = shouldReduceMotion 
    ? getReducedMotionVariants(buttonPress)
    : buttonPress
  
  return (
    <motion.button
      ref={ref}
      className={cn(
        // Base button styles from our enhanced Button component
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group font-primary",
        // Performance optimizations
        "will-change-transform transform-gpu",
        className
      )}
      variants={variants}
      initial="initial"
      whileHover={enableHover ? "whileHover" : undefined}
      whileTap={enableTap ? "whileTap" : undefined}
      // Optimize for 60fps
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  )
})

AnimatedButton.displayName = "AnimatedButton"