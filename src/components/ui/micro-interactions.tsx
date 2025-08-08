// Essential micro-interactions for performance and UX
"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { useOptimizedMotion } from "@/hooks/useAnimations"
import { cn } from "@/lib/utils"

// 1. Hover Lift Effect (for cards, buttons)
interface HoverLiftProps extends HTMLMotionProps<"div"> {
  liftHeight?: number
  children: React.ReactNode
}

export const HoverLift: React.FC<HoverLiftProps> = ({ 
  liftHeight = 8, 
  children, 
  className,
  ...props 
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  return (
    <motion.div
      className={cn("will-change-transform transform-gpu", className)}
      whileHover={shouldReduceMotion ? {} : { 
        y: -liftHeight,
        transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 2. Press Scale Effect (for interactive elements)
interface PressScaleProps extends HTMLMotionProps<"div"> {
  scale?: number
  children: React.ReactNode
}

export const PressScale: React.FC<PressScaleProps> = ({ 
  scale = 0.95, 
  children, 
  className,
  ...props 
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  return (
    <motion.div
      className={cn("will-change-transform transform-gpu cursor-pointer", className)}
      whileTap={shouldReduceMotion ? {} : { 
        scale,
        transition: { duration: 0.1, ease: [0.25, 1, 0.5, 1] }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 3. Fade In on Scroll (for content sections)
interface FadeInScrollProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  delay?: number
}

export const FadeInScroll: React.FC<FadeInScrollProps> = ({ 
  children, 
  delay = 0,
  className,
  ...props 
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 1, 0.5, 1] 
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 4. Stagger Children (for lists, grids)
interface StaggerChildrenProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  staggerDelay?: number
}

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({ 
  children, 
  staggerDelay = 0.1,
  className,
  ...props 
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={shouldReduceMotion ? {} : {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 5. Stagger Item (child of StaggerChildren)
interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ 
  children, 
  className,
  ...props 
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      variants={shouldReduceMotion ? {} : {
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 6. Glow on Hover (for CTAs, important elements)
interface GlowHoverProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  glowColor?: string
}

export const GlowHover: React.FC<GlowHoverProps> = ({ 
  children, 
  glowColor = "rgba(16, 185, 129, 0.3)",
  className,
  ...props 
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      whileHover={shouldReduceMotion ? {} : {
        boxShadow: `0 0 20px ${glowColor}`,
        transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 7. Shake Animation (for errors, validation)
interface ShakeProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  trigger?: boolean
}

export const Shake: React.FC<ShakeProps> = ({ 
  children, 
  trigger = false,
  className,
  ...props 
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      animate={trigger && !shouldReduceMotion ? {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] }
      } : {}}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 8. Success Checkmark Animation
interface SuccessCheckProps {
  isVisible: boolean
  size?: number
  className?: string
}

export const SuccessCheck: React.FC<SuccessCheckProps> = ({ 
  isVisible, 
  size = 24,
  className 
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={isVisible ? { 
        scale: 1, 
        opacity: 1,
        transition: shouldReduceMotion ? { duration: 0 } : {
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.3
        }
      } : { scale: 0, opacity: 0 }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-success"
      >
        <motion.path
          d="M20 6L9 17l-5-5"
          initial={{ pathLength: 0 }}
          animate={isVisible ? { 
            pathLength: 1,
            transition: shouldReduceMotion ? { duration: 0 } : {
              duration: 0.5,
              ease: [0.25, 1, 0.5, 1],
              delay: 0.1
            }
          } : { pathLength: 0 }}
        />
      </motion.svg>
    </motion.div>
  )
}

// 9. Floating Action Button (with pulse effect)
interface FloatingActionProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode
  pulse?: boolean
}

export const FloatingAction: React.FC<FloatingActionProps> = ({ 
  children, 
  pulse = false,
  className,
  ...props 
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  return (
    <motion.button
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 bg-primary text-black rounded-full shadow-elevation-4 flex items-center justify-center will-change-transform transform-gpu z-50",
        className
      )}
      whileHover={shouldReduceMotion ? {} : { 
        scale: 1.1,
        transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] }
      }}
      whileTap={shouldReduceMotion ? {} : { 
        scale: 0.95,
        transition: { duration: 0.1, ease: [0.25, 1, 0.5, 1] }
      }}
      animate={pulse && !shouldReduceMotion ? {
        boxShadow: [
          "0 0 0 0 rgba(16, 185, 129, 0.7)",
          "0 0 0 10px rgba(16, 185, 129, 0)",
          "0 0 0 0 rgba(16, 185, 129, 0)"
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: [0.25, 1, 0.5, 1]
        }
      } : {}}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// 10. Progress Bar Animation
interface ProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className,
  showPercentage = false 
}) => {
  const { shouldReduceMotion } = useOptimizedMotion()
  
  return (
    <div className={cn("w-full", className)}>
      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${progress}%`,
            transition: shouldReduceMotion ? { duration: 0 } : {
              duration: 0.5,
              ease: [0.25, 1, 0.5, 1]
            }
          }}
        />
      </div>
      {showPercentage && (
        <motion.div
          className="text-sm text-neutral-600 mt-1 text-center font-primary"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: shouldReduceMotion ? { duration: 0 } : {
              duration: 0.3,
              delay: 0.2
            }
          }}
        >
          {Math.round(progress)}%
        </motion.div>
      )}
    </div>
  )
}