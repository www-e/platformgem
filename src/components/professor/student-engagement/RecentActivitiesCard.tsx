// src/components/professor/student-engagement/RecentActivitiesCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, PlayCircle, Award, Target, MessageSquare } from 'lucide-react';
import { getActivityTypeText, formatTimeAgo } from '@/lib/engagement-utils';
import type { StudentActivity } from '@/hooks/useStudentEngagement';

interface RecentActivitiesCardProps {
  activities: StudentActivity[];
}

export function RecentActivitiesCard({ activities }: RecentActivitiesCardProps) {
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'video_watch':
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case 'lesson_complete':
        return <Award className="h-5 w-5 text-green-600" />;
      case 'quiz_attempt':
        return <Target className="h-5 w-5 text-purple-600" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-orange-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          النشاطات الحديثة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {getActivityIcon(activity.activityType)}
              </div>
              
              <div className="flex-1">
                <p className="font-medium">{activity.studentName}</p>
                <p className="text-sm text-muted-foreground">{activity.courseName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {getActivityTypeText(activity.activityType, activity.duration)}
                  </span>
                  <div className="w-16 bg-muted rounded-full h-1">
                    <div 
                      className="bg-primary h-1 rounded-full" 
                      style={{ width: `${activity.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.progress}%
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}