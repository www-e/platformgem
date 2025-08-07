// src/components/shared/ActionButton.tsx
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  /**
   * Button text
   */
  text: string;
  /**
   * Click handler
   */
  onClick: () => void;
  /**
   * Button variant
   * @default "primary"
   */
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  /**
   * Button size
   * @default "default"
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /**
   * Icon to display (optional)
   */
  icon?: LucideIcon;
  /**
   * Icon position
   * @default "left"
   */
  iconPosition?: 'left' | 'right';
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Full width button
   */
  fullWidth?: boolean;
}

export function ActionButton({
  text,
  onClick,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  className = '',
  fullWidth = false
}: ActionButtonProps) {
  const buttonClasses = `${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={buttonClasses}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 mr-2" />
      )}
      {text}
      {Icon && iconPosition === 'right' && !isLoading && <Icon className="w-4 h-4 ml-2" />}
    </Button>
  );
}