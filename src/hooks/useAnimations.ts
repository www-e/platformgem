// Performance-optimized animation hooks
import { useReducedMotion, useInView } from "framer-motion"
import { useEffect, useState, useRef } from "react"

// Hook for reduced motion preference
export const useOptimizedMotion = () => {
  const shouldReduceMotion = useReducedMotion()
  
  return {
    shouldReduceMotion,
    // Return instant transitions for reduced motion
    getTransition: (duration: number = 0.3) => 
      shouldReduceMotion ? { duration: 0 } : { duration },
  }
}

// Hook for intersection observer with performance optimization
export const useInViewOptimized = (options?: { once?: boolean; margin?: string; amount?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true, // Only trigger once for performance
    margin: "0px 0px -100px 0px", // Trigger before element is visible
    ...options,
  })
  
  return { ref, isInView }
}

// Hook for staggered animations with performance optimization
export const useStaggeredAnimation = (itemCount: number, delay: number = 0.1) => {
  const [visibleItems, setVisibleItems] = useState(0)
  const { shouldReduceMotion } = useOptimizedMotion()
  
  useEffect(() => {
    if (shouldReduceMotion) {
      setVisibleItems(itemCount)
      return
    }
    
    const timer = setInterval(() => {
      setVisibleItems(prev => {
        if (prev >= itemCount) {
          clearInterval(timer)
          return prev
        }
        return prev + 1
      })
    }, delay * 1000)
    
    return () => clearInterval(timer)
  }, [itemCount, delay, shouldReduceMotion])
  
  return visibleItems
}

// Hook for scroll-triggered animations with throttling
export const useScrollAnimation = (threshold: number = 0.1) => {
  const [scrollY, setScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  
  useEffect(() => {
    let ticking = false
    let scrollTimeout: NodeJS.Timeout
    
    const updateScrollY = () => {
      setScrollY(window.scrollY)
      ticking = false
      
      setIsScrolling(true)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150)
    }
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollY)
        ticking = true
      }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', requestTick)
      clearTimeout(scrollTimeout)
    }
  }, [])
  
  return { scrollY, isScrolling }
}

// Hook for gesture support with performance optimization
export const useGestures = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const dragHandlers = {
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => {
      setIsDragging(false)
      setDragOffset({ x: 0, y: 0 })
    },
    onDrag: (_: any, info: any) => {
      setDragOffset({ x: info.offset.x, y: info.offset.y })
    },
  }
  
  return {
    isDragging,
    dragOffset,
    dragHandlers,
  }
}

// Hook for preloading animations
export const usePreloadAnimations = () => {
  useEffect(() => {
    // Preload common animation styles
    const style = document.createElement('style')
    style.textContent = `
      .will-change-transform { will-change: transform; }
      .will-change-opacity { will-change: opacity; }
      .gpu-accelerated { transform: translateZ(0); }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])
}

// Hook for animation performance monitoring
export const useAnimationPerformance = () => {
  const [fps, setFps] = useState(60)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  
  useEffect(() => {
    let animationId: number
    
    const measureFPS = () => {
      frameCount.current++
      const currentTime = performance.now()
      
      if (currentTime - lastTime.current >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)))
        frameCount.current = 0
        lastTime.current = currentTime
      }
      
      animationId = requestAnimationFrame(measureFPS)
    }
    
    animationId = requestAnimationFrame(measureFPS)
    
    return () => cancelAnimationFrame(animationId)
  }, [])
  
  return { fps, isPerformant: fps >= 55 }
}