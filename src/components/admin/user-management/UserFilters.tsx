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
    { value: 'all', label: 'All Roles' },
    { value: 'STUDENT', label: 'Students' },
    { value: 'PROFESSOR', label: 'Professors' },
    { value: 'ADMIN', label: 'Admins' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or email..."
            className="flex-1"
          />

          <SelectFilter
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleOptions}
            placeholder="Filter by role"
          />

          <SelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Filter by status"
          />
        </div>
      </CardContent>
    </Card>
  );
}