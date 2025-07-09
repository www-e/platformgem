import Link from "next/link";
import { BookCheck, Lock, PlayCircle } from "lucide-react";
import { Course, Lesson } from "@prisma/client";

interface LectureSidebarProps {
  course: Course & { lessons: Lesson[] }; // The course with all its lessons
  currentLessonId?: string; // The ID of the lesson currently being viewed
  completedLessons: string[]; // An array of completed lesson IDs from the Enrollment model
}

export function LectureSidebar({ course, currentLessonId, completedLessons }: LectureSidebarProps) {
  return (
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">{course.title}</h2>
        <p className="text-sm text-gray-400">
          {completedLessons.length} / {course.lessons.length} lessons completed
        </p>
        <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
           <div 
             className="bg-blue-500 h-2.5 rounded-full" 
             style={{ width: `${(completedLessons.length / course.lessons.length) * 100}%` }}
           ></div>
        </div>
      </div>
      
      <div className="space-y-2">
        {course.lessons.sort((a,b) => a.order - b.order).map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          
          // For now, all lessons are unlocked. We can add locking logic later.
          const isLocked = false; 

          return (
            <Link 
              key={lesson.id} 
              href={isLocked ? '#' : `/courses/${course.id}?lesson=${lesson.id}`}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors w-full text-left
                ${isLocked ? 'cursor-not-allowed bg-slate-800/50' : ''}
                ${isCurrent ? 'bg-blue-600/50 border-l-4 border-blue-400' : 'hover:bg-slate-700/50'}
              `}
            >
              <div className="flex-shrink-0">
                {isLocked ? <Lock className="w-5 h-5 text-gray-500" /> :
                 isCompleted ? <BookCheck className="w-5 h-5 text-green-400" /> :
                 <PlayCircle className="w-5 h-5 text-gray-400" />
                }
              </div>

              <div className="flex-grow">
                <p className={`font-medium ${isCurrent ? 'text-white' : 'text-gray-200'}`}>
                  {lesson.title}
                </p>
                <p className="text-xs text-gray-400">Lesson {index + 1}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}