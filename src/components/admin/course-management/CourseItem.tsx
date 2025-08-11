// src/components/admin/course-management/CourseItem.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  formatPrice, 
  formatDateArabic, 
  getStatusBadgeVariant, 
  getStatusText, 
  getActionText 
} from '@/lib/course-management-utils';
import type { CourseData } from '@/hooks/useCourseManagement';

interface CourseItemProps {
  course: CourseData;
  onAction: (courseId: string, action: 'publish' | 'unpublish' | 'delete') => void;
}

export function CourseItem({ course, onAction }: CourseItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{course.title}</h3>
            <Badge variant={getStatusBadgeVariant(course.isPublished)}>
              {getStatusText(course.isPublished)}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {course.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course._count.enrollments} ملتحق
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {course._count.lessons} درس
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateArabic(course.createdAt)}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{course.category.name}</Badge>
            <span className="text-sm text-muted-foreground">
              بواسطة {course.professor.name}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold">
            {formatPrice(course.price, course.currency)}
          </div>
          {course.revenue && (
            <div className="text-sm text-muted-foreground">
              إيراد: {formatPrice(course.revenue)}
            </div>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="h-4 w-4 mr-2" />
            عرض التفاصيل
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="h-4 w-4 mr-2" />
            تعديل الدورة
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onAction(course.id, course.isPublished ? 'unpublish' : 'publish')}
          >
            {getActionText(course.isPublished)}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => onAction(course.id, 'delete')}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            حذف الدورة
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}