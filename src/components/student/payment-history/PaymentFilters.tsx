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
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Periods' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last 3 Months' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search and Filter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by course or transaction number..."
            className="flex-1"
          />
          
          <SelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Filter by Status"
          />

          <SelectFilter
            value={dateFilter}
            onChange={setDateFilter}
            options={dateOptions}
            placeholder="Filter by Date"
          />

          <ActionButton
            text="Export"
            onClick={onExport}
            variant="outline"
            icon={Download}
          />
        </div>
      </CardContent>
    </Card>
  );
}