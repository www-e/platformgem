// src/components/analytics/professor/LessonsTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  PlayCircle,
  TrendingUp
} from 'lucide-react';
import { formatTime, getCompletionBadgeVariant } from '@/lib/analytics-utils';
import type { CourseAnalytics } from '@/hooks/useProfessorAnalytics';

interface LessonsTabProps {
  analytics: CourseAnalytics;
}

export function LessonsTab({ analytics }: LessonsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          أداء الدروس
        </CardTitle>
        <CardDescription>
          إحصائيات مفصلة لكل درس في الدورة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analytics.lessons.map((lessonData) => (
            <div key={lessonData.lesson.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">
                    {lessonData.lesson.order}. {lessonData.lesson.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    المدة: {formatTime(lessonData.lesson.duration || 0)}
                  </p>
                </div>
                <Badge variant={getCompletionBadgeVariant(lessonData.completionRate)}>
                  {lessonData.completionRate.toFixed(1)}% إكمال
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>أكمل الدرس</span>
                  </div>
                  <div className="font-medium">
                    {lessonData.completedCount} ملتحق
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <PlayCircle className="w-3 h-3" />
                    <span>عدد المشاهدات</span>
                  </div>
                  <div className="font-medium">
                    {lessonData.viewCount} مشاهدة
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    <span>إجمالي وقت المشاهدة</span>
                  </div>
                  <div className="font-medium">
                    {formatTime(lessonData.totalWatchTime)}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>متوسط وقت المشاهدة</span>
                  </div>
                  <div className="font-medium">
                    {formatTime(lessonData.averageWatchTime)}
                  </div>
                </div>
              </div>
              
              {/* Completion Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${lessonData.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}