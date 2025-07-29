// src/app/api/test-env/route.ts
// Test endpoint to check environment variables

import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    PAYMOB_API_KEY: process.env.PAYMOB_API_KEY ? "Configured" : "Missing",
    PAYMOB_INTEGRATION_ID_ONLINE_CARD: process.env
      .PAYMOB_INTEGRATION_ID_ONLINE_CARD
      ? "Configured"
      : "Missing",
    PAYMOB_INTEGRATION_ID_MOBILE_WALLET: process.env
      .PAYMOB_INTEGRATION_ID_MOBILE_WALLET
      ? "Configured"
      : "Missing",
    PAYMOB_BASE_URL: process.env.PAYMOB_BASE_URL ? "Configured" : "Missing",
    PAYMOB_IFRAME_ID: process.env.PAYMOB_IFRAME_ID ? "Configured" : "Missing",
    PAYMOB_HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET
      ? "Configured"
      : "Missing",
  };

  return NextResponse.json({
    message: "Environment Variables Check",
    variables: envVars,
    timestamp: new Date().toISOString(),
  });
}
