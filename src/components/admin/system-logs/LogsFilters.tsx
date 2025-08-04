// src/components/admin/system-logs/LogsFilters.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';

interface LogsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  severityFilter: string;
  setSeverityFilter: (severity: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  onClearFilters: () => void;
}

export function LogsFilters({
  searchTerm,
  setSearchTerm,
  severityFilter,
  setSeverityFilter,
  dateFilter,
  setDateFilter,
  onClearFilters
}: LogsFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          البحث والتصفية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في السجلات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية بالخطورة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستويات</SelectItem>
              <SelectItem value="success">نجح</SelectItem>
              <SelectItem value="info">معلومات</SelectItem>
              <SelectItem value="warning">تحذير</SelectItem>
              <SelectItem value="error">خطأ</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية بالتاريخ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="yesterday">أمس</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="all">جميع التواريخ</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onClearFilters} variant="outline">
            مسح الفلاتر
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}