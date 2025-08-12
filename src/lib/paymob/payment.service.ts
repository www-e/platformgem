// src/lib/paymob/payment.service.ts

import * as paymob from './client';
import { paymobConfig } from './config';
import { PayMobOrderRequest } from './types';
import { 
  initiateMobileWalletPayment, 
  buildMobileWalletOTPUrl, 
  validateMobileWalletResponse,
  getMobileWalletProvider 
} from './mobile-wallet.service';

/**
 * The response structure for a successful payment initiation.
 */
export interface PaymentInitiationResult {
  paymentKey?: string;
  orderId?: number;
  iframeUrl?: string;
  // Mobile wallet specific fields
  transactionId?: number;
  otpUrl?: string;
  walletProvider?: string;
  requiresOTP?: boolean;
  paymentMethod: 'credit-card' | 'e-wallet';
}

/**
 * Orchestrates the complete PayMob payment flow:
 * For credit cards: Uses traditional iframe approach
 * For e-wallets: Uses Intention API (unified checkout)
 * @param orderData - The data required to create the order.
 * @param courseId - The optional ID of the course for constructing the return URL.
 * @param paymentMethod - The payment method to use ('credit-card' or 'e-wallet').
 * @returns A promise that resolves to an object containing the payment details.
 */
export async function initiatePayment(
  orderData: PayMobOrderRequest,
  courseId?: string,
  paymentMethod: 'credit-card' | 'e-wallet' = 'credit-card',
  userId?: string
): Promise<PaymentInitiationResult> {
  try {
    console.log(`Initiating ${paymentMethod} payment for course ${courseId}`);

    if (paymentMethod === 'e-wallet') {
      // Try mobile wallet payment with fallback to iframe approach
      try {
        // First, authenticate and create order (same as credit cards)
        const authToken = await paymob.authenticate();
        const order = await paymob.createOrder(authToken, orderData);
        
        // Extract phone number from billing data for mobile wallet
        const phoneNumber = orderData.billing_data.phone_number;
        if (!phoneNumber) {
          throw new Error('رقم الهاتف مطلوب للدفع بالمحفظة الإلكترونية');
        }

        // Get wallet provider name
        const walletProvider = getMobileWalletProvider(phoneNumber);

        // Direct mobile wallet payment with proper Bearer authentication
        const walletResponse = await initiateMobileWalletPayment(
          authToken,
          order.id,
          orderData.amount_cents,
          phoneNumber,
          orderData.billing_data
        );

        // Validate the response
        const validation = validateMobileWalletResponse(walletResponse);
        if (!validation.isValid) {
          throw new Error(validation.error || 'فشل في بدء دفع المحفظة الإلكترونية');
        }

        console.log('Mobile wallet payment initiated successfully:', {
          transactionId: walletResponse.id,
          orderId: order.id,
          requiresOTP: validation.requiresOTP,
          walletProvider: walletProvider,
          redirectUrl: validation.redirectUrl
        });

        return {
          transactionId: walletResponse.id,
          orderId: order.id,
          otpUrl: validation.redirectUrl,
          walletProvider: walletProvider,
          requiresOTP: validation.requiresOTP,
          paymentMethod: 'e-wallet'
        };
      } catch (error) {
        console.error('Mobile wallet payment initiation failed:', error);
        
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes('رقم الهاتف')) {
            throw new Error('رقم الهاتف غير صحيح أو غير مسجل في أي محفظة إلكترونية');
          } else if (error.message.includes('معرف تكامل')) {
            throw new Error('إعدادات المحفظة الإلكترونية غير صحيحة. يرجى التواصل مع الدعم الفني.');
          } else if (error.message.includes('غير متاحة')) {
            throw new Error('خدمة المحفظة الإلكترونية غير متاحة حالياً. يرجى المحاولة لاحقاً.');
          } else if (error.message.includes('مفتاح المصادقة')) {
            throw new Error('خطأ في إعدادات PayMob. يرجى التحقق من API Key ومعرف التكامل.');
          }
        }
        
        throw error;
      }
    } else {
      // Use traditional iframe approach for credit cards
      const authToken = await paymob.authenticate();
      const order = await paymob.createOrder(authToken, orderData);
      const paymentKey = await paymob.getPaymentKey(
        authToken,
        order.id,
        orderData.amount_cents,
        orderData.billing_data,
        paymentMethod
      );
      const iframeUrl = buildIframeUrl(paymentKey, courseId);

      console.log('Credit card payment initiated:', {
        orderId: order.id,
        paymentKey: paymentKey
      });

      return {
        paymentKey,
        orderId: order.id,
        iframeUrl,
        paymentMethod: 'credit-card'
      };
    }
  } catch (error) {
    console.error('PayMob payment initiation error:', error);
    throw error;
  }
}

/**
 * Constructs the PayMob iframe URL with an optional return URL.
 * @param paymentKey - The payment token from PayMob.
 * @param courseId - The optional course ID to embed in the return URL.
 * @returns The fully constructed iframe URL.
 */
function buildIframeUrl(paymentKey: string, courseId?: string): string {
  let iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${paymobConfig.iframeId}?payment_token=${paymentKey}`;

  // Add return URL if it's configured and a course ID is provided
  if (paymobConfig.returnUrl && courseId) {
    const returnUrlWithCourse = paymobConfig.returnUrl.replace(
      '{courseId}',
      courseId
    );
    iframeUrl += `&return_url=${encodeURIComponent(returnUrlWithCourse)}`;
  }

  return iframeUrl;
}