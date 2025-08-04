// src/lib/course-recommendation-utils.ts
import { Badge } from '@/components/ui/badge';
import { Target, Users, TrendingUp, Award, Sparkles } from 'lucide-react';

/**
 * Get recommendation badge component based on reason
 */
export function getRecommendationBadge(reason: string) {
  switch (reason) {
    case 'category_match':
      return <Badge className="bg-blue-100 text-blue-800"><Target className="h-3 w-3 mr-1" />مشابه لاهتماماتك</Badge>;
    case 'similar_students':
      return <Badge className="bg-green-100 text-green-800"><Users className="h-3 w-3 mr-1" />اختيار الطلاب</Badge>;
    case 'trending':
      return <Badge className="bg-orange-100 text-orange-800"><TrendingUp className="h-3 w-3 mr-1" />رائج الآن</Badge>;
    case 'professor_match':
      return <Badge className="bg-purple-100 text-purple-800"><Award className="h-3 w-3 mr-1" />من مدرس مفضل</Badge>;
    case 'completion_based':
      return <Badge className="bg-teal-100 text-teal-800"><Sparkles className="h-3 w-3 mr-1" />مقترح لك</Badge>;
    default:
      return <Badge variant="outline">مقترح</Badge>;
  }
}

/**
 * Get level badge component
 */
export function getLevelBadge(level: string) {
  switch (level) {
    case 'beginner':
      return <Badge variant="outline" className="text-green-600 border-green-600">مبتدئ</Badge>;
    case 'intermediate':
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">متوسط</Badge>;
    case 'advanced':
      return <Badge variant="outline" className="text-red-600 border-red-600">متقدم</Badge>;
    default:
      return <Badge variant="outline">غير محدد</Badge>;
  }
}

/**
 * Format duration in minutes to Arabic display
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
}

/**
 * Format price in Arabic currency format
 */
export function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'مجاني';
  
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(price);
}