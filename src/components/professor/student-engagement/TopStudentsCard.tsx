// src/components/professor/student-engagement/TopStudentsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock, Award } from 'lucide-react';
import { formatDuration, formatTimeAgo, getEngagementColor } from '@/lib/engagement-utils';
import type { TopStudent } from '@/hooks/useStudentEngagement';

interface TopStudentsCardProps {
  topStudents: TopStudent[];
}

export function TopStudentsCard({ topStudents }: TopStudentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          أكثر الملتحقين تفاعلاً
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topStudents.map((student, index) => (
            <div key={student.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-black font-bold text-sm">
                #{index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">{student.name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(student.totalWatchTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {student.completedCourses} دورة
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-16 bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${student.averageProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {student.averageProgress.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getEngagementColor(student.engagementScore)}`}>
                  {student.engagementScore.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(student.lastActivity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}