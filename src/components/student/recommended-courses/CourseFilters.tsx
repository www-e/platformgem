// src/components/student/recommended-courses/CourseFilters.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RecommendationFilters } from '@/hooks/useRecommendedCourses';

interface CourseFiltersProps {
  filters: RecommendationFilters;
  setFilters: (filters: RecommendationFilters) => void;
}

export function CourseFilters({ filters, setFilters }: CourseFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          تصفية النتائج
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select value={filters.category} onValueChange={(value: string) => setFilters({...filters, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              <SelectItem value="fitness">اللياقة البدنية</SelectItem>
              <SelectItem value="nutrition">التغذية</SelectItem>
              <SelectItem value="swimming">السباحة</SelectItem>
              <SelectItem value="diving">الغوص</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priceRange} onValueChange={(value: string) => setFilters({...filters, priceRange: value})}>
            <SelectTrigger>
              <SelectValue placeholder="السعر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأسعار</SelectItem>
              <SelectItem value="free">مجاني</SelectItem>
              <SelectItem value="under_100">أقل من 100 جنيه</SelectItem>
              <SelectItem value="100_500">100 - 500 جنيه</SelectItem>
              <SelectItem value="over_500">أكثر من 500 جنيه</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.level} onValueChange={(value: string) => setFilters({...filters, level: value})}>
            <SelectTrigger>
              <SelectValue placeholder="المستوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستويات</SelectItem>
              <SelectItem value="beginner">مبتدئ</SelectItem>
              <SelectItem value="intermediate">متوسط</SelectItem>
              <SelectItem value="advanced">متقدم</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.duration} onValueChange={(value: string) => setFilters({...filters, duration: value})}>
            <SelectTrigger>
              <SelectValue placeholder="المدة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدد</SelectItem>
              <SelectItem value="short">قصيرة (أقل من ساعتين)</SelectItem>
              <SelectItem value="medium">متوسطة (2-8 ساعات)</SelectItem>
              <SelectItem value="long">طويلة (أكثر من 8 ساعات)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.rating} onValueChange={(value: string) => setFilters({...filters, rating: value})}>
            <SelectTrigger>
              <SelectValue placeholder="التقييم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التقييمات</SelectItem>
              <SelectItem value="4.5">4.5 نجوم فأكثر</SelectItem>
              <SelectItem value="4.0">4.0 نجوم فأكثر</SelectItem>
              <SelectItem value="3.5">3.5 نجوم فأكثر</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}