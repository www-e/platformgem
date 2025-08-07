// Performance-optimized animation system
import { Variants, Transition } from "framer-motion"

// High-performance spring configuration
export const springConfig: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
}

// Optimized easing curves
export const easings = {
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
} as const

// Performance-first animation variants
export const fadeInUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0 } // Instant initial state
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeOutCubic,
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: {
      duration: 0.2,
      ease: easings.easeInOutCubic,
    }
  }
}

export const scaleIn: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0 }
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: easings.easeOutQuart,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: easings.easeInOutCubic,
    }
  }
}

export const slideInRight: Variants = {
  initial: { 
    opacity: 0, 
    x: 30,
    transition: { duration: 0 }
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeOutCubic,
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: {
      duration: 0.2,
      ease: easings.easeInOutCubic,
    }
  }
}

// Button press animation (optimized for 60fps)
export const buttonPress: Variants = {
  initial: { scale: 1 },
  whileTap: { 
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: easings.easeOutQuart,
    }
  },
  whileHover: { 
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: easings.easeOutCubic,
    }
  }
}

// Card hover animation (GPU accelerated)
export const cardHover: Variants = {
  initial: { 
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  whileHover: { 
    y: -8,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.3,
      ease: easings.easeOutCubic,
    }
  }
}

// Staggered children animation
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
}

export const staggerItem: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.easeOutCubic,
    }
  }
}

// Page transition variants (optimized for Next.js)
export const pageTransition: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.98,
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easings.easeOutCubic,
    }
  },
  exit: { 
    opacity: 0,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: easings.easeInOutCubic,
    }
  }
}

// Modal/Dialog animations
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: easings.easeOutCubic,
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: easings.easeInOutCubic,
    }
  }
}

export const modalContent: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeOutCubic,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: easings.easeInOutCubic,
    }
  }
}

// Loading spinner (optimized)
export const spinnerRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity,
    }
  }
}

// Reduced motion support
export const getReducedMotionVariants = (variants: Variants): Variants => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      initial: variants.animate || {},
      animate: variants.animate || {},
      exit: variants.animate || {},
    }
  }
  return variants
}

// Performance monitoring
export const animationConfig = {
  // Enable GPU acceleration
  transformTemplate: ({ x, y, rotate, scale }: any) => 
    `translate3d(${x}, ${y}, 0) rotate(${rotate}) scale(${scale})`,
  
  // Optimize for 60fps
  transition: {
    duration: 0.3,
    ease: easings.easeOutCubic,
  },
  
  // Reduce layout thrashing
  layout: false,
  
  // Enable will-change optimization
  style: {
    willChange: 'transform, opacity',
  }
}