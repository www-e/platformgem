// src/components/course/course-card/CourseInfo.tsx
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle } from 'lucide-react';
import { CourseWithMetadata } from '@/types/course';

interface CourseInfoProps {
  course: CourseWithMetadata;
  viewMode: 'grid' | 'list';
  isEnrolled: boolean;
}

export function CourseInfo({ course, viewMode, isEnrolled }: CourseInfoProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex-1 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {course.category.name}
            </Badge>
            {isEnrolled && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                مسجل
              </Badge>
            )}
          </div>
          
          <h3 className="font-bold text-xl leading-tight line-clamp-2 hover:text-primary transition-colors">
            {course.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mt-2">
            {course.description}
          </p>
        </div>

        {/* Professor Info */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Award className="w-3 h-3 text-primary" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {course.professor.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-3">
        <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
          {course.description}
        </p>
      </div>

      <div className="pt-0">
        {/* Professor Info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Award className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {course.professor.name}
          </span>
        </div>
      </div>
    </>
  );
}