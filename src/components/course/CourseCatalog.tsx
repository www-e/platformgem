// src/components/course/CourseCatalog.tsx
'use client';

import { UserRole } from '@prisma/client';
import { useCourseCatalog } from '@/hooks/useCourseCatalog';
import { CatalogFilters } from './course-catalog/CatalogFilters';
import { CatalogHeader } from './course-catalog/CatalogHeader';
import { CoursesGrid } from './course-catalog/CoursesGrid';
import { CatalogPagination } from './course-catalog/CatalogPagination';
import { EmptyState } from './course-catalog/EmptyState';
import { ErrorState } from './course-catalog/ErrorState';
import { LoadingState } from './course-catalog/LoadingState';

interface CourseCatalogProps {
  initialFilters: {
    page: number;
    category?: string;
    search?: string;
    priceRange?: string;
    level?: string;
    sort: string;
    limit: number;
  };
  userRole?: UserRole;
  userId?: string;
}

export default function CourseCatalog({ initialFilters, userRole, userId }: CourseCatalogProps) {
  const {
    courses,
    isLoading,
    error,
    totalCount,
    totalPages,
    currentPage,
    viewMode,
    setViewMode,
    searchTerm,
    categoryFilter,
    priceRangeFilter,
    levelFilter,
    sortFilter,
    categories,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    clearFilters,
    fetchCourses
  } = useCourseCatalog(initialFilters);

  // Render loading state
  if (isLoading && courses.length === 0) {
    return <LoadingState />;
  }

  // Render error state
  if (error) {
    return <ErrorState error={error} onRetry={fetchCourses} />;
  }

  return (
    <div className="space-y-6">
      <CatalogFilters
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        priceRangeFilter={priceRangeFilter}
        levelFilter={levelFilter}
        sortFilter={sortFilter}
        categories={categories}
        viewMode={viewMode}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onViewModeChange={setViewMode}
      />

      <CatalogHeader
        coursesCount={courses.length}
        totalCount={totalCount}
        isLoading={isLoading}
      />

      {courses.length > 0 ? (
        <CoursesGrid
          courses={courses}
          viewMode={viewMode}
          userRole={userRole}
          userId={userId}
        />
      ) : (
        <EmptyState onClearFilters={clearFilters} />
      )}

      <CatalogPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}