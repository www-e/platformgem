// src/components/shared/LoadingState.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingStateProps {
  /**
   * Number of skeleton cards to display
   * @default 4
   */
  cardCount?: number;
  /**
   * Grid layout configuration
   * @default "grid-cols-1 md:grid-cols-4"
   */
  gridCols?: string;
  /**
   * Additional spacing classes
   * @default "space-y-6"
   */
  spacing?: string;
  /**
   * Custom card className
   */
  cardClassName?: string;
}

export function LoadingState({ 
  cardCount = 4, 
  gridCols = "grid-cols-1 md:grid-cols-4",
  spacing = "space-y-6",
  cardClassName = ""
}: LoadingStateProps) {
  return (
    <div className={spacing}>
      <div className={`grid ${gridCols} gap-6`}>
        {[...Array(cardCount)].map((_, i) => (
          <Card key={i} className={`animate-pulse ${cardClassName}`}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}