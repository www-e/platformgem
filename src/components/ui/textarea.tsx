import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex w-full rounded-lg border bg-background text-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none font-primary leading-arabic-relaxed",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        filled: "border-0 bg-neutral-100 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary",
        outlined: "border-2 border-neutral-300 focus-visible:border-primary-500",
        ghost: "border-0 bg-transparent hover:bg-neutral-50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary",
      },
      size: {
        sm: "min-h-[60px] px-3 py-2 text-xs",
        default: "min-h-[80px] px-3 py-2",
        lg: "min-h-[120px] px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  wordCount?: boolean
  characterCount?: boolean
  autoResize?: boolean
  maxWords?: number
  minRows?: number
  maxRows?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    size,
    label,
    helperText,
    errorMessage,
    wordCount = false,
    characterCount = false,
    autoResize = false,
    maxWords,
    minRows = 3,
    maxRows = 10,
    value,
    onChange,
    ...props
  }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [isFocused, setIsFocused] = React.useState(false)
    
    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!)
    
    const textValue = String(value || '')
    const wordCountValue = textValue.trim() ? textValue.trim().split(/\s+/).length : 0
    const characterCountValue = textValue.length
    
    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea || !autoResize) return
      
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      const minHeight = lineHeight * minRows
      const maxHeight = lineHeight * maxRows
      
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }, [autoResize, minRows, maxRows])
    
    React.useEffect(() => {
      adjustHeight()
    }, [value, adjustHeight])
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e)
      if (autoResize) {
        adjustHeight()
      }
    }
    
    const hasValue = textValue.length > 0
    const shouldFloatLabel = isFocused || hasValue
    
    return (
      <div className="relative w-full">
        {/* Floating Label */}
        {label && (
          <label
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none font-primary",
              shouldFloatLabel
                ? "top-2 text-xs text-primary-600 transform -translate-y-1"
                : "top-4 text-sm text-muted-foreground"
            )}
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={textareaRef}
          className={cn(
            textareaVariants({ variant, size }),
            label && "pt-6 pb-2",
            className
          )}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {/* Counter Display */}
        {(wordCount || characterCount) && (
          <div className="absolute right-3 -bottom-5 flex gap-4 text-xs text-muted-foreground">
            {wordCount && (
              <span className={cn(
                maxWords && wordCountValue > maxWords && "text-error"
              )}>
                {wordCountValue}{maxWords && `/${maxWords}`} كلمة
              </span>
            )}
            {characterCount && props.maxLength && (
              <span className={cn(
                props.maxLength && characterCountValue > props.maxLength && "text-error"
              )}>
                {characterCountValue}/{props.maxLength} حرف
              </span>
            )}
          </div>
        )}
        
        {/* Helper Text / Error Message */}
        {(helperText || errorMessage) && (
          <div className={cn(
            "mt-1 text-xs font-primary transition-colors duration-200",
            errorMessage ? "text-error" : "text-muted-foreground"
          )}>
            {errorMessage || helperText}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }