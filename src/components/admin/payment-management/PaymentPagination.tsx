// src/components/admin/payment-management/PaymentPagination.tsx

import { Button } from '@/components/ui/button';
import { UseAdminPaymentsReturn } from '@/hooks/useAdminPayments';

type PaymentPaginationProps = {
  pagination: UseAdminPaymentsReturn['pagination'];
};

/**
 * Renders the pagination controls for the payments list.
 * Only visible if there is more than one page.
 */
export function PaymentPagination({ pagination }: PaymentPaginationProps) {
  const { currentPage, totalPages, setCurrentPage } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        السابق
      </Button>

      <span className="text-sm text-muted-foreground">
        صفحة {currentPage} من {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        التالي
      </Button>
    </div>
  );
}