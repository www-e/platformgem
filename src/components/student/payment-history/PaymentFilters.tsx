// src/components/student/payment-history/PaymentFilters.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Filter } from 'lucide-react';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { SelectFilter } from '@/components/shared/SelectFilter';
import { ActionButton } from '@/components/shared/ActionButton';

interface PaymentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  onExport: () => void;
}

export function PaymentFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  onExport
}: PaymentFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'pending', label: 'معلق' },
    { value: 'failed', label: 'فاشل' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'refunded', label: 'مسترد' }
  ];

  const dateOptions = [
    { value: 'all', label: 'جميع الفترات' },
    { value: 'week', label: 'آخر أسبوع' },
    { value: 'month', label: 'آخر شهر' },
    { value: 'quarter', label: 'آخر 3 أشهر' }
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
            placeholder="البحث بالدورة أو رقم المعاملة..."
            className="flex-1"
          />
          
          <SelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="تصفية بالحالة"
          />

          <SelectFilter
            value={dateFilter}
            onChange={setDateFilter}
            options={dateOptions}
            placeholder="تصفية بالتاريخ"
          />

          <ActionButton
            text="تصدير"
            onClick={onExport}
            variant="outline"
            icon={Download}
          />
        </div>
      </CardContent>
    </Card>
  );
}