// src/components/shared/EmptyState.tsx
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  /**
   * Icon to display
   */
  icon: LucideIcon;
  /**
   * Main title text
   */
  title: string;
  /**
   * Description text
   */
  description: string;
  /**
   * Action button text (optional)
   */
  actionText?: string;
  /**
   * Action button handler (optional)
   */
  onAction?: () => void;
  /**
   * Button variant
   * @default "outline"
   */
  actionVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /**
   * Icon size classes
   * @default "w-16 h-16"
   */
  iconSize?: string;
  /**
   * Icon color classes
   * @default "text-muted-foreground"
   */
  iconColor?: string;
  /**
   * Container padding classes
   * @default "py-12"
   */
  containerPadding?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionVariant = 'outline',
  iconSize = 'w-16 h-16',
  iconColor = 'text-muted-foreground',
  containerPadding = 'py-12'
}: EmptyStateProps) {
  return (
    <div className={`text-center ${containerPadding}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className={`${iconSize.replace('w-16 h-16', 'w-8 h-8')} ${iconColor}`} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant={actionVariant}>
          {actionText}
        </Button>
      )}
    </div>
  );
}