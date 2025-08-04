// src/components/admin/CourseManagement.tsx
'use client';

import { useCourseManagement } from '@/hooks/useCourseManagement';
import { ManagementHeader } from './course-management/ManagementHeader';
import { CourseStatsCards } from './course-management/CourseStatsCards';
import { CourseFilters } from './course-management/CourseFilters';
import { CoursesList } from './course-management/CoursesList';
import { LoadingState } from './course-management/LoadingState';

export function CourseManagement() {
  const {
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    professorFilter,
    setProfessorFilter,
    filteredCourses,
    categories,
    professors,
    handleCourseAction
  } = useCourseManagement();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <ManagementHeader />

      {stats && <CourseStatsCards stats={stats} />}

      <CourseFilters
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        professorFilter={professorFilter}
        categories={categories}
        professors={professors}
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
        onProfessorChange={setProfessorFilter}
      />

      <CoursesList
        courses={filteredCourses}
        onCourseAction={handleCourseAction}
      />
    </div>
  );
}