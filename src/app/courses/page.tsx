// src/app/courses/page.tsx
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ModernCourseCatalog } from '@/components/course/ModernCourseCatalog';
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
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
    priceRange?: string;
    level?: string;
    sort?: string;
    limit?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  
  // Parse search parameters
  const filters = {
    page: parseInt(resolvedSearchParams.page || '1'),
    category: resolvedSearchParams.category,
    search: resolvedSearchParams.search,
    priceRange: resolvedSearchParams.priceRange,
    level: resolvedSearchParams.level,
    sort: resolvedSearchParams.sort || 'newest',
    limit: parseInt(resolvedSearchParams.limit || '12'),
  };

  // Fetch initial data for better performance
  const [categories, featuredCourses, stats] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, iconUrl: true },
      orderBy: { name: 'asc' }
    }).then(cats => cats.map(cat => ({
      ...cat,
      iconUrl: cat.iconUrl || undefined
    }))),
    prisma.course.findMany({
      where: { isPublished: true },
      include: {
        professor: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, lessons: true } },
        payments: {
          where: { status: 'COMPLETED' },
          select: { amount: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    }),
    prisma.$transaction([
      prisma.course.count({ where: { isPublished: true } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'PROFESSOR' } })
    ])
  ]);

  // Transform courses data
  const transformedCourses = featuredCourses.map(course => ({
    ...course,
    price: course.price ? Number(course.price) : null,
    revenue: course.payments.reduce((sum, p) => sum + Number(p.amount), 0),
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString()
  }));

  const [totalCourses, totalStudents, totalProfessors] = stats;

  return (
    <>
      <StructuredData />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <ModernCourseCatalog 
          initialFilters={filters}
          userRole={session?.user?.role}
          userId={session?.user?.id}
          categories={categories}
          featuredCourses={transformedCourses}
          stats={{
            totalCourses,
            totalStudents,
            totalProfessors
          }}
        />
      </div>
    </>
  );
}