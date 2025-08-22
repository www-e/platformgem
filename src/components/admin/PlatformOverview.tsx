// src/components/admin/PlatformOverview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Clock, 
  User, 
  BookOpen, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface PlatformOverviewProps {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalProfessors: number;
    totalCourses: number;
    totalCategories: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalEnrollments: number;
    activeCourses: number;
    certificatesIssued: number;
    recentActivity: ActivityItem[];
  };
}

interface ActivityItem {
  id: string;
  type: 'enrollment' | 'payment' | 'course_created' | 'certificate_issued';
  description: string;
  timestamp: Date;
  user?: string;
  amount?: number;
}

export function PlatformOverview({ stats }: PlatformOverviewProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'course_created':
        return <BookOpen className="h-4 w-4 text-purple-600" />;
      case 'certificate_issued':
        return <CheckCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'enrollment':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'course_created':
        return 'bg-purple-100 text-purple-800';
      case 'certificate_issued':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return 'Just now';
  };

  // Calculate some derived metrics
  const averageRevenuePerCourse = stats.totalCourses > 0 ? stats.totalRevenue / stats.totalCourses : 0;
  const enrollmentRate = stats.totalStudents > 0 ? (stats.totalEnrollments / stats.totalStudents) * 100 : 0;
  const courseCompletionRate = stats.certificatesIssued > 0 && stats.totalEnrollments > 0 
    ? (stats.certificatesIssued / stats.totalEnrollments) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Metrics */}
      <div className="lg:col-span-2 space-y-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {enrollmentRate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Enrollment Rate</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Average enrollments per student
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(averageRevenuePerCourse)}
                </div>
                <p className="text-sm text-muted-foreground">Average Course Revenue</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Revenue per course
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {courseCompletionRate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Certificate issuance rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Platform Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Platform Services</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Payment System</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Video Service</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Database</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">High Usage</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats.recentActivity && stats.recentActivity.length > 0) ? (
                stats.recentActivity.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <p className="text-xs text-muted-foreground">
                          {activity.user}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                        >
                          {activity.type === 'enrollment' && 'Enrollment'}
                          {activity.type === 'payment' && 'Payment'}
                          {activity.type === 'course_created' && 'New Course'}
                          {activity.type === 'certificate_issued' && 'Certificate'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      {activity.amount && (
                        <p className="text-xs font-medium text-green-600 mt-1">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(activity.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-3 border rounded-lg hover:bg-muted transition-colors">
                <div className="font-medium">Add New Professor</div>
                <div className="text-sm text-muted-foreground">Create professor account</div>
              </button>
              
              <button className="w-full text-left p-3 border rounded-lg hover:bg-muted transition-colors">
                <div className="font-medium">Add Category</div>
                <div className="text-sm text-muted-foreground">New course category</div>
              </button>
              
              <button className="w-full text-left p-3 border rounded-lg hover:bg-muted transition-colors">
                <div className="font-medium">Revenue Report</div>
                <div className="text-sm text-muted-foreground">Export monthly report</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}