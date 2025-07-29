// src/app/courses/page.tsx
// Public course catalog page with filtering and role-based actions

import { Metadata } from 'next';
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import CourseCatalog from '@/components/course/CourseCatalog';
import { StructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'تصفح الدورات التعليمية - منصة التعلم الإلكتروني',
  description: 'اكتشف مجموعة واسعة من الدورات التعليمية في مختلف المجالات. ابحث وصفي الدورات حسب الفئة والسعر والمستوى.',
  keywords: 'دورات تعليمية, تصفح الدورات, دورات أونلاين, تعلم إلكتروني, فلترة الدورات',
  openGraph: {
    title: 'تصفح الدورات التعليمية - منصة التعلم الإلكتروني',
    description: 'اكتشف مجموعة واسعة من الدورات التعليمية في مختلف المجالات.',
    url: '/courses',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تصفح الدورات التعليمية',
    description: 'اكتشف مجموعة واسعة من الدورات التعليمية في مختلف المجالات.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface CoursesPageProps {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
    priceRange?: string;
    level?: string;
    sort?: string;
    limit?: string;
  };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const session = await auth();
  
  // Parse search parameters
  const filters = {
    page: parseInt(searchParams.page || '1'),
    category: searchParams.category,
    search: searchParams.search,
    priceRange: searchParams.priceRange,
    level: searchParams.level,
    sort: searchParams.sort || 'newest',
    limit: parseInt(searchParams.limit || '12'),
  };

  return (
    <>
      <StructuredData />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                تصفح الدورات التعليمية
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                اكتشف مجموعة واسعة من الدورات التعليمية المصممة لمساعدتك على تحقيق أهدافك الأكاديمية والمهنية
              </p>
            </div>
          </div>
        </div>

        {/* Course Catalog */}
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<CourseCatalogSkeleton />}>
            <CourseCatalog 
              initialFilters={filters}
              userRole={session?.user?.role}
              userId={session?.user?.id}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}

// Loading skeleton component
function CourseCatalogSkeleton() {
  return (
    <div className="space-y-8">
      {/* Filters Skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}