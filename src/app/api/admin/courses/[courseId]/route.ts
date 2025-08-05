// src/app/api/admin/courses/[courseId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { courseId } = await params;
    const { action } = await request.json();

    switch (action) {
      case 'publish':
        await prisma.course.update({
          where: { id: courseId },
          data: { isPublished: true }
        });
        break;

      case 'unpublish':
        await prisma.course.update({
          where: { id: courseId },
          data: { isPublished: false }
        });
        break;

      case 'delete':
        // Soft delete by unpublishing
        await prisma.course.update({
          where: { id: courseId },
          data: { isPublished: false }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'إجراء غير صالح' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Course action error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}