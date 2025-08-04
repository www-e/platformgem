// src/components/course/CourseContent.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateGenerator } from "@/components/certificates/CertificateGenerator";
import { useCourseContent, type Lesson, type Course } from "@/hooks/useCourseContent";
import { CourseProgressCard } from "./course-content/CourseProgressCard";
import { LessonsList } from "./course-content/LessonsList";
import { VideoPlayerSection } from "./course-content/VideoPlayerSection";
import { MaterialsTab } from "./course-content/MaterialsTab";
import { OverviewTab } from "./course-content/OverviewTab";

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
    viewingHistory,
    overallProgress,
    totalWatchedTime,
    totalDuration,
    completedCount,
    handleLessonComplete,
    handleProgressUpdate
  } = useCourseContent(course, lessons);

  return (
    <div className="space-y-6">
      {/* Course Progress */}
      <CourseProgressCard
        overallProgress={overallProgress}
        completedCount={completedCount}
        totalLessons={lessons.length}
        totalWatchedTime={totalWatchedTime}
        totalDuration={totalDuration}
      />

      {/* Course Content Tabs */}
      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lessons">الدروس</TabsTrigger>
          <TabsTrigger value="materials">المواد</TabsTrigger>
          <TabsTrigger value="certificate">الشهادة</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lesson List */}
            <div className="lg:col-span-1">
              <LessonsList
                lessons={lessons}
                selectedLesson={selectedLesson}
                completedLessons={completedLessons}
                lessonProgress={lessonProgress}
                totalDuration={totalDuration}
                onLessonSelect={setSelectedLesson}
              />
            </div>

            {/* Video Player */}
            <div className="lg:col-span-2">
              <VideoPlayerSection
                selectedLesson={selectedLesson}
                course={course}
                completedLessons={completedLessons}
                viewingHistory={viewingHistory}
                onProgressUpdate={handleProgressUpdate}
                onLessonComplete={handleLessonComplete}
              />
            </div>
          </div>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          <MaterialsTab />
        </TabsContent>

        {/* Certificate Tab */}
        <TabsContent value="certificate" className="space-y-4">
          <CertificateGenerator
            courseId={course.id}
            courseName={course.title}
            completionRate={overallProgress}
          />
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab
            course={course}
            lessons={lessons}
            totalDuration={totalDuration}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}