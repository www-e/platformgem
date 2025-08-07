// src/components/ui/button.tsx

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group font-primary",
  {
    variants: {
      variant: {
        // Primary variant with gradient and glow effect
        primary:
          "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-elevation-2 hover:shadow-elevation-4 hover:from-primary-600 hover:to-primary-700 active:scale-95 hover:scale-[1.02] transform-gpu",

        // Secondary variant with amber gradient
        secondary:
          "bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-elevation-2 hover:shadow-elevation-4 hover:from-secondary-600 hover:to-secondary-700 active:scale-95 hover:scale-[1.02] transform-gpu",

        // Outline variant with hover fill
        outline:
          "border-2 border-primary-500 bg-transparent text-primary-600 shadow-sm hover:bg-primary-500 hover:text-white hover:shadow-elevation-3 active:scale-95 hover:scale-[1.02] transform-gpu",

        // Ghost variant with subtle hover
        ghost:
          "bg-transparent text-neutral-700 hover:bg-primary-50 hover:text-primary-700 active:scale-95 hover:scale-[1.02] transform-gpu",

        // Gradient variant with rainbow effect
        gradient:
          "bg-gradient-to-r from-primary-500 via-info to-secondary-500 text-white shadow-elevation-3 hover:shadow-elevation-5 hover:from-primary-600 hover:via-info-dark hover:to-secondary-600 active:scale-95 hover:scale-[1.02] transform-gpu animate-pulse-glow",

        // Glass morphism variant
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-neutral-800 dark:text-white shadow-glass hover:bg-white/20 hover:shadow-elevation-4 active:scale-95 hover:scale-[1.02] transform-gpu",

        // Neon variant with glow effect
        neon: "bg-primary-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)] border border-primary-400 active:scale-95 hover:scale-[1.02] transform-gpu animate-pulse-glow",

        // Minimal variant
        minimal:
          "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-800 active:scale-95 hover:scale-[1.02] transform-gpu",

        // Destructive variant
        destructive:
          "bg-gradient-to-r from-error to-error-dark text-white shadow-elevation-2 hover:shadow-elevation-4 hover:from-error-dark hover:to-error active:scale-95 hover:scale-[1.02] transform-gpu",

        // Link variant
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 active:scale-95 transform-gpu",
      },
      size: {
        xs: "h-7 px-3 py-1 text-xs rounded-md", // 28px height
        sm: "h-8 px-4 py-2 text-xs rounded-md", // 32px height
        default: "h-10 px-6 py-2 text-sm rounded-lg", // 40px height
        lg: "h-12 px-8 py-3 text-base rounded-lg", // 48px height
        xl: "h-14 px-10 py-4 text-lg rounded-xl", // 56px height
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      success = false,
      error = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const isDisabled = disabled || loading;
    const currentVariant = error
      ? "destructive"
      : success
      ? "primary"
      : variant;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant: currentVariant, size, className }),
          fullWidth && "w-full",
          loading && "cursor-wait",
          success && "animate-pulse",
          error && "animate-pulse"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {loading && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="sr-only">Loading...</span>
            </>
          )}

          {success && !loading && (
            <svg
              className="h-4 w-4 animate-scale-in"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}

          {error && !loading && (
            <svg
              className="h-4 w-4 animate-scale-in"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}

          {!loading && !success && !error && (
            <>
              {icon && iconPosition === "left" && (
                <span className="flex-shrink-0">{icon}</span>
              )}

              {children && (
                <span className="leading-arabic-normal">{children}</span>
              )}

              {icon && iconPosition === "right" && (
                <span className="flex-shrink-0">{icon}</span>
              )}
            </>
          )}

          {(variant === "gradient" || variant === "neon") && (
            <div className="absolute inset-0 -top-px overflow-hidden rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
            </div>
          )}
        </div>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };