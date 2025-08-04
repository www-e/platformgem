// src/components/admin/course-management/CourseFilters.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Professor {
  id: string;
  name: string;
}

interface CourseFiltersProps {
  searchTerm: string;
  categoryFilter: string;
  statusFilter: string;
  professorFilter: string;
  categories: Category[];
  professors: Professor[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onProfessorChange: (value: string) => void;
}

export function CourseFilters({
  searchTerm,
  categoryFilter,
  statusFilter,
  professorFilter,
  categories,
  professors,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onProfessorChange
}: CourseFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          البحث والتصفية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بعنوان الدورة أو المدرس..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="تصفية بالتصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التصنيفات</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="تصفية بالحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="published">منشورة</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
            </SelectContent>
          </Select>

          <Select value={professorFilter} onValueChange={onProfessorChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="تصفية بالمدرس" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدرسين</SelectItem>
              {professors.map((professor) => (
                <SelectItem key={professor.id} value={professor.id}>
                  {professor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}