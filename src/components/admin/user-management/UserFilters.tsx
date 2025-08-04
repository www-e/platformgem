// src/components/admin/user-management/UserFilters.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { SelectFilter } from "@/components/shared/SelectFilter";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export function UserFilters({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter
}: UserFiltersProps) {
  const roleOptions = [
    { value: 'all', label: 'جميع الأدوار' },
    { value: 'STUDENT', label: 'طلاب' },
    { value: 'PROFESSOR', label: 'مدرسين' },
    { value: 'ADMIN', label: 'مديرين' }
  ];

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' }
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
            onChange={setSearchTerm}
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            className="flex-1"
          />

          <SelectFilter
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleOptions}
            placeholder="تصفية بالدور"
          />

          <SelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="تصفية بالحالة"
          />
        </div>
      </CardContent>
    </Card>
  );
}