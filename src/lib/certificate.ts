// src/lib/certificate.ts
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Certificate generation utilities
export interface CertificateData {
  id: string;
  certificateCode: string;
  studentName: string;
  courseName: string;
  professorName: string;
  completionDate: Date;
  finalScore?: number;
  validUntil?: Date;
  courseCategory: string;
  courseDuration: number; // in minutes
  totalLessons: number;
}

/**
 * Generate a unique certificate code
 */
function generateCertificateCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Check if user is eligible for certificate
 */
export async function checkCertificateEligibility(
  userId: string,
  courseId: string
): Promise<{
  eligible: boolean;
  reason?: string;
  completionRate: number;
  requiredRate: number;
}> {
  try {
    // Get course and enrollment data
    const [course, enrollment] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId },
        include: {
          lessons: {
            select: { id: true }
          }
        }
      }),
      prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        }
      })
    ]);

    if (!course || !enrollment) {
      return {
        eligible: false,
        reason: 'Course or enrollment not found',
        completionRate: 0,
        requiredRate: 90
      };
    }

    const requiredRate = 90; // 90% completion required
    const completionRate = enrollment.progressPercent;

    if (completionRate < requiredRate) {
      return {
        eligible: false,
        reason: `Completion rate ${completionRate}% is below required ${requiredRate}%`,
        completionRate,
        requiredRate
      };
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingCertificate && !existingCertificate.isRevoked) {
      return {
        eligible: false,
        reason: 'Certificate already issued',
        completionRate,
        requiredRate
      };
    }

    return {
      eligible: true,
      completionRate,
      requiredRate
    };

  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    return {
      eligible: false,
      reason: 'Error checking eligibility',
      completionRate: 0,
      requiredRate: 90
    };
  }
}

/**
 * Generate certificate for a user
 */
export async function generateCertificate(
  userId: string,
  courseId: string
): Promise<{
  success: boolean;
  certificate?: CertificateData;
  error?: string;
}> {
  try {
    // Check eligibility first
    const eligibility = await checkCertificateEligibility(userId, courseId);
    
    if (!eligibility.eligible) {
      return {
        success: false,
        error: eligibility.reason || 'Not eligible for certificate'
      };
    }

    // Get detailed course and user data
    const [course, user, enrollment] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId },
        include: {
          professor: {
            select: { name: true }
          },
          category: {
            select: { name: true }
          },
          lessons: {
            select: { duration: true }
          }
        }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      }),
      prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        }
      })
    ]);

    if (!course || !user || !enrollment) {
      return {
        success: false,
        error: 'Required data not found'
      };
    }

    // Calculate course duration
    const courseDuration = course.lessons.reduce(
      (total, lesson) => total + (lesson.duration || 0),
      0
    ) / 60; // Convert to minutes

    // Generate certificate
    const certificateCode = generateCertificateCode();
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 2); // Valid for 2 years

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateCode,
        finalScore: enrollment.progressPercent,
        validUntil,
        metadata: {
          courseName: course.title,
          studentName: user.name,
          professorName: course.professor.name,
          categoryName: course.category.name,
          totalLessons: course.lessons.length,
          courseDuration
        }
      }
    });

    // Record milestone achievement
    await prisma.progressMilestone.create({
      data: {
        userId,
        courseId,
        milestoneType: 'CERTIFICATE',
        metadata: {
          certificateCode,
          completionRate: enrollment.progressPercent
        }
      }
    });

    const certificateData: CertificateData = {
      id: certificate.id,
      certificateCode: certificate.certificateCode,
      studentName: user.name,
      courseName: course.title,
      professorName: course.professor.name,
      completionDate: certificate.completionDate,
      finalScore: certificate.finalScore || undefined,
      validUntil: certificate.validUntil || undefined,
      courseCategory: course.category.name,
      courseDuration,
      totalLessons: course.lessons.length
    };

    return {
      success: true,
      certificate: certificateData
    };

  } catch (error) {
    console.error('Error generating certificate:', error);
    return {
      success: false,
      error: 'Failed to generate certificate'
    };
  }
}/*
*
 * Get certificate by code (for verification)
 */
export async function verifyCertificate(certificateCode: string): Promise<{
  valid: boolean;
  certificate?: CertificateData;
  error?: string;
}> {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode },
      include: {
        user: {
          select: { name: true }
        },
        course: {
          include: {
            professor: {
              select: { name: true }
            },
            category: {
              select: { name: true }
            },
            lessons: {
              select: { duration: true }
            }
          }
        }
      }
    });

    if (!certificate) {
      return {
        valid: false,
        error: 'Certificate not found'
      };
    }

    if (certificate.isRevoked) {
      return {
        valid: false,
        error: 'Certificate has been revoked'
      };
    }

    if (certificate.validUntil && certificate.validUntil < new Date()) {
      return {
        valid: false,
        error: 'Certificate has expired'
      };
    }

    const courseDuration = certificate.course.lessons.reduce(
      (total, lesson) => total + (lesson.duration || 0),
      0
    ) / 60;

    const certificateData: CertificateData = {
      id: certificate.id,
      certificateCode: certificate.certificateCode,
      studentName: certificate.user.name,
      courseName: certificate.course.title,
      professorName: certificate.course.professor.name,
      completionDate: certificate.completionDate,
      finalScore: certificate.finalScore || undefined,
      validUntil: certificate.validUntil || undefined,
      courseCategory: certificate.course.category.name,
      courseDuration,
      totalLessons: certificate.course.lessons.length
    };

    return {
      valid: true,
      certificate: certificateData
    };

  } catch (error) {
    console.error('Error verifying certificate:', error);
    return {
      valid: false,
      error: 'Error verifying certificate'
    };
  }
}

/**
 * Get user's certificates
 */
export async function getUserCertificates(userId: string): Promise<CertificateData[]> {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        userId,
        isRevoked: false
      },
      include: {
        user: {
          select: { name: true }
        },
        course: {
          include: {
            professor: {
              select: { name: true }
            },
            category: {
              select: { name: true }
            },
            lessons: {
              select: { duration: true }
            }
          }
        }
      },
      orderBy: {
        completionDate: 'desc'
      }
    });

    return certificates.map(certificate => {
      const courseDuration = certificate.course.lessons.reduce(
        (total, lesson) => total + (lesson.duration || 0),
        0
      ) / 60;

      return {
        id: certificate.id,
        certificateCode: certificate.certificateCode,
        studentName: certificate.user.name,
        courseName: certificate.course.title,
        professorName: certificate.course.professor.name,
        completionDate: certificate.completionDate,
        finalScore: certificate.finalScore || undefined,
        validUntil: certificate.validUntil || undefined,
        courseCategory: certificate.course.category.name,
        courseDuration,
        totalLessons: certificate.course.lessons.length
      };
    });

  } catch (error) {
    console.error('Error getting user certificates:', error);
    return [];
  }
}

/**
 * Record progress milestone
 */
export async function recordProgressMilestone(
  userId: string,
  courseId: string,
  milestoneType: string,
  metadata?: any
): Promise<boolean> {
  try {
    await prisma.progressMilestone.upsert({
      where: {
        userId_courseId_milestoneType: {
          userId,
          courseId,
          milestoneType
        }
      },
      update: {
        metadata
      },
      create: {
        userId,
        courseId,
        milestoneType,
        metadata
      }
    });

    return true;
  } catch (error) {
    console.error('Error recording progress milestone:', error);
    return false;
  }
}