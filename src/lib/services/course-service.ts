// src/lib/services/course-service.ts
// Centralized service for course-related operations

import { UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';
import { 
  CourseWithMetadata, 
  FeaturedCourse, 
  EnrolledCourse,
  CourseFilters,
  CourseCatalogResponse
} from '@/types/course';
import { 
  calculateCourseDuration,
  calculateCourseProgress,
  getCourseStatus,
  buildCourseWhereClause,
  getCourseSortOrder,
  calculatePagination
} from '@/lib/course-utils';

export class CourseService {
  /**
   * Get featured courses for landing page
   */
  static async getFeaturedCourses(limit: number = 3): Promise<FeaturedCourse[]> {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true
      },
      include: {
        category: {
          select: {
            name: true
          }
        },
        professor: {
          select: {
            name: true
          }
        },
        lessons: {
          select: {
            duration: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price ? Number(course.price) : null,
      currency: course.currency,
      professor: {
        name: course.professor.name
      },
      category: {
        name: course.category.name
      },
      enrollmentCount: course._count.enrollments,
      totalDuration: calculateCourseDuration(course.lessons),
      lessonCount: course.lessons.length
    }));
  }

  /**
   * Get public course catalog with filtering and pagination
   */
  static async getCourseCatalog(
    filters: CourseFilters,
    page: number = 1,
    limit: number = 12,
    sort: string = 'newest',
    userId?: string,
    userRole?: UserRole
  ): Promise<CourseCatalogResponse> {
    // Get user's enrolled courses if student
    let enrolledCourseIds: string[] = [];
    if (userId && userRole === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        select: { courseId: true }
      });
      enrolledCourseIds = enrollments.map(e => e.courseId);
    }

    // Build where clause
    const whereClause = buildCourseWhereClause(filters, enrolledCourseIds);
    
    // Get total count
    const totalCount = await prisma.course.count({
      where: whereClause
    });

    // Calculate pagination
    const pagination = calculatePagination(totalCount, page, limit);

    // Get courses
    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        professor: {
          select: {
            id: true,
            name: true,
            expertise: true,
            bio: true
          }
        },
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
            duration: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: getCourseSortOrder(sort),
      skip: pagination.skip,
      take: pagination.take
    });

    // Transform courses with metadata
    const coursesWithMetadata: CourseWithMetadata[] = courses.map(course => {
      const totalDuration = calculateCourseDuration(course.lessons);
      const isEnrolled = enrolledCourseIds.includes(course.id);
      
      // Mock additional metadata (would come from actual analytics)
      const averageRating = 4.0 + Math.random() * 1.0;
      const reviewCount = Math.floor(Math.random() * 50) + 5;
      
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        price: course.price ? Number(course.price) : null,
        currency: course.currency,
        isPublished: course.isPublished,
        bunnyLibraryId: course.bunnyLibraryId,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        category: course.category,
        professor: course.professor,
        lessons: course.lessons,
        enrollmentCount: course._count.enrollments,
        totalDuration,
        lessonCount: course.lessons.length,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount,
        isEnrolled,
        canEdit: userId === course.professor.id || userRole === 'ADMIN',
        canManage: userRole === 'ADMIN'
      };
    });

    return {
      courses: coursesWithMetadata,
      totalCount,
      totalPages: pagination.totalPages,
      currentPage: page,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage
    };
  }

  /**
   * Get enrolled courses for a student
   */
  static async getEnrolledCourses(userId: string): Promise<EnrolledCourse[]> {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: {
              select: {
                name: true
              }
            },
            professor: {
              select: {
                name: true
              }
            },
            lessons: {
              select: {
                id: true,
                title: true,
                order: true,
                duration: true
              },
              orderBy: { order: 'asc' }
            }
          }
        },
        user: {
          include: {
            viewingHistory: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    return enrollments.map(enrollment => {
      const course = enrollment.course;
      const totalLessons = course.lessons.length;
      
      // Get viewing history for this course
      const courseViewingHistory = enrollment.user.viewingHistory.filter(vh => 
        course.lessons.some(lesson => lesson.id === vh.lessonId)
      );
      
      const completedLessons = courseViewingHistory.filter(vh => vh.completed).length;
      const progress = calculateCourseProgress(totalLessons, completedLessons);
      
      // Calculate durations
      const totalDuration = calculateCourseDuration(course.lessons);
      const watchedDuration = Math.round(
        courseViewingHistory.reduce((sum, vh) => sum + (vh.watchedDuration / 60), 0)
      );
      
      // Determine status and next lesson
      const status = getCourseStatus(progress);
      let nextLesson = null;
      
      if (status !== 'completed') {
        const completedLessonIds = new Set(
          courseViewingHistory.filter(vh => vh.completed).map(vh => vh.lessonId)
        );
        nextLesson = course.lessons.find(lesson => !completedLessonIds.has(lesson.id));
      }
      
      // Get last accessed time
      const lastAccessedAt = courseViewingHistory.length > 0 
        ? new Date(Math.max(...courseViewingHistory.map(vh => new Date(vh.updatedAt).getTime())))
        : null;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        category: {
          name: course.category.name
        },
        professor: {
          name: course.professor.name
        },
        enrolledAt: enrollment.enrolledAt,
        progress,
        totalLessons,
        completedLessons,
        totalDuration,
        watchedDuration,
        lastAccessedAt,
        nextLesson: nextLesson ? {
          id: nextLesson.id,
          title: nextLesson.title,
          order: nextLesson.order
        } : null,
        certificateEarned: status === 'completed',
        status
      };
    });
  }

  /**
   * Get course by ID with user-specific data
   */
  static async getCourseById(
    courseId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<CourseWithMetadata | null> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        professor: {
          select: {
            id: true,
            name: true,
            expertise: true,
            bio: true
          }
        },
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
            duration: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!course) return null;

    // Check if user is enrolled
    let isEnrolled = false;
    let progress = 0;
    let lastAccessedAt: Date | null = null;

    if (userId && userRole === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        },
        include: {
          user: {
            include: {
              viewingHistory: {
                where: {
                  lesson: {
                    courseId
                  }
                }
              }
            }
          }
        }
      });

      if (enrollment) {
        isEnrolled = true;
        const completedLessons = enrollment.user.viewingHistory.filter(vh => vh.completed).length;
        progress = calculateCourseProgress(course.lessons.length, completedLessons);
        
        if (enrollment.user.viewingHistory.length > 0) {
          lastAccessedAt = new Date(
            Math.max(...enrollment.user.viewingHistory.map(vh => new Date(vh.updatedAt).getTime()))
          );
        }
      }
    }

    const totalDuration = calculateCourseDuration(course.lessons);
    const averageRating = 4.0 + Math.random() * 1.0;
    const reviewCount = Math.floor(Math.random() * 50) + 5;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price ? Number(course.price) : null,
      currency: course.currency,
      isPublished: course.isPublished,
      bunnyLibraryId: course.bunnyLibraryId,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      category: course.category,
      professor: course.professor,
      lessons: course.lessons,
      enrollmentCount: course._count.enrollments,
      totalDuration,
      lessonCount: course.lessons.length,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
      isEnrolled,
      progress,
      lastAccessedAt,
      canEdit: userId === course.professor.id || userRole === 'ADMIN',
      canManage: userRole === 'ADMIN'
    };
  }
}