// src/app/api/test-payment/route.ts
// Test endpoint to debug payment initiation

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Payment test endpoint',
      session: {
        userId: session?.user?.id,
        userRole: session?.user?.role,
        userName: session?.user?.name
      },
      requestBody: body,
      envCheck: {
        PAYMOB_API_KEY: process.env.PAYMOB_API_KEY ? 'Configured' : 'Missing',
        PAYMOB_INTEGRATION_ID_ONLINE_CARD: process.env.PAYMOB_INTEGRATION_ID_ONLINE_CARD ? 'Configured' : 'Missing',
        PAYMOB_INTEGRATION_ID_MOBILE_WALLET: process.env.PAYMOB_INTEGRATION_ID_MOBILE_WALLET ? 'Configured' : 'Missing',
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}