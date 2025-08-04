// src/components/analytics/professor/StudentsTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  CheckCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { formatTime, formatDate, getProgressBadgeVariant } from '@/lib/analytics-utils';
import type { CourseAnalytics } from '@/hooks/useProfessorAnalytics';

interface StudentsTabProps {
  analytics: CourseAnalytics;
}

export function StudentsTab({ analytics }: StudentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          تقدم الطلاب
        </CardTitle>
        <CardDescription>
          تفاصيل تقدم كل طالب في الدورة
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analytics.students.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">لا يوجد طلاب مسجلون</h3>
            <p className="text-muted-foreground">
              لم يسجل أي طالب في هذه الدورة بعد
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {analytics.students.map((studentData) => (
              <div key={studentData.student.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{studentData.student.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {studentData.student.email}
                    </p>
                  </div>
                  <Badge variant={getProgressBadgeVariant(studentData.progressPercent)}>
                    {studentData.progressPercent}% مكتمل
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>تاريخ التسجيل</span>
                    </div>
                    <div className="font-medium">
                      {formatDate(studentData.enrolledAt)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>الدروس المكتملة</span>
                    </div>
                    <div className="font-medium">
                      {studentData.completedLessons} / {analytics.overview.totalLessons}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Clock className="w-3 h-3" />
                      <span>وقت المشاهدة</span>
                    </div>
                    <div className="font-medium">
                      {formatTime(studentData.totalWatchTime)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Eye className="w-3 h-3" />
                      <span>آخر دخول</span>
                    </div>
                    <div className="font-medium">
                      {studentData.lastAccessedAt 
                        ? formatDate(studentData.lastAccessedAt)
                        : 'لم يدخل بعد'
                      }
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${studentData.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}