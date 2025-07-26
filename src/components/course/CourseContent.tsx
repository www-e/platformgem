// src/components/course/CourseContent.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Lock,
  BookOpen,
  FileText,
  Download,
  Eye
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  order: number;
  duration: number | null;
  bunnyVideoId: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  _count: {
    lessons: number;
    enrollments: number;
  };
}

interface CourseContentProps {
  course: Course;
  lessons: Lesson[];
}

export function CourseContent({ course, lessons }: CourseContentProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    lessons.length > 0 ? lessons[0] : null
  );

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'غير محدد';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  const totalDuration = lessons.reduce((total, lesson) => {
    return total + (lesson.duration || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Course Progress (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            تقدمك في الدورة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>التقدم الإجمالي</span>
              <span>0 من {lessons.length} دروس</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>وقت المشاهدة: 0 دقيقة</span>
              <span>المدة الإجمالية: {Math.floor(totalDuration / 60)} دقيقة</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Content Tabs */}
      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lessons">الدروس</TabsTrigger>
          <TabsTrigger value="materials">المواد</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lesson List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">قائمة الدروس</CardTitle>
                  <CardDescription>
                    {lessons.length} درس • {Math.floor(totalDuration / 60)} دقيقة
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {lessons.map((lesson, index) => (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`w-full text-right p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                          selectedLesson?.id === lesson.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">{lesson.order}</span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(lesson.duration)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0">
                            <Play className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Video Player */}
            <div className="lg:col-span-2">
              {selectedLesson ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      {selectedLesson.title}
                    </CardTitle>
                    <CardDescription>
                      الدرس {selectedLesson.order} • {formatDuration(selectedLesson.duration)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Video Player Placeholder */}
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center text-white">
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">مشغل الفيديو</p>
                        <p className="text-sm opacity-75">Bunny Video ID: {selectedLesson.bunnyVideoId}</p>
                      </div>
                    </div>

                    {/* Lesson Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="w-4 h-4" />
                          تم الإكمال
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                          تحميل المواد
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          سرعة التشغيل: 1x
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">اختر درساً للبدء</h3>
                    <p className="text-muted-foreground">
                      اختر درساً من القائمة لبدء المشاهدة
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                مواد الدورة
              </CardTitle>
              <CardDescription>
                الملفات والمواد المساعدة للدورة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مواد متاحة</h3>
                <p className="text-muted-foreground">
                  لم يتم رفع أي مواد إضافية لهذه الدورة حتى الآن
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                نظرة عامة على الدورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">وصف الدورة</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">محتويات الدورة</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">الدروس</span>
                    </div>
                    <p className="text-2xl font-bold">{lessons.length}</p>
                    <p className="text-sm text-muted-foreground">درس تعليمي</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span className="font-medium">المدة الإجمالية</span>
                    </div>
                    <p className="text-2xl font-bold">{Math.floor(totalDuration / 60)}</p>
                    <p className="text-sm text-muted-foreground">دقيقة</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">ما ستتعلمه</h4>
                <ul className="space-y-2">
                  {lessons.slice(0, 5).map((lesson) => (
                    <li key={lesson.id} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{lesson.title}</span>
                    </li>
                  ))}
                  {lessons.length > 5 && (
                    <li className="text-sm text-muted-foreground">
                      و {lessons.length - 5} دروس أخرى...
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}