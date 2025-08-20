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
          Filter Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select value={filters.category} onValueChange={(value: string) => setFilters({...filters, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="fitness">Fitness</SelectItem>
              <SelectItem value="nutrition">Nutrition</SelectItem>
              <SelectItem value="swimming">Swimming</SelectItem>
              <SelectItem value="diving">Diving</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priceRange} onValueChange={(value: string) => setFilters({...filters, priceRange: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="under_100">Under $100</SelectItem>
              <SelectItem value="100_500">$100 - $500</SelectItem>
              <SelectItem value="over_500">Over $500</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.level} onValueChange={(value: string) => setFilters({...filters, level: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.duration} onValueChange={(value: string) => setFilters({...filters, duration: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Durations</SelectItem>
              <SelectItem value="short">Short (Under 2 hours)</SelectItem>
              <SelectItem value="medium">Medium (2-8 hours)</SelectItem>
              <SelectItem value="long">Long (Over 8 hours)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.rating} onValueChange={(value: string) => setFilters({...filters, rating: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4.5">4.5 stars or more</SelectItem>
              <SelectItem value="4.0">4.0 stars or more</SelectItem>
              <SelectItem value="3.5">3.5 stars or more</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}