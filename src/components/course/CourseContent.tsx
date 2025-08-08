// src/components/course/CourseContent.tsx - Modular Course Content
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CertificateGenerator } from "@/components/certificates/CertificateGenerator";
import { VideoPlayer } from "./course-content/VideoPlayer";
import { LessonDiscussions } from "./course-content/LessonDiscussions";
import { LessonMaterials } from "./course-content/LessonMaterials";
import { CourseProgressCard } from "./course-content/CourseProgressCard";
import {
  useCourseContent,
  type Lesson as HookLesson, // Rename imported type
  type Course,
} from "@/hooks/useCourseContent";
import { useOptimizedMotion } from "@/hooks/useAnimations";
import {
  FadeInScroll,
  StaggerChildren,
  StaggerItem,
} from "@/components/ui/micro-interactions";
import {
  BookOpen,
  CheckCircle,
  Bookmark,
  Share2,
  FileText,
  MessageSquare,
  Award,
  Clock,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JsonValue } from "@prisma/client/runtime/library";

// Extend the hook's Lesson type locally
interface Lesson extends HookLesson {
    materials?: JsonValue;
}

interface CourseContentProps {
  course: Course;
  lessons: Lesson[];
}

export function CourseContent({ course, lessons }: CourseContentProps) {
  const {
    selectedLesson,
    setSelectedLesson,
    lessonProgress,
    completedLessons,
    overallProgress,
    totalWatchedTime,
    totalDuration,
    completedCount,
    handleLessonComplete,
  } = useCourseContent(course, lessons);

  const { shouldReduceMotion } = useOptimizedMotion();
  const [activeTab, setActiveTab] = useState("lessons");

  const totalCount = lessons.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleVideoProgress = (progress: number) => {
    if (progress >= 90 && selectedLesson && !completedLessons.has(selectedLesson.id)) {
      handleLessonComplete();
    }
  };

  const handleVideoComplete = () => {
    if (selectedLesson && !completedLessons.has(selectedLesson.id)) {
      handleLessonComplete();
    }
  };

  const parsedMaterials = useMemo(() => {
    const materials = (selectedLesson as Lesson)?.materials;
    if (Array.isArray(materials)) {
      return materials.filter(
        (m): m is any => // Using 'any' for now, should be a defined Material type
          typeof m === 'object' && m !== null && 'title' in m && 'url' in m
      );
    }
    return [];
  }, [selectedLesson]);

  return (
    <div className="space-y-6">
      {/* Enhanced Progress Card */}
      <FadeInScroll>
        <Card className="overflow-hidden border-0 shadow-elevation-2">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-black">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold font-display leading-arabic-tight">
                  {course.title}
                </h2>
                <p className="text-black/80 font-primary">
                  {course.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold font-display">
                  {Math.round(overallProgress)}%
                </div>
                <p className="text-black/80 text-sm font-primary">مكتمل</p>
              </div>
            </div>

            <Progress value={overallProgress} className="mb-4 bg-white/20" />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold font-display">
                  {completedCount}
                </div>
                <p className="text-black/80 text-sm font-primary">
                  دروس مكتملة
                </p>
              </div>
              <div>
                <div className="text-xl font-bold font-display">
                  {lessons.length}
                </div>
                <p className="text-black/80 text-sm font-primary">
                  إجمالي الدروس
                </p>
              </div>
              <div>
                <div className="text-xl font-bold font-display">
                  {Math.round(totalWatchedTime / 60)}
                </div>
                <p className="text-black/80 text-sm font-primary">
                  دقيقة مشاهدة
                </p>
              </div>
            </div>
          </div>
        </Card>
      </FadeInScroll>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12 bg-neutral-100 p-1">
          <TabsTrigger
            value="lessons"
            className="flex items-center gap-2 font-primary"
          >
            <Play className="w-4 h-4" />
            الدروس
          </TabsTrigger>
          <TabsTrigger
            value="materials"
            className="flex items-center gap-2 font-primary"
          >
            <FileText className="w-4 h-4" />
            المواد
          </TabsTrigger>
          <TabsTrigger
            value="discussions"
            className="flex items-center gap-2 font-primary"
          >
            <MessageSquare className="w-4 h-4" />
            النقاشات
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="flex items-center gap-2 font-primary"
          >
            <BookOpen className="w-4 h-4" />
            الملاحظات
          </TabsTrigger>
          <TabsTrigger
            value="certificate"
            className="flex items-center gap-2 font-primary"
          >
            <Award className="w-4 h-4" />
            الشهادة
          </TabsTrigger>
        </TabsList>

        {/* Lessons Tab with Enhanced Video Player */}
        <TabsContent value="lessons" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course Progress */}
              <CourseProgressCard
                completedLessons={completedCount}
                totalLessons={totalCount}
                totalWatchTime={Math.round(totalWatchedTime / 60)}
                estimatedTime={Math.round(totalDuration / 60)}
                currentStreak={7}
                xpEarned={850}
              />
              
              {/* Lesson Navigation */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                    قائمة الدروس
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <StaggerChildren className="space-y-1">
                    {lessons.map((lesson, index) => (
                      <StaggerItem key={lesson.id}>
                        <motion.button
                          className={cn(
                            "w-full text-right p-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0",
                            selectedLesson?.id === lesson.id &&
                              "bg-primary-50 border-primary-200"
                          )}
                          onClick={() => setSelectedLesson(lesson)}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.1 }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                                completedLessons.has(lesson.id)
                                  ? "bg-success text-black"
                                  : selectedLesson?.id === lesson.id
                                  ? "bg-primary-500 text-black"
                                  : "bg-neutral-200 text-neutral-600"
                              )}
                            >
                              {completedLessons.has(lesson.id) ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm leading-arabic-tight truncate font-primary">
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                                <Clock className="w-3 h-3" />
                                <span className="font-primary">
                                  {Math.round((lesson.duration || 0) / 60)} دقيقة
                                </span>
                                {lessonProgress[lesson.id] && (
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.round(lessonProgress[lesson.id])}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      </StaggerItem>
                    ))}
                  </StaggerChildren>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {selectedLesson ? (
                <div className="space-y-4">
                  <VideoPlayer
                    videoUrl={`https://video.bunnycdn.com/play/${selectedLesson.bunnyVideoId}`}
                    title={selectedLesson.title}
                    onProgress={handleVideoProgress}
                    onComplete={handleVideoComplete}
                    className="aspect-video"
                  />
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold font-display leading-arabic-tight">
                            {selectedLesson.title}
                          </h2>
                          <p className="text-neutral-600 font-primary mt-1">
                            الدرس رقم {selectedLesson.order} - مدة الدرس: {Math.round((selectedLesson.duration || 0) / 60)} دقيقة
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Bookmark className="w-4 h-4 ml-2" />
                            حفظ
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 ml-2" />
                            مشاركة
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Lesson Discussions */}
                  <LessonDiscussions 
                    lessonId={selectedLesson.id}
                  />
                </div>
              ) : (
                <Card className="aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 font-display">
                      اختر درساً لبدء المشاهدة
                    </h3>
                    <p className="text-neutral-600 font-primary">
                      اختر درساً من القائمة الجانبية لبدء التعلم
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-6">
          <LessonMaterials 
            materials={parsedMaterials}
          />
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-6">
          <LessonDiscussions 
            lessonId={selectedLesson?.id || ''}
          />
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <BookOpen className="w-5 h-5 text-primary-600" />
                ملاحظاتي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-neutral-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد ملاحظات حتى الآن</p>
                <p className="text-sm">ابدأ بإضافة ملاحظاتك أثناء مشاهدة الدروس</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificate Tab */}
        <TabsContent value="certificate" className="space-y-6">
          {completionRate >= 100 ? (
            <CertificateGenerator
              courseId={course.id}
              courseName={course.title}
              completionRate={completionRate}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 font-display mb-2">
                  الشهادة غير متاحة بعد
                </h3>
                <p className="text-neutral-600 font-primary mb-4">
                  أكمل جميع دروس الدورة للحصول على الشهادة
                </p>
                <div className="max-w-md mx-auto">
                  <Progress value={completionRate} className="mb-2" />
                  <p className="text-sm text-neutral-500">
                    {completedCount} من {totalCount} دروس مكتملة ({Math.round(completionRate)}%)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}