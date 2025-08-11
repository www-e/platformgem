// src/components/admin/payment-management/PaymentFilters.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, RefreshCw, Download, Search } from 'lucide-react';
import { UseAdminPaymentsReturn } from '@/hooks/useAdminPayments';

// Use Pick to select only the 'filters' and specific methods needed from the hook return type
type PaymentFiltersProps = {
  filters: UseAdminPaymentsReturn['filters'];
  onRefresh: () => void;
  onExport: () => void;
};

/**
 * A component that renders the search and filter controls for the payments dashboard.
 */
export function PaymentFilters({
  filters,
  onRefresh,
  onExport,
}: PaymentFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          البحث والتصفية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالملتحق، الدورة، أو رقم المعاملة..."
                value={filters.searchTerm}
                onChange={(e) => filters.setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.statusFilter}
            onValueChange={filters.setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="تصفية بالحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="failed">فاشل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => filters.setDateFrom(e.target.value)}
            aria-label="From Date"
          />

          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => filters.setDateTo(e.target.value)}
            aria-label="To Date"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button onClick={onExport} variant="primary">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}