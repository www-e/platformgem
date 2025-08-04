// src/components/course/course-catalog/CatalogHeader.tsx

interface CatalogHeaderProps {
  coursesCount: number;
  totalCount: number;
  isLoading: boolean;
}

export function CatalogHeader({ coursesCount, totalCount, isLoading }: CatalogHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        عرض {coursesCount} من أصل {totalCount} دورة
      </div>
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          جاري التحميل...
        </div>
      )}
    </div>
  );
}