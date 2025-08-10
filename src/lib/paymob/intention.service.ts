// src/lib/paymob/intention.service.ts - Paymob Intention API for E-wallets

import { paymobConfig } from "./config";
import { PayMobBillingData } from "./types";

export interface IntentionRequest {
  amount: number; // Amount in EGP (not cents)
  currency: string;
  payment_methods: string[]; // ["wallets"] as string array
  items: Array<{
    name: string;
    amount: number; // Amount in EGP (not cents)
    description: string;
    quantity: number;
  }>;
  billing_data: PayMobBillingData;
  special_reference?: string;
  notification_url?: string;
  extras?: {
    course_id?: string;
    user_id?: string;
  };
}

export interface IntentionResponse {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  payment_methods: string[];
  status: string;
  created_at: string;
  intention_order_id?: string; // Order tracking ID
}

/**
 * Creates a payment intention for e-wallet payments using Paymob's Intention API
 * This is the correct way to handle e-wallet payments (not iframe)
 */
export async function createPaymentIntention(
  orderData: {
    amount_cents: number;
    billing_data: PayMobBillingData;
    items: Array<{
      name: string;
      amount_cents: number;
      description: string;
      quantity: number;
    }>;
  },
  courseId?: string,
  userId?: string
): Promise<IntentionResponse> {
  try {
    // Validate API key
    if (!paymobConfig.apiKey || paymobConfig.apiKey.trim() === '') {
      throw new Error('PAYMOB_API_KEY is not configured');
    }
    
    if (!paymobConfig.apiKey.startsWith('sk_')) {
      console.warn('API key does not start with sk_ - this might cause authentication issues');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Convert amount from cents to EGP (divide by 100)
    const amountInEGP = orderData.amount_cents / 100;

    // Prepare the intention request according to correct Paymob API
    const intentionRequest: IntentionRequest = {
      amount: amountInEGP, // Amount in EGP, not cents
      currency: "EGP",
      payment_methods: ["wallets"], // String array, not integration ID
      items: orderData.items.map((item) => ({
        name: item.name,
        amount: item.amount_cents / 100, // Convert to EGP
        description: item.description,
        quantity: item.quantity,
      })),
      billing_data: orderData.billing_data,
      special_reference: courseId ? `course_${courseId}_payment` : undefined,
      notification_url: paymobConfig.webhookUrl,
      extras: {
        course_id: courseId,
        user_id: userId,
      },
    };

    console.log("Creating payment intention:", {
      amount: intentionRequest.amount,
      currency: intentionRequest.currency,
      payment_methods: intentionRequest.payment_methods,
      endpoint: "https://accept.paymob.com/v1/intention/",
      apiKeyPrefix: paymobConfig.apiKey.substring(0, 10) + "...", // Log first 10 chars for debugging
    });

    // Use the correct endpoint
    const response = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        Authorization: `Token ${paymobConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(intentionRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Paymob intention creation failed:", {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorBody,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error("مفتاح API غير صحيح أو منتهي الصلاحية");
      } else if (response.status === 400) {
        throw new Error("بيانات الطلب غير صحيحة");
      } else if (response.status === 404) {
        throw new Error("خدمة المحفظة الإلكترونية غير متاحة حالياً");
      }
      
      throw new Error(
        `Paymob intention creation failed: ${response.statusText}`
      );
    }

    const data: IntentionResponse = await response.json();

    console.log("Payment intention created successfully:", {
      id: data.id,
      client_secret: data.client_secret,
      status: data.status,
    });

    return data;
  } catch (error) {
    console.error("Payment intention creation error:", error);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("انتهت مهلة إنشاء طلب الدفع. يرجى المحاولة مرة أخرى.");
    }
    throw new Error("فشل في إنشاء طلب الدفع للمحفظة الإلكترونية");
  }
}

/**
 * Builds the unified checkout URL for e-wallet payments
 */
export function buildUnifiedCheckoutUrl(
  publicKey: string,
  clientSecret: string
): string {
  return `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;
}

/**
 * Gets the public key from the API key (first part before the dot)
 * This is a common pattern in Paymob integration
 */
export function extractPublicKey(apiKey: string): string {
  // Paymob API keys typically have format: pk_test_xxxxx or pk_live_xxxxx
  // For secret keys (sk_test_xxxxx), we need to derive the public key
  if (apiKey.startsWith("pk_")) {
    return apiKey;
  }

  // If it's a secret key, we need to get the public key from config
  // This should be configured in environment variables
  const publicKey = paymobConfig.publicKey || process.env.PAYMOB_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error(
      "PAYMOB_PUBLIC_KEY environment variable is required for e-wallet payments. Please set it in your .env file."
    );
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error(
      "PAYMOB_PUBLIC_KEY must start with 'pk_' (e.g., pk_test_xxxxx or pk_live_xxxxx)"
    );
  }

  return publicKey;
}
