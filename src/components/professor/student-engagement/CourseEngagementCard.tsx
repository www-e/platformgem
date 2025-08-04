// src/components/professor/student-engagement/CourseEngagementCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Target, Clock, Award } from 'lucide-react';
import { formatDuration, getEngagementBadge } from '@/lib/engagement-utils';
import type { CourseEngagement } from '@/hooks/useStudentEngagement';

interface CourseEngagementCardProps {
  courseEngagement: CourseEngagement[];
}

export function CourseEngagementCard({ courseEngagement }: CourseEngagementCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          تفاعل الدورات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courseEngagement.map((course) => (
            <div key={course.courseId} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold truncate">{course.courseName}</h4>
                {getEngagementBadge(course.engagementScore)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span>{course.activeStudents}/{course.totalStudents} نشط</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span>{course.averageProgress.toFixed(0)}% تقدم</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{formatDuration(course.averageWatchTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-3 w-3 text-muted-foreground" />
                  <span>{course.completionRate.toFixed(0)}% إكمال</span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${course.averageProgress}%` }}
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