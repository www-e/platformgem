// src/app/api/debug-payment/route.ts
// Debug endpoint to check payment initiation

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug payment endpoint called');
    
    const session = await auth();
    console.log('Session:', {
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userName: session?.user?.name
    });
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Check environment variables
    const envCheck = {
      PAYMOB_API_KEY: process.env.PAYMOB_API_KEY ? 'Configured' : 'Missing',
      PAYMOB_INTEGRATION_ID_ONLINE_CARD: process.env.PAYMOB_INTEGRATION_ID_ONLINE_CARD ? 'Configured' : 'Missing',
      PAYMOB_INTEGRATION_ID_MOBILE_WALLET: process.env.PAYMOB_INTEGRATION_ID_MOBILE_WALLET ? 'Configured' : 'Missing',
      PAYMOB_BASE_URL: process.env.PAYMOB_BASE_URL ? 'Configured' : 'Missing',
      PAYMOB_IFRAME_ID: process.env.PAYMOB_IFRAME_ID ? 'Configured' : 'Missing',
      PAYMOB_HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET ? 'Configured' : 'Missing',
    };
    
    console.log('Environment check:', envCheck);
    
    // Try to import PayMob service
    try {
      const { payMobService } = await import('@/lib/paymob');
      console.log('✅ PayMob service imported successfully');
      
      // Test authentication
      try {
        const authToken = await payMobService.authenticate();
        console.log('✅ PayMob authentication successful:', authToken ? 'Token received' : 'No token');
      } catch (authError) {
        console.log('❌ PayMob authentication failed:', authError);
      }
      
    } catch (importError) {
      console.log('❌ PayMob service import failed:', importError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug payment endpoint',
      session: {
        userId: session?.user?.id,
        userRole: session?.user?.role,
        userName: session?.user?.name
      },
      requestBody: body,
      envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug payment endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}