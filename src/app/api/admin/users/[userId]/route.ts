// src/app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { userId } = params;
    const { action } = await request.json();

    switch (action) {
      case 'activate':
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: true }
        });
        break;

      case 'deactivate':
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false }
        });
        break;

      case 'delete':
        // Soft delete by deactivating
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false }
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
    console.error('User action error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}