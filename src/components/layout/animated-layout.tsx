// Animated layout wrapper for smooth page transitions
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { pageTransition, getReducedMotionVariants } from "@/lib/animations"
import { useOptimizedMotion } from "@/hooks/useAnimations"
import { NavigationProgress } from "@/components/ui/instant-navigation"

interface AnimatedLayoutProps {
  children: React.ReactNode
  className?: string
}

export const AnimatedLayout: React.FC<AnimatedLayoutProps> = ({
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
    <>
      <NavigationProgress />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          className={className}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          // Performance optimizations
          style={{
            willChange: 'transform, opacity',
          }}
          // Fast transitions for better perceived performance
          transition={{
            type: "tween",
            duration: shouldReduceMotion ? 0 : 0.15, // Very fast for instant feel
            ease: [0.25, 1, 0.5, 1],
          }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </>
  )
}

// Scroll restoration for better UX
export const useScrollRestoration = () => {
  const pathname = usePathname()
  
  React.useEffect(() => {
    // Restore scroll position after navigation
    const scrollPos = sessionStorage.getItem(`scroll-${pathname}`)
    if (scrollPos) {
      window.scrollTo(0, parseInt(scrollPos))
    } else {
      window.scrollTo(0, 0)
    }
    
    // Save scroll position before leaving
    const handleBeforeUnload = () => {
      sessionStorage.setItem(`scroll-${pathname}`, window.scrollY.toString())
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      sessionStorage.setItem(`scroll-${pathname}`, window.scrollY.toString())
    }
  }, [pathname])
}

// Performance monitoring component
export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = React.useState({
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
  })
  
  React.useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
      }).observe({ entryTypes: ['largest-contentful-paint'] })
      
      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }))
        })
      }).observe({ entryTypes: ['first-input'] })
      
      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        setMetrics(prev => ({ ...prev, cls: clsValue }))
      }).observe({ entryTypes: ['layout-shift'] })
      
      // Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        setMetrics(prev => ({ ...prev, ttfb: navigation.responseStart - navigation.requestStart }))
      }
    }
  }, [])
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
      <div>LCP: {metrics.lcp.toFixed(0)}ms</div>
      <div>FID: {metrics.fid.toFixed(0)}ms</div>
      <div>CLS: {metrics.cls.toFixed(3)}</div>
      <div>TTFB: {metrics.ttfb.toFixed(0)}ms</div>
    </div>
  )
}