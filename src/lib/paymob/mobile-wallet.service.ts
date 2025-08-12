// src/lib/paymob/mobile-wallet.service.ts - Paymob Mobile Wallet OTP Integration

import { paymobConfig } from "./config";
import { PayMobBillingData } from "./types";

export interface MobileWalletPaymentRequest {
  auth_token: string;
  amount_cents: number;
  currency: string;
  order_id: number;
  billing_data: PayMobBillingData;
  integration_id: number;
  source: {
    identifier: string; // Phone number (11 digits for Egypt)
    subtype: "WALLET"; // Always WALLET for mobile wallets
  };
}

export interface MobileWalletPaymentResponse {
  id: number;
  pending: boolean;
  amount_cents: number;
  success: boolean;
  is_auth: boolean;
  is_capture: boolean;
  is_standalone_payment: boolean;
  is_voided: boolean;
  is_refunded: boolean;
  is_3d_secure: boolean;
  integration_id: number;
  profile_id: number;
  has_parent_transaction: boolean;
  order: {
    id: number;
    merchant_order_id: string;
    amount_cents: number;
  };
  created_at: string;
  currency: string;
  source_data: {
    pan: string;
    type: string;
    sub_type: string;
  };
  error_occured: boolean;
  is_live: boolean;
  refunded_amount_cents: number;
  source_id: number;
  is_captured: boolean;
  captured_amount: number;
  updated_at: string;
  is_settled: boolean;
  bill_balanced: boolean;
  is_bill: boolean;
  owner: number;
  parent_transaction: any;
  redirect_url?: string; // For OTP verification
  iframe_redirection_url?: string; // Alternative redirect URL
}

/**
 * Validates Egyptian phone number format for mobile wallets
 */
export function validateEgyptianPhoneNumber(phone: string): { isValid: boolean; formatted: string; error?: string } {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's 11 digits and starts with 01
  if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
    return {
      isValid: true,
      formatted: cleanPhone
    };
  }
  
  // Check if it's 10 digits starting with 1 (missing leading 0)
  if (cleanPhone.length === 10 && cleanPhone.startsWith('1')) {
    return {
      isValid: true,
      formatted: '0' + cleanPhone
    };
  }
  
  return {
    isValid: false,
    formatted: cleanPhone,
    error: 'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01'
  };
}

/**
 * Creates a payment key specifically for mobile wallet payments
 * This uses the same approach as credit cards but with mobile wallet integration ID
 */
export async function createMobileWalletPaymentKey(
  authToken: string,
  orderId: number,
  amountCents: number,
  phoneNumber: string,
  billingData: PayMobBillingData
): Promise<string> {
  try {
    // Validate phone number
    const phoneValidation = validateEgyptianPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.error || 'رقم الهاتف غير صحيح');
    }

    // Validate mobile wallet integration ID
    if (!paymobConfig.integrationIdMobileWallet) {
      throw new Error('معرف تكامل المحفظة الإلكترونية غير مُعرَّف في الإعدادات');
    }

    const integrationId = parseInt(paymobConfig.integrationIdMobileWallet);
    if (isNaN(integrationId)) {
      throw new Error('معرف تكامل المحفظة الإلكترونية غير صحيح');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Create payment key for mobile wallet (similar to credit card flow)
    const paymentKeyRequest = {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: paymobConfig.sessionExpiryMinutes * 60,
      order_id: orderId,
      billing_data: {
        ...billingData,
        phone_number: phoneValidation.formatted // Ensure phone number is properly formatted
      },
      currency: "EGP",
      integration_id: integrationId,
      lock_order_when_paid: true,
    };

    console.log("Creating mobile wallet payment key:", {
      phone: phoneValidation.formatted,
      amount_cents: amountCents,
      order_id: orderId,
      integration_id: integrationId,
      endpoint: `${paymobConfig.baseUrl}/acceptance/payment_keys`
    });

    const response = await fetch(`${paymobConfig.baseUrl}/acceptance/payment_keys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentKeyRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Mobile wallet payment key creation failed:", {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorBody,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error("مفتاح المصادقة غير صحيح - تأكد من صحة API Key");
      } else if (response.status === 400) {
        throw new Error("بيانات الدفع غير صحيحة - تأكد من رقم الهاتف ومعرف التكامل");
      } else if (response.status === 404) {
        throw new Error("خدمة المحفظة الإلكترونية غير متاحة حالياً");
      }
      
      throw new Error(`فشل في إنشاء مفتاح دفع المحفظة الإلكترونية: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Mobile wallet payment key creation error:", error);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("انتهت مهلة إنشاء مفتاح الدفع. يرجى المحاولة مرة أخرى.");
    }
    throw error;
  }
}

/**
 * Initiates mobile wallet payment using payment key approach
 * This creates a payment key and then processes the mobile wallet payment
 */
export async function initiateMobileWalletPayment(
  authToken: string,
  orderId: number,
  amountCents: number,
  phoneNumber: string,
  billingData: PayMobBillingData
): Promise<MobileWalletPaymentResponse> {
  try {
    // Validate phone number
    const phoneValidation = validateEgyptianPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.error || 'رقم الهاتف غير صحيح');
    }

    // Validate mobile wallet integration ID
    if (!paymobConfig.integrationIdMobileWallet) {
      throw new Error('معرف تكامل المحفظة الإلكترونية غير مُعرَّف في الإعدادات');
    }

    const integrationId = parseInt(paymobConfig.integrationIdMobileWallet);
    if (isNaN(integrationId)) {
      throw new Error('معرف تكامل المحفظة الإلكترونية غير صحيح');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Prepare mobile wallet payment request
    const paymentRequest = {
      auth_token: authToken,
      amount_cents: amountCents,
      currency: "EGP",
      order_id: orderId,
      billing_data: {
        ...billingData,
        phone_number: phoneValidation.formatted
      },
      integration_id: integrationId,
      source: {
        identifier: phoneValidation.formatted,
        subtype: "WALLET"
      }
    };

    console.log("Initiating mobile wallet payment:", {
      phone: phoneValidation.formatted,
      amount_cents: amountCents,
      order_id: orderId,
      integration_id: integrationId,
      endpoint: `${paymobConfig.baseUrl}/acceptance/payments/pay`
    });

    // Use the correct endpoint for mobile wallet payments
    const response = await fetch(`${paymobConfig.baseUrl}/acceptance/payments/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Mobile wallet payment initiation failed:", {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorBody,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      // Handle specific error cases with detailed debugging
      if (response.status === 401) {
        console.error("Authentication failed - checking auth token:", {
          authTokenLength: authToken.length,
          authTokenPrefix: authToken.substring(0, 10) + "...",
          integrationId: integrationId,
          apiKey: paymobConfig.apiKey.substring(0, 10) + "...",
        });
        throw new Error("مفتاح المصادقة غير صحيح - تأكد من صحة API Key ومعرف التكامل");
      } else if (response.status === 400) {
        console.error("Bad request - checking request data:", {
          phoneNumber: phoneValidation.formatted,
          integrationId: integrationId,
          amountCents: amountCents,
          orderId: orderId
        });
        throw new Error("بيانات الدفع غير صحيحة - تأكد من رقم الهاتف ومعرف التكامل");
      } else if (response.status === 404) {
        throw new Error("خدمة المحفظة الإلكترونية غير متاحة حالياً");
      } else if (response.status === 422) {
        throw new Error("رقم الهاتف غير مسجل في أي محفظة إلكترونية");
      }
      
      throw new Error(`فشل في بدء دفع المحفظة الإلكترونية: ${response.statusText}`);
    }

    const data: MobileWalletPaymentResponse = await response.json();

    console.log("Mobile wallet payment initiated:", {
      id: data.id,
      pending: data.pending,
      success: data.success,
      redirect_url: data.redirect_url,
      iframe_redirection_url: data.iframe_redirection_url
    });

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
 * Builds the OTP verification URL for mobile wallet payments
 * This URL is used to redirect users to complete OTP verification
 */
export function buildMobileWalletOTPUrl(
  transactionId: number,
  redirectUrl?: string,
  iframeUrl?: string
): string {
  // Use the redirect URL provided by Paymob, or fallback to iframe URL
  if (redirectUrl) {
    return redirectUrl;
  }
  
  if (iframeUrl) {
    return iframeUrl;
  }
  
  // Fallback: construct OTP URL manually (this should rarely be needed)
  const baseUrl = paymobConfig.baseUrl.replace('/api', '');
  return `${baseUrl}/acceptance/post_pay?id=${transactionId}`;
}

/**
 * Extracts mobile wallet provider from phone number
 */
export function getMobileWalletProvider(phoneNumber: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Egyptian mobile wallet providers by prefix
  if (cleanPhone.startsWith('010')) return 'فودافون كاش';
  if (cleanPhone.startsWith('011')) return 'إتصالات كاش';
  if (cleanPhone.startsWith('012')) return 'أورانج موني';
  if (cleanPhone.startsWith('015')) return 'WE Pay';
  
  return 'محفظة إلكترونية';
}

/**
 * Validates mobile wallet transaction response
 */
export function validateMobileWalletResponse(response: MobileWalletPaymentResponse): {
  isValid: boolean;
  requiresOTP: boolean;
  redirectUrl?: string;
  error?: string;
} {
  // Check if response has required fields
  if (!response.id || typeof response.pending !== 'boolean') {
    return {
      isValid: false,
      requiresOTP: false,
      error: 'استجابة غير صحيحة من نظام الدفع'
    };
  }

  // If payment is successful immediately (rare for mobile wallets)
  if (response.success && !response.pending) {
    return {
      isValid: true,
      requiresOTP: false
    };
  }

  // If payment failed
  if (response.error_occured || (!response.pending && !response.success)) {
    return {
      isValid: false,
      requiresOTP: false,
      error: 'فشل في بدء عملية الدفع - تأكد من رقم الهاتف ووجود رصيد كافي'
    };
  }

  // If payment is pending (normal flow for mobile wallets)
  if (response.pending) {
    const redirectUrl = response.redirect_url || response.iframe_redirection_url;
    
    if (!redirectUrl) {
      return {
        isValid: false,
        requiresOTP: false,
        error: 'لم يتم إنشاء رابط التحقق من OTP'
      };
    }

    return {
      isValid: true,
      requiresOTP: true,
      redirectUrl: redirectUrl
    };
  }

  return {
    isValid: false,
    requiresOTP: false,
    error: 'حالة دفع غير معروفة'
  };
}
