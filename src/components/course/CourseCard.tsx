// src/components/course/CourseCard.tsx
'use client';

import { UserRole } from '@prisma/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CourseWithMetadata } from '@/types/course';
import { useCourseCard } from '@/hooks/useCourseCard';
import { getImageSizes, getCardClassName } from '@/lib/course-card-utils';
import { CourseImage } from './course-card/CourseImage';
import { CourseInfo } from './course-card/CourseInfo';
import { CourseStats } from './course-card/CourseStats';
import { ActionButton } from './course-card/ActionButton';

interface CourseCardProps {
  course: CourseWithMetadata;
  userRole?: UserRole;
  userId?: string;
  viewMode?: 'grid' | 'list';
}

export default function CourseCard({ course, userRole, userId, viewMode = 'grid' }: CourseCardProps) {
  const { isLoading, userActions, handleEnroll } = useCourseCard(course, userRole, userId);
  const imageSizes = getImageSizes(viewMode);
  const cardClassName = getCardClassName(viewMode);

  if (viewMode === 'list') {
    return (
      <Card className={cardClassName}>
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Course Image */}
            <CourseImage 
              course={course} 
              viewMode={viewMode} 
              isEnrolled={userActions.isEnrolled}
              imageSizes={imageSizes}
            />

            {/* Course Info */}
            <CourseInfo 
              course={course} 
              viewMode={viewMode} 
              isEnrolled={userActions.isEnrolled}
            />

            {/* Course Stats */}
            <CourseStats course={course} viewMode={viewMode} />

            {/* Action Button */}
            <div className="w-48 flex-shrink-0 flex items-end">
              <ActionButton 
                course={course}
                userRole={userRole}
                userActions={userActions}
                isLoading={isLoading}
                onEnroll={handleEnroll}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className={cardClassName}>
      <div className="relative">
        <CourseImage 
          course={course} 
          viewMode={viewMode} 
          isEnrolled={userActions.isEnrolled}
          imageSizes={imageSizes}
        />

        <CardHeader>
          <CourseInfo 
            course={course} 
            viewMode={viewMode} 
            isEnrolled={userActions.isEnrolled}
          />
        </CardHeader>

        <CardContent>
          <CourseStats course={course} viewMode={viewMode} />
          
          <ActionButton 
            course={course}
            userRole={userRole}
            userActions={userActions}
            isLoading={isLoading}
            onEnroll={handleEnroll}
          />
        </CardContent>
      </div>
    </Card>
  );
}