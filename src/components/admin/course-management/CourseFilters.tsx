// src/components/admin/course-management/CourseFilters.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { SelectFilter } from "@/components/shared/SelectFilter";

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
  onProfessorChange,
}: CourseFiltersProps) {
  const categoryOptions = [
    { value: "all", label: "جميع التصنيفات" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const statusOptions = [
    { value: "all", label: "جميع الحالات" },
    { value: "published", label: "منشورة" },
    { value: "draft", label: "مسودة" },
  ];

  const professorOptions = [
    { value: "all", label: "جميع المدرسين" },
    ...professors.map((professor) => ({
      value: professor.id,
      label: professor.name,
    })),
  ];

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
          <SearchFilter
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="البحث بعنوان الدورة أو المدرس..."
            className="flex-1"
          />

          <SelectFilter
            value={categoryFilter}
            onChange={onCategoryChange}
            options={categoryOptions}
            placeholder="تصفية بالتصنيف"
          />

          <SelectFilter
            value={statusFilter}
            onChange={onStatusChange}
            options={statusOptions}
            placeholder="تصفية بالحالة"
          />

          <SelectFilter
            value={professorFilter}
            onChange={onProfessorChange}
            options={professorOptions}
            placeholder="تصفية بالمدرس"
          />
        </div>
      </CardContent>
    </Card>
  );
}
