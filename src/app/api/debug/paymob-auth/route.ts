// src/app/api/debug/paymob-auth/route.ts - Debug PayMob Authentication
import { NextRequest } from "next/server";
import { paymobConfig } from "@/lib/paymob/config";
import { authenticate } from "@/lib/paymob/client";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing PayMob authentication...");
    
    // Test basic configuration
    const configTest = {
      hasApiKey: !!paymobConfig.apiKey,
      apiKeyLength: paymobConfig.apiKey?.length || 0,
      apiKeyPrefix: paymobConfig.apiKey?.substring(0, 10) + "..." || "N/A",
      hasOnlineCardIntegration: !!paymobConfig.integrationIdOnlineCard,
      hasMobileWalletIntegration: !!paymobConfig.integrationIdMobileWallet,
      mobileWalletIntegrationId: paymobConfig.integrationIdMobileWallet,
      baseUrl: paymobConfig.baseUrl,
    };
    
    console.log("PayMob Configuration Test:", configTest);
    
    // Test authentication
    try {
      const authToken = await authenticate();
      console.log("✅ Authentication successful");
      
      return Response.json({
        success: true,
        message: "PayMob authentication successful",
        config: configTest,
        authToken: {
          length: authToken.length,
          prefix: authToken.substring(0, 10) + "...",
        }
      });
    } catch (authError) {
      console.error("❌ Authentication failed:", authError);
      
      return Response.json({
        success: false,
        message: "PayMob authentication failed",
        config: configTest,
        error: authError instanceof Error ? authError.message : "Unknown error"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Debug endpoint error:", error);
    
    return Response.json({
      success: false,
      message: "Debug endpoint error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}