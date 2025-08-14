// src/components/course/course-content/VideoPlayerSection.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BunnyVideoPlayer } from "@/components/video/BunnyVideoPlayer";
import { Play, CheckCircle, Download, BookOpen } from "lucide-react";
import { formatDuration, calculateProgressPercentage } from "@/lib/course-content-utils";
import type { Lesson, Course } from "@/hooks/useCourseContent";

interface VideoPlayerSectionProps {
  selectedLesson: Lesson | null;
  course: Course;
  completedLessons: Set<string>;
  viewingHistory: Record<string, unknown>;
  onProgressUpdate: (progress: {
    watchedDuration: number;
    totalDuration: number;
    lastPosition: number;
    completed: boolean;
  }) => void;
  onLessonComplete: () => void;
}

export function VideoPlayerSection({
  selectedLesson,
  course,
  completedLessons,
  viewingHistory,
  onProgressUpdate,
  onLessonComplete
}: VideoPlayerSectionProps) {
  if (!selectedLesson) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">اختر درساً للبدء</h3>
          <p className="text-muted-foreground">
            اختر درساً من القائمة لبدء المشاهدة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
      <CardContent className="p-0">
        {/* Bunny Video Player */}
        <BunnyVideoPlayer
          lessonId={selectedLesson.id}
          bunnyVideoId={selectedLesson.bunnyVideoId}
          bunnyLibraryId={course.bunnyLibraryId}
          title={selectedLesson.title}
          onProgressUpdate={onProgressUpdate}
          onLessonComplete={onLessonComplete}
          initialPosition={viewingHistory?.lastPosition || 0}
        />

        {/* Lesson Controls */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant={completedLessons.has(selectedLesson.id) ? "primary" : "outline"}
                disabled={completedLessons.has(selectedLesson.id)}
              >
                <CheckCircle className="w-4 h-4" />
                {completedLessons.has(selectedLesson.id) ? 'مكتمل' : 'تم الإكمال'}
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4" />
                تحميل المواد
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {viewingHistory && (
                <span>
                  التقدم: {calculateProgressPercentage(
                    viewingHistory.lastPosition, 
                    viewingHistory.totalDuration
                  )}%
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}