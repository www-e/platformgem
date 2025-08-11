// src/components/professor/StudentEnrollmentStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  Award,
  Eye,
  MessageCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentEnrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
  lastActivity: Date;
  totalWatchTime: number; // in minutes
  completedLessons: number;
  totalLessons: number;
  status: 'active' | 'completed' | 'inactive';
}

interface EnrollmentStats {
  totalEnrollments: number;
  activeStudents: number;
  completedStudents: number;
  averageProgress: number;
  averageWatchTime: number;
  topPerformers: StudentEnrollment[];
  recentEnrollments: StudentEnrollment[];
  courseBreakdown: Array<{
    courseId: string;
    courseName: string;
    enrollments: number;
    averageProgress: number;
  }>;
}

export function StudentEnrollmentStats() {
  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchEnrollmentStats();
  }, []);

  const fetchEnrollmentStats = async () => {
    try {
      const response = await fetch('/api/professor/enrollment-stats');
      const data = await response.json();
      setStats(data.stats);
      setEnrollments(data.enrollments);
    } catch (error) {
      console.error('Failed to fetch enrollment stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === 'all' || enrollment.courseId === courseFilter;
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStatusBadge = (status: string, progress: number) => {
    if (status === 'completed' || progress >= 100) {
      return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
    } else if (status === 'active' && progress > 0) {
      return <Badge className="bg-blue-100 text-blue-800">نشط</Badge>;
    } else {
      return <Badge variant="secondary">غير نشط</Badge>;
    }
  };

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}س ${mins}د`;
    }
    return `${mins}د`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">فشل في تحميل إحصائيات الملتحقين</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">إحصائيات الملتحقين</h2>
        <p className="text-muted-foreground">
          تتبع أداء وتقدم ملتحقينك في دوراتك
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeStudents} نشط • {stats.completedStudents} مكتمل
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقدم</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress.toFixed(1)}%</div>
            <div className="w-full bg-muted rounded-full h-1 mt-2">
              <div 
                className="bg-primary h-1 rounded-full" 
                style={{ width: `${stats.averageProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت المشاهدة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWatchTime(stats.averageWatchTime)}</div>
            <p className="text-xs text-muted-foreground">
              لكل ملتحق
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEnrollments > 0 
                ? ((stats.completedStudents / stats.totalEnrollments) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              من إجمالي التسجيلات
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              أفضل الملتحقين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topPerformers.map((student, index) => (
                <div key={student.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.studentName}</p>
                    <p className="text-sm text-muted-foreground">{student.courseName}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      {student.progress}%
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.topPerformers.length === 0 && (
                <div className="text-center py-4">
                  <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">لا توجد بيانات بعد</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Course Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>توزيع الملتحقين حسب الدورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.courseBreakdown.map((course) => (
                <div key={course.courseId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{course.courseName}</span>
                    <span className="text-sm text-muted-foreground">
                      {course.enrollments} ملتحق
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${course.averageProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>متوسط التقدم: {course.averageProgress.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
              {stats.courseBreakdown.length === 0 && (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">لا توجد دورات بعد</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث بالاسم أو الدورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية بالدورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الدورات</SelectItem>
                {stats.courseBreakdown.map((course) => (
                  <SelectItem key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الملتحقين ({filteredEnrollments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{enrollment.studentName}</h3>
                      {getStatusBadge(enrollment.status, enrollment.progress)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{enrollment.courseName}</span>
                      <span>•</span>
                      <span>انضم في {new Date(enrollment.enrolledAt).toLocaleDateString('ar-SA')}</span>
                      <span>•</span>
                      <span>آخر نشاط: {new Date(enrollment.lastActivity).toLocaleDateString('ar-SA')}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{enrollment.completedLessons} من {enrollment.totalLessons} درس</span>
                      <span>•</span>
                      <span>وقت المشاهدة: {formatWatchTime(enrollment.totalWatchTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold mb-1">{enrollment.progress}%</div>
                  <div className="w-24 bg-muted rounded-full h-2 mb-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      عرض
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      رسالة
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEnrollments.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد نتائج مطابقة للبحث</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}