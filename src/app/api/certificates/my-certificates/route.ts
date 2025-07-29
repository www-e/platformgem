// src/app/api/certificates/my-certificates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserCertificates } from '@/lib/certificate';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const certificates = await getUserCertificates(session.user.id);

    return NextResponse.json({
      certificates
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}