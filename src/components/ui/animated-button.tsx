// Performance-optimized animated button component
"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { Button, ButtonProps } from "./button"
import { buttonPress, getReducedMotionVariants } from "@/lib/animations"
import { useOptimizedMotion } from "@/hooks/useAnimations"

interface AnimatedButtonProps extends ButtonProps {
  motionProps?: Omit<HTMLMotionProps<"button">, keyof ButtonProps>
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
    <Button asChild ref={ref} className={className} {...props}>
      <motion.button
        variants={variants}
        initial="initial"
        whileHover={enableHover ? "whileHover" : undefined}
        whileTap={enableTap ? "whileTap" : undefined}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
        {...motionProps}
      >
        {children}
      </motion.button>
    </Button>
  )
})

AnimatedButton.displayName = "AnimatedButton"