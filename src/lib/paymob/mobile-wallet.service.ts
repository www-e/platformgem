// src/lib/paymob/mobile-wallet.service.ts - Paymob Mobile Wallet Direct API Integration

import { paymobConfig } from "./config";
import { PayMobBillingData } from "./types";

/**
 * The request structure for a direct mobile wallet payment.
 * Note: Authentication is handled via the Authorization header, not in the body.
 */
export interface MobileWalletPaymentRequest {
  source: {
    identifier: string; // Phone number (11 digits for Egypt)
    subtype: "WALLET"; // Always "WALLET" for this payment method
  };
  payment_token: string; // This is the payment key obtained after creating an order
}

/**
 * The response from a successful mobile wallet payment initiation.
 * It contains the URL to redirect the user for OTP verification.
 */
export interface MobileWalletPaymentResponse {
  id: number;
  pending: boolean;
  success: boolean;
  redirect_url: string; // The URL for OTP verification
  // ... and other fields that we can add if needed from the PayMob response
  [key: string]: any;
}

/**
 * Validates the format of an Egyptian phone number.
 * @param phone The phone number string to validate.
 * @returns An object with validation status, the formatted number, and an optional error message.
 */
export function validateEgyptianPhoneNumber(phone: string): {
  isValid: boolean;
  formatted: string;
  error?: string;
} {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");

  // Check if it's 11 digits and starts with 01
  if (cleanPhone.length === 11 && cleanPhone.startsWith("01")) {
    return {
      isValid: true,
      formatted: cleanPhone,
    };
  }

  // Check if it's 10 digits starting with 1 (missing leading 0)
  if (cleanPhone.length === 10 && cleanPhone.startsWith("1")) {
    return {
      isValid: true,
      formatted: "0" + cleanPhone,
    };
  }

  return {
    isValid: false,
    formatted: cleanPhone,
    error: "رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01",
  };
}

/**
 * Creates a payment key. This key acts as a one-time token to authorize a payment for a specific order.
 * This is a necessary prerequisite for the direct API call.
 * @param authToken The master authentication token from PayMob.
 * @param orderId The ID of the order.
 * @param amountCents The amount in cents.
 * @param billingData The customer's billing information.
 * @returns A promise that resolves to the payment key token.
 */
async function createPaymentKey(
  authToken: string,
  orderId: number,
  amountCents: number,
  billingData: PayMobBillingData
): Promise<string> {
  const integrationId = parseInt(paymobConfig.integrationIdMobileWallet);
  if (isNaN(integrationId)) {
    throw new Error("معرف تكامل المحفظة الإلكترونية غير صحيح أو غير مُعرَّف");
  }

  const response = await fetch(
    `${paymobConfig.baseUrl}/acceptance/payment_keys`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: paymobConfig.sessionExpiryMinutes * 60,
        order_id: orderId,
        billing_data: billingData,
        currency: "EGP",
        integration_id: integrationId,
        lock_order_when_paid: true,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to create payment key:", errorBody);
    throw new Error("فشل في إنشاء مفتاح الدفع اللازم لعملية المحفظة الإلكترونية.");
  }

  const data = await response.json();
  return data.token;
}

/**
 * Initiates a mobile wallet payment using the correct direct API endpoint.
 * This function will first obtain a payment key and then use it to make the payment request.
 * @param authToken The master authentication token from PayMob.
 * @param orderId The ID of the order.
 *... (The rest of the parameters)
 * @returns A promise that resolves to the mobile wallet payment response, including the OTP redirect URL.
 */
export async function initiateMobileWalletPayment(
  authToken: string,
  orderId: number,
  amountCents: number,
  phoneNumber: string,
  billingData: PayMobBillingData
): Promise<MobileWalletPaymentResponse> {
  try {
    // Step 1: Validate the phone number format
    const phoneValidation = validateEgyptianPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.error || "رقم الهاتف غير صحيح");
    }

    console.log("🔄 Initiating mobile wallet payment (Direct API Flow)...");

    // Step 2: Create a one-time Payment Key for this transaction
    const paymentToken = await createPaymentKey(
      authToken,
      orderId,
      amountCents,
      billingData
    );
    console.log("✅ Payment key created for mobile wallet.");

    // Step 3: Make the actual payment request using the direct `/payments/pay` endpoint
    const paymentRequest: MobileWalletPaymentRequest = {
      source: {
        identifier: phoneValidation.formatted,
        subtype: "WALLET",
      },
      payment_token: paymentToken, // Use the payment key here
    };

    console.log("🚀 Sending request to /acceptance/payments/pay");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `${paymobConfig.baseUrl}/acceptance/payments/pay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The direct API requires Bearer token authentication
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(paymentRequest),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Mobile wallet payment initiation failed:", {
        status: response.status,
        statusText: response.statusText,
        errorBody,
      });

      // Provide a more helpful error based on the status code
      if (response.status === 401) {
        throw new Error("خطأ في المصادقة مع PayMob. تأكد من صلاحية مفتاح الـ API.");
      }
      throw new Error(`فشل في بدء عملية الدفع بالمحفظة الإلكترونية: ${response.statusText}`);
    }

    const data: MobileWalletPaymentResponse = await response.json();

    console.log("✅ Mobile wallet payment initiated successfully. Redirecting to OTP...");
    console.log({ redirect_url: data.redirect_url });

    return data;
  } catch (error) {
    console.error("Mobile wallet payment initiation error:", error);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("انتهت مهلة إنشاء طلب الدفع. يرجى المحاولة مرة أخرى.");
    }
    throw error;
  }
}

/**
 * Extracts the mobile wallet provider from a given phone number based on its prefix.
 * @param phoneNumber The phone number to check.
 * @returns The name of the wallet provider or a generic fallback.
 */
export function getMobileWalletProvider(phoneNumber: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "");

  if (cleanPhone.startsWith("010")) return "فودافون كاش";
  if (cleanPhone.startsWith("011")) return "اتصالات كاش";
  if (cleanPhone.startsWith("012")) return "أورنج موني";
  if (cleanPhone.startsWith("015")) return "WE Pay";

  return "محفظة إلكترونية";
}