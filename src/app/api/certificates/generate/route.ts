// src/app/api/certificates/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateCertificate, checkCertificateEligibility } from '@/lib/certificate';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'معرف الدورة مطلوب' },
        { status: 400 }
      );
    }

    // Check eligibility first
    const eligibility = await checkCertificateEligibility(session.user.id, courseId);
    
    if (!eligibility.eligible) {
      return NextResponse.json(
        { 
          error: eligibility.reason || 'غير مؤهل للحصول على الشهادة',
          completionRate: eligibility.completionRate,
          requiredRate: eligibility.requiredRate
        },
        { status: 400 }
      );
    }

    // Generate certificate
    const result = await generateCertificate(session.user.id, courseId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'فشل في إنشاء الشهادة' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate: result.certificate
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(_request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'معرف الدورة مطلوب' },
        { status: 400 }
      );
    }

    // Check eligibility
    const eligibility = await checkCertificateEligibility(session.user.id, courseId);

    return NextResponse.json({
      eligible: eligibility.eligible,
      reason: eligibility.reason,
      completionRate: eligibility.completionRate,
      requiredRate: eligibility.requiredRate
    });

  } catch (error) {
    console.error('Certificate eligibility check error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}