// src/components/course/course-content/LessonsList.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, Play, PlayCircle } from "lucide-react";
import { formatDuration } from "@/lib/course-content-utils";
import type { Lesson } from "@/hooks/useCourseContent";

interface LessonsListProps {
  lessons: Lesson[];
  selectedLesson: Lesson | null;
  completedLessons: Set<string>;
  lessonProgress: Record<string, number>;
  totalDuration: number;
  onLessonSelect: (lesson: Lesson) => void;
}

export function LessonsList({
  lessons,
  selectedLesson,
  completedLessons,
  lessonProgress,
  totalDuration,
  onLessonSelect
}: LessonsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">قائمة الدروس</CardTitle>
        <CardDescription>
          {lessons.length} درس • {Math.floor(totalDuration / 60)} دقيقة
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => onLessonSelect(lesson)}
              className={`w-full text-right p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                selectedLesson?.id === lesson.id ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    completedLessons.has(lesson.id) 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-primary/10'
                  }`}>
                    {completedLessons.has(lesson.id) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{lesson.order}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(lesson.duration)}
                    </span>
                    {lessonProgress[lesson.id] && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-green-600">
                          {Math.floor(lessonProgress[lesson.id] / 60)} دقيقة
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {selectedLesson?.id === lesson.id ? (
                    <PlayCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <Play className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}