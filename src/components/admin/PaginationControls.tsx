// src/components/admin/PaginationControls.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-end gap-4">
      <span className="text-sm text-muted-foreground">
        صفحة {currentPage} من {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          التالي
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}