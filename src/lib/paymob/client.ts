// src/lib/paymob/client.ts

import { paymobConfig } from "./config";
import {
  PayMobAuthResponse,
  PayMobOrderRequest,
  PayMobOrderResponse,
  PayMobPaymentKeyResponse,
  PayMobBillingData,
} from "./types";
// Import utility functions from utils file
import {
  formatAmountToCents as formatAmount,
  generateMerchantOrderId,
  createBillingData,
} from "./utils";

/**
 * Step 1: Authenticates with PayMob to get an auth token.
 * @returns A promise that resolves to the authentication token.
 */
export async function authenticate(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${paymobConfig.baseUrl}/auth/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: paymobConfig.apiKey,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`PayMob authentication failed: ${response.statusText}`);
    }

    const data: PayMobAuthResponse = await response.json();
    return data.token;
  } catch (error) {
    console.error("PayMob authentication error:", error);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "انتهت مهلة الاتصال بنظام الدفع. يرجى المحاولة مرة أخرى."
      );
    }
    throw new Error("فشل في الاتصال بنظام الدفع");
  }
}

/**
 * Step 2: Creates an order with PayMob.
 * @param authToken - The authentication token from Step 1.
 * @param orderData - The data for the order.
 * @returns A promise that resolves to the created order details.
 */
export async function createOrder(
  authToken: string,
  orderData: PayMobOrderRequest
): Promise<PayMobOrderResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${paymobConfig.baseUrl}/ecommerce/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false, // Assuming this is always false for digital goods
        ...orderData,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("PayMob order creation failed response:", errorBody);
      throw new Error(`PayMob order creation failed: ${response.statusText}`);
    }

    const data: PayMobOrderResponse = await response.json();
    return data;
  } catch (error) {
    console.error("PayMob order creation error:", error);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("انتهت مهلة إنشاء طلب الدفع. يرجى المحاولة مرة أخرى.");
    }
    throw new Error("فشل في إنشاء طلب الدفع");
  }
}

/**
 * Step 3: Gets a payment key for embedding the payment iframe.
 * @param authToken - The authentication token.
 * @param orderId - The ID of the order created in Step 2.
 * @param amountCents - The total amount in cents.
 * @param billingData - The customer's billing information.
 * @param paymentMethod - The payment method to use ('credit-card' or 'e-wallet').
 * @returns A promise that resolves to the payment key token.
 */
export async function getPaymentKey(
  authToken: string,
  orderId: number,
  amountCents: number,
  billingData: PayMobBillingData,
  paymentMethod: "credit-card" | "e-wallet" = "credit-card"
): Promise<string> {
  try {
    // Select the appropriate integration ID based on payment method
    let integrationId: number;
    try {
      integrationId =
        paymentMethod === "e-wallet"
          ? parseInt(paymobConfig.integrationIdMobileWallet)
          : parseInt(paymobConfig.integrationIdOnlineCard);

      if (isNaN(integrationId)) {
        throw new Error(
          `Invalid integration ID for payment method: ${paymentMethod}`
        );
      }
    } catch (error) {
      console.error("PayMob integration ID error:", error);
      throw new Error(`فشل في تكوين طريقة الدفع ${paymentMethod}`);
    }

    console.log(
      `Using integration ID ${integrationId} for payment method: ${paymentMethod}`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(
      `${paymobConfig.baseUrl}/acceptance/payment_keys`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: amountCents,
          expiration: paymobConfig.sessionExpiryMinutes * 60, // Dynamic expiration in seconds
          order_id: orderId,
          billing_data: billingData,
          currency: "EGP",
          integration_id: integrationId,
          lock_order_when_paid: true,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("PayMob payment key failed response:", errorBody);
      throw new Error(
        `PayMob payment key generation failed: ${response.statusText}`
      );
    }

    const data: PayMobPaymentKeyResponse = await response.json();
    return data.token;
  } catch (error) {
    console.error("PayMob payment key error:", error);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("انتهت مهلة إنشاء مفتاح الدفع. يرجى المحاولة مرة أخرى.");
    }
    throw new Error("فشل في إنشاء مفتاح الدفع");
  }
}

// Export a service object for backward compatibility
export const payMobService = {
  authenticate,
  createOrder,
  getPaymentKey,
  formatAmount,
  generateMerchantOrderId,
  createBillingData,
  // Import webhook methods
  async validateWebhookPayload(data: any) {
    const { validateWebhookPayload } = await import("./webhook.service");
    return validateWebhookPayload(data);
  },
  async verifyWebhookSignature(webhookObject: any) {
    const { verifyWebhookSignature } = await import("./webhook.service");
    return verifyWebhookSignature(webhookObject);
  },
  async processWebhook(webhookObject: any) {
    const { processWebhook } = await import("./webhook.service");
    return processWebhook(webhookObject);
  },
  async initiatePayment(
    orderData: any,
    courseId?: string,
    paymentMethod: "credit-card" | "e-wallet" = "credit-card"
  ) {
    const { initiatePayment } = await import("./payment.service");
    return initiatePayment(orderData, courseId, paymentMethod);
  },
};
