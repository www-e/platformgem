// src/app/api/certificates/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyCertificate } from '@/lib/certificate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateCode = searchParams.get('code');

    if (!certificateCode) {
      return NextResponse.json(
        { error: 'رمز الشهادة مطلوب' },
        { status: 400 }
      );
    }

    const result = await verifyCertificate(certificateCode);

    if (!result.valid) {
      return NextResponse.json(
        { 
          valid: false,
          error: result.error || 'شهادة غير صالحة'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      certificate: result.certificate
    });

  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}