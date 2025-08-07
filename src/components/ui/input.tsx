import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-background text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-primary",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        filled: "border-0 bg-neutral-100 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary",
        outlined: "border-2 border-neutral-300 focus-visible:border-primary-500",
        underlined: "border-0 border-b-2 border-neutral-300 rounded-none focus-visible:border-primary-500 bg-transparent",
        ghost: "border-0 bg-transparent hover:bg-neutral-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-base",
      },
      state: {
        default: "",
        success: "border-success focus-visible:ring-success",
        error: "border-error focus-visible:ring-error",
        warning: "border-warning focus-visible:ring-warning",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  successMessage?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
  characterCount?: boolean
  maxLength?: number
  loading?: boolean
  onValidate?: (value: string) => { isValid: boolean; message?: string }
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    state,
    type = "text",
    label,
    helperText,
    errorMessage,
    successMessage,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    characterCount = false,
    maxLength,
    loading = false,
    onValidate,
    value,
    onChange,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [validationState, setValidationState] = React.useState<{
      isValid: boolean
      message?: string
    }>({ isValid: true })
    
    const inputType = showPasswordToggle && type === "password" 
      ? (showPassword ? "text" : "password") 
      : type
    
    const hasValue = value !== undefined ? String(value).length > 0 : false
    const shouldFloatLabel = isFocused || hasValue
    
    // Real-time validation
    React.useEffect(() => {
      if (onValidate && value !== undefined) {
        const result = onValidate(String(value))
        setValidationState(result)
      }
    }, [value, onValidate])
    
    // Determine current state
    const currentState = errorMessage || !validationState.isValid 
      ? 'error' 
      : successMessage || (validationState.isValid && hasValue && onValidate)
      ? 'success'
      : state
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
    }
    
    return (
      <div className="relative w-full">
        {/* Floating Label */}
        {label && (
          <label
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none font-primary",
              shouldFloatLabel
                ? "top-2 text-xs text-primary-600 transform -translate-y-1"
                : "top-1/2 text-sm text-muted-foreground transform -translate-y-1/2",
              leftIcon && (shouldFloatLabel ? "left-10" : "left-10")
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant, size, state: currentState }),
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle || loading || characterCount) && "pr-10",
              label && "pt-6 pb-2",
              className
            )}
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLength}
            {...props}
          />
          
          {/* Right Side Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {/* Loading Spinner */}
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            )}
            
            {/* Validation Icons */}
            {!loading && currentState === 'success' && (
              <Check className="h-4 w-4 text-success animate-scale-in" />
            )}
            
            {!loading && currentState === 'error' && (
              <X className="h-4 w-4 text-error animate-scale-in" />
            )}
            
            {!loading && currentState === 'warning' && (
              <AlertCircle className="h-4 w-4 text-warning animate-scale-in" />
            )}
            
            {/* Password Toggle */}
            {showPasswordToggle && type === "password" && !loading && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            
            {/* Custom Right Icon */}
            {rightIcon && !loading && (
              <div className="text-muted-foreground">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        
        {/* Character Count */}
        {characterCount && maxLength && (
          <div className="absolute right-3 -bottom-5 text-xs text-muted-foreground">
            {String(value || '').length}/{maxLength}
          </div>
        )}
        
        {/* Helper Text / Error Message */}
        {(helperText || errorMessage || successMessage || validationState.message) && (
          <div className={cn(
            "mt-1 text-xs font-primary transition-colors duration-200",
            currentState === 'error' ? "text-error" : 
            currentState === 'success' ? "text-success" :
            currentState === 'warning' ? "text-warning" :
            "text-muted-foreground"
          )}>
            {errorMessage || 
             (!validationState.isValid && validationState.message) ||
             successMessage || 
             (validationState.isValid && validationState.message) ||
             helperText}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
