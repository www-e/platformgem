// src/components/shared/StatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCard {
  /**
   * Unique identifier for the stat
   */
  id: string;
  /**
   * Main title of the stat
   */
  title: string;
  /**
   * Primary value to display
   */
  value: string | number;
  /**
   * Optional subtitle or additional info
   */
  subtitle?: string;
  /**
   * Icon to display
   */
  icon: LucideIcon;
  /**
   * Icon color classes
   * @default "text-muted-foreground"
   */
  iconColor?: string;
  /**
   * Card background gradient classes (optional)
   */
  gradient?: string;
  /**
   * Additional card CSS classes
   */
  cardClassName?: string;
  /**
   * Text color for title
   */
  titleColor?: string;
  /**
   * Text color for value
   */
  valueColor?: string;
  /**
   * Text color for subtitle
   */
  subtitleColor?: string;
}

interface StatsCardsProps {
  /**
   * Array of stat cards to display
   */
  stats: StatCard[];
  /**
   * Grid layout configuration
   * @default "grid-cols-1 md:grid-cols-4"
   */
  gridCols?: string;
  /**
   * Gap between cards
   * @default "gap-6"
   */
  gap?: string;
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Number of skeleton cards to show when loading
   */
  loadingCardCount?: number;
}

export function StatsCards({ 
  stats, 
  gridCols = "grid-cols-1 md:grid-cols-4",
  gap = "gap-6",
  isLoading = false,
  loadingCardCount = 4
}: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className={`grid ${gridCols} ${gap}`}>
        {[...Array(loadingCardCount)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} ${gap}`}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card 
            key={stat.id} 
            className={stat.gradient || ''}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${stat.titleColor || ''}`}>
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.iconColor || 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.valueColor || ''}`}>
                {stat.value}
              </div>
              {stat.subtitle && (
                <p className={`text-xs ${stat.subtitleColor || 'text-muted-foreground'}`}>
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}