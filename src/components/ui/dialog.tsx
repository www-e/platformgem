// src/components/ui/dialog.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X, Maximize2, Minimize2 } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    variant?: "default" | "blur" | "dark" | "transparent";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      variant === "default" && "bg-black/80",
      variant === "blur" && "bg-black/40 backdrop-blur-md",
      variant === "dark" && "bg-black/90",
      variant === "transparent" && "bg-black/20",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-elevation-5 duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  {
    variants: {
      variant: {
        default: "rounded-xl p-6",
        confirmation: "rounded-xl p-6 max-w-md",
        form: "rounded-xl p-6 max-w-2xl",
        fullscreen: "rounded-none p-0 w-screen h-screen max-w-none",
        drawer:
          "rounded-t-xl p-6 top-auto bottom-0 translate-y-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        popover: "rounded-lg p-4 shadow-elevation-3",
      },
      size: {
        sm: "max-w-sm",
        default: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        "2xl": "max-w-6xl",
        full: "max-w-[95vw] max-h-[95vh]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  overlayVariant?: "default" | "blur" | "dark" | "transparent";
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      variant,
      size,
      overlayVariant = "blur",
      showCloseButton = true,
      closeOnOutsideClick = true,
      closeOnEscape = true,
      ...props
    },
    ref
  ) => {
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    // Handle keyboard navigation
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && closeOnEscape) {
          // Let Radix handle the escape key
          return;
        }
        if (event.key === "F11") {
          event.preventDefault();
          setIsFullscreen(!isFullscreen);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [closeOnEscape, isFullscreen]);

    return (
      <DialogPortal>
        <DialogOverlay variant={overlayVariant} />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            dialogContentVariants({
              variant: isFullscreen ? "fullscreen" : variant,
              size: isFullscreen ? "full" : size,
            }),
            className
          )}
          onPointerDownOutside={
            closeOnOutsideClick ? undefined : (e) => e.preventDefault()
          }
          onEscapeKeyDown={
            closeOnEscape ? undefined : (e) => e.preventDefault()
          }
          {...props}
        >
          {children}

          {/* Close Button */}
          {showCloseButton && (
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-2 opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none">
              <span className="flex items-center justify-center">
                <X className="h-4 w-4" />
                <span className="sr-only">إغلاق</span>
              </span>
            </DialogPrimitive.Close>
          )}

          {/* Fullscreen Toggle (for form and large dialogs) */}
          {(variant === "form" ||
            size === "lg" ||
            size === "xl" ||
            size === "2xl") && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="absolute left-4 top-4 rounded-lg p-2 opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isFullscreen ? "تصغير" : "تكبير"}
              </span>
            </button>
          )}

          {/* Drag Handle for drawer variant */}
          {variant === "drawer" && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-neutral-300 rounded-full" />
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-right font-display",
      className
    )}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 sm:space-x-reverse gap-2 pt-4 border-t border-neutral-200",
      className
    )}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-arabic-tight tracking-tight text-neutral-900 dark:text-white font-display",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-neutral-600 dark:text-neutral-400 leading-arabic-relaxed font-primary",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// New DialogBody component for content area
const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 overflow-y-auto font-primary leading-arabic-normal",
      className
    )}
    {...props}
  />
));
DialogBody.displayName = "DialogBody";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
  dialogContentVariants,
};
