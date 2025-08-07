// Instant navigation with preloading for performance
"use client"

import * as React from "react"
import Link, { LinkProps } from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useOptimizedMotion } from "@/hooks/useAnimations"
import { cn } from "@/lib/utils"

// Preload cache for instant navigation
const preloadCache = new Set<string>()

// Hook for instant navigation with preloading
export const useInstantNavigation = () => {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = React.useState(false)
  
  // Preload a route
  const preloadRoute = React.useCallback((href: string) => {
    if (preloadCache.has(href)) return
    
    preloadCache.add(href)
    // Use Next.js router prefetch for instant loading
    router.prefetch(href)
  }, [router])
  
  // Navigate with loading state
  const navigateInstant = React.useCallback((href: string) => {
    setIsNavigating(true)
    router.push(href)
    // Reset loading state after navigation
    setTimeout(() => setIsNavigating(false), 100)
  }, [router])
  
  return {
    isNavigating,
    preloadRoute,
    navigateInstant,
  }
}

// Enhanced Link component with instant navigation
interface InstantLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
  preloadOnHover?: boolean
  preloadOnVisible?: boolean
  showLoadingState?: boolean
}

export const InstantLink: React.FC<InstantLinkProps> = ({
  href,
  children,
  className,
  preloadOnHover = true,
  preloadOnVisible = false,
  showLoadingState = false,
  ...props
}) => {
  const { preloadRoute, navigateInstant, isNavigating } = useInstantNavigation()
  const { shouldReduceMotion } = useOptimizedMotion()
  const [isHovered, setIsHovered] = React.useState(false)
  const linkRef = React.useRef<HTMLAnchorElement>(null)
  
  // Preload on intersection (for visible links)
  React.useEffect(() => {
    if (!preloadOnVisible) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            preloadRoute(href.toString())
          }
        })
      },
      { rootMargin: '100px' }
    )
    
    if (linkRef.current) {
      observer.observe(linkRef.current)
    }
    
    return () => observer.disconnect()
  }, [href, preloadOnVisible, preloadRoute])
  
  const handleMouseEnter = () => {
    setIsHovered(true)
    if (preloadOnHover) {
      preloadRoute(href.toString())
    }
  }
  
  const handleMouseLeave = () => {
    setIsHovered(false)
  }
  
  const handleClick = (e: React.MouseEvent) => {
    if (showLoadingState) {
      e.preventDefault()
      navigateInstant(href.toString())
    }
  }
  
  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={{ duration: 0.1, ease: [0.25, 1, 0.5, 1] }}
    >
      <Link
        ref={linkRef}
        href={href}
        className={cn(
          "inline-block transition-all duration-200 will-change-transform",
          isNavigating && showLoadingState && "opacity-70 pointer-events-none",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...props}
      >
        {children}
        {isNavigating && showLoadingState && (
          <motion.div
            className="inline-block ml-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </Link>
    </motion.div>
  )
}

// Navigation progress bar
export const NavigationProgress: React.FC = () => {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  
  React.useEffect(() => {
    setIsLoading(true)
    setProgress(0)
    
    // Simulate loading progress
    const timer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [pathname])
  
  if (!isLoading) return null
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary-500 origin-left"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: progress / 100 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
    />
  )
}

// Route preloader component
interface RoutePreloaderProps {
  routes: string[]
}

export const RoutePreloader: React.FC<RoutePreloaderProps> = ({ routes }) => {
  const { preloadRoute } = useInstantNavigation()
  
  React.useEffect(() => {
    // Preload critical routes on mount
    const preloadTimer = setTimeout(() => {
      routes.forEach(route => preloadRoute(route))
    }, 1000) // Delay to not interfere with initial page load
    
    return () => clearTimeout(preloadTimer)
  }, [routes, preloadRoute])
  
  return null
}

// Breadcrumb with instant navigation
interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export const InstantBreadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  className 
}) => {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm font-primary", className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-neutral-400">/</span>
          )}
          {item.href ? (
            <InstantLink
              href={item.href}
              className="text-primary-600 hover:text-primary-700 transition-colors"
              preloadOnHover
            >
              {item.label}
            </InstantLink>
          ) : (
            <span className="text-neutral-600">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// Back button with instant navigation
interface InstantBackButtonProps {
  fallbackHref?: string
  className?: string
  children?: React.ReactNode
}

export const InstantBackButton: React.FC<InstantBackButtonProps> = ({
  fallbackHref = "/",
  className,
  children = "رجوع"
}) => {
  const router = useRouter()
  const { navigateInstant } = useInstantNavigation()
  
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      navigateInstant(fallbackHref)
    }
  }
  
  return (
    <motion.button
      className={cn(
        "flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors font-primary",
        className
      )}
      onClick={handleBack}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {children}
    </motion.button>
  )
}