// src/components/course/course-card/CourseImage.tsx
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle } from 'lucide-react';
import { formatCoursePrice } from '@/lib/course-utils';
import { CourseWithMetadata } from '@/types/course';
import { memo } from 'react';

interface CourseImageProps {
  course: CourseWithMetadata;
  viewMode: 'grid' | 'list';
  isEnrolled: boolean;
  imageSizes: string;
}

// R.A.K.A.N: Wrapped the component in React.memo for performance optimization.
// It will only re-render if its props change.
export const CourseImage = memo(({ course, viewMode, isEnrolled, imageSizes }: CourseImageProps) => {
  // R.A.K.A.N: FIX - Safely cast Decimal to number for the formatting function.
  const priceString = formatCoursePrice(course.price ? Number(course.price) : null, course.currency);

  if (viewMode === 'list') {
    return (
      <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          className="object-cover"
          sizes={imageSizes}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-2 right-2">
          <Badge variant={course.price === null ? "secondary" : "default"} className="bg-white/90 text-gray-900 hover:bg-white font-semibold">
            {priceString}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video relative overflow-hidden">
      <Image
        src={course.thumbnailUrl}
        alt={course.title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-110"
        sizes={imageSizes}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
          <Play className="w-6 h-6 text-primary ml-1" />
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <Badge variant={course.price === null ? "secondary" : "default"} className="bg-white/90 text-gray-900 hover:bg-white font-semibold">
          {priceString}
        </Badge>
      </div>
      <div className="absolute top-4 left-4">
        <Badge variant="outline" className="bg-primary/90 text-black border-white/20">
          {course.category.name}
        </Badge>
      </div>
      {isEnrolled && (
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-green-500/90 text-black">
            <CheckCircle className="w-3 h-3 mr-1" />
            مسجل
          </Badge>
        </div>
      )}
    </div>
  );
});

CourseImage.displayName = 'CourseImage';