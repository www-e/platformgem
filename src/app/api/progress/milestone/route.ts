// src/app/api/progress/milestone/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { recordProgressMilestone } from '@/lib/certificate';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { courseId, milestoneType, metadata } = await request.json();

    if (!courseId || !milestoneType) {
      return NextResponse.json(
        { error: 'معرف الدورة ونوع المعلم مطلوبان' },
        { status: 400 }
      );
    }

    const success = await recordProgressMilestone(
      session.user.id,
      courseId,
      milestoneType,
      metadata
    );

    if (!success) {
      return NextResponse.json(
        { error: 'فشل في تسجيل المعلم' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Progress milestone error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}