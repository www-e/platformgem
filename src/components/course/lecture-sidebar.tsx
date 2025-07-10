// src/components/course/lecture-sidebar.tsx

import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { Course, Lesson } from "@prisma/client";
import { cn } from "@/lib/utils";

interface LectureSidebarProps {
  course: Course & { lessons: Lesson[] };
  currentLessonId?: string;
  completedLessons: string[];
}

export function LectureSidebar({ course, currentLessonId, completedLessons }: LectureSidebarProps) {
  const progress = (completedLessons.length / course.lessons.length) * 100;

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-card rounded-xl border border-border p-4">
      <div className="mb-4 p-2">
        <h2 className="text-xl font-bold text-foreground mb-2">{course.title}</h2>
        <p className="text-sm text-muted-foreground mb-2">
          {completedLessons.length} / {course.lessons.length} درسًا مكتملًا
        </p>
        <div className="w-full bg-muted rounded-full h-2.5">
           <div 
             className="bg-primary h-2.5 rounded-full transition-all duration-500" 
             style={{ width: `${progress}%` }}
           ></div>
        </div>
      </div>
      
      <div className="space-y-2">
        {course.lessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          const isLocked = false; // Locking logic can be added here later

          return (
            <Link 
              key={lesson.id} 
              href={isLocked ? '#' : `/courses/${course.id}?lesson=${lesson.id}`}
              className={cn(`flex items-center gap-4 p-3 rounded-lg transition-colors w-full text-right`,
                isLocked && 'cursor-not-allowed bg-muted/50 text-muted-foreground',
                isCurrent && 'bg-primary/20 border-r-4 border-primary',
                !isCurrent && !isLocked && 'hover:bg-accent/50'
              )}
            >
              <div className="flex-shrink-0">
                {isLocked ? <Lock className="w-5 h-5" /> :
                 isCompleted ? <CheckCircle2 className="w-5 h-5 text-secondary" /> :
                 <PlayCircle className="w-5 h-5 text-muted-foreground" />
                }
              </div>

              <div className="flex-grow">
                <p className={cn(
                  `font-medium`,
                  isCurrent ? 'text-primary' : 'text-foreground'
                )}>
                  {lesson.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}