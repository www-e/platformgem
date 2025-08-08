import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground transition-all duration-300 transform-gpu relative overflow-hidden group",
  {
    variants: {
      variant: {
        // Default card with subtle shadow
        default: "shadow-elevation-2 hover:shadow-elevation-4",
        
        // Elevated card with stronger shadow
        elevated: "shadow-elevation-4 hover:shadow-elevation-5 border-0",
        
        // Outlined card with border emphasis
        outlined: "border-2 border-primary-200 hover:border-primary-300 shadow-elevation-1 hover:shadow-elevation-3",
        
        // Glass morphism card
        glass: "bg-white/10 backdrop-blur-md border-white/20 shadow-glass hover:bg-white/20 hover:shadow-elevation-4",
        
        // Gradient card with animated background
        gradient: "bg-gradient-to-br from-primary-50 to-secondary-50 border-0 shadow-elevation-3 hover:shadow-elevation-5 hover:from-primary-100 hover:to-secondary-100",
        
        // Interactive card with strong hover effects
        interactive: "shadow-elevation-2 hover:shadow-elevation-5 cursor-pointer border-0 hover:bg-primary-50/50",
      },
      hover: {
        // No hover effect
        none: "",
        
        // Lift effect on hover
        lift: "hover:-translate-y-2",
        
        // Glow effect on hover
        glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
        
        // Scale effect on hover
        scale: "hover:scale-[1.02]",
        
        // Tilt effect on hover (3D)
        tilt: "hover:rotate-1 hover:scale-[1.02]",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "lift",
      padding: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  interactive?: boolean
  loading?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, padding, interactive = false, loading = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(
          cardVariants({ variant, hover, padding }),
          interactive && "cursor-pointer select-none",
          loading && "animate-pulse",
          className
        )}
        {...props}
      >
        {/* Shimmer effect for loading state */}
        {loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
        )}
        
        {/* Content */}
        {props.children}
        
        {/* Hover overlay for interactive cards */}
        {interactive && (
          <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        )}
      </div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref}
    data-slot="card-header"
    className={cn(
      "flex flex-col space-y-2 p-6 pb-4 font-display", 
      className
    )} 
    {...props} 
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-title"
    className={cn(
      "text-xl font-semibold leading-arabic-tight tracking-tight text-neutral-900 dark:text-black font-display", 
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-description"
    className={cn(
      "text-sm text-neutral-600 dark:text-neutral-400 leading-arabic-relaxed font-primary", 
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref}
    data-slot="card-content"
    className={cn(
      "p-6 pt-0 font-primary leading-arabic-normal", 
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref}
    data-slot="card-footer"
    className={cn(
      "flex items-center p-6 pt-0 gap-3", 
      className
    )} 
    {...props} 
  />
))
CardFooter.displayName = "CardFooter"

// New CardAction component for interactive elements
const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref}
    data-slot="card-action"
    className={cn(
      "absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0", 
      className
    )} 
    {...props} 
  />
))
CardAction.displayName = "CardAction"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardAction,
  cardVariants 
}
