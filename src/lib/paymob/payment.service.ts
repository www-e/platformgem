// src/lib/paymob/payment.service.ts

import * as paymob from './client';
import { paymobConfig } from './config';
import { PayMobOrderRequest } from './types';
import { 
  initiateMobileWalletPayment, 
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
  otpUrl?: string; // This will now hold the direct redirect_url from PayMob
  walletProvider?: string;
  requiresOTP?: boolean;
  paymentMethod: 'credit-card' | 'e-wallet';
}

/**
 * Orchestrates the complete PayMob payment flow:
 * For credit cards: Uses the traditional iframe approach.
 * For e-wallets: Uses the direct API to get an OTP redirect URL.
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

    // First, authenticate and create the order for both flows
    const authToken = await paymob.authenticate();
    const order = await paymob.createOrder(authToken, orderData);

    if (paymentMethod === 'e-wallet') {
      // E-WALLET: Direct API flow
      try {
        const phoneNumber = orderData.billing_data.phone_number;
        if (!phoneNumber) {
          throw new Error('رقم الهاتف مطلوب للدفع بالمحفظة الإلكترونية');
        }

        // Get wallet provider name for display purposes
        const walletProvider = getMobileWalletProvider(phoneNumber);

        // Call our new direct mobile wallet payment function
        const walletResponse = await initiateMobileWalletPayment(
          authToken,
          order.id,
          orderData.amount_cents,
          phoneNumber,
          orderData.billing_data
        );

        console.log('✅ Mobile wallet payment initiated successfully:', {
          transactionId: walletResponse.id,
          orderId: order.id,
          walletProvider: walletProvider,
          redirectUrl: walletResponse.redirect_url
        });

        // The response now contains the direct URL for OTP verification
        return {
          transactionId: walletResponse.id,
          orderId: order.id,
          otpUrl: walletResponse.redirect_url, // Pass the redirect URL to the frontend
          walletProvider: walletProvider,
          requiresOTP: true, // This flow always requires OTP
          paymentMethod: 'e-wallet'
        };

      } catch (error) {
        console.error('Mobile wallet payment initiation failed:', error);
        
        // Propagate specific error messages for better frontend display
        if (error instanceof Error) {
          if (error.message.includes('رقم الهاتف')) {
            throw new Error('رقم الهاتف غير صحيح أو غير مسجل في أي محفظة إلكترونية');
          } else if (error.message.includes('معرف تكامل')) {
            throw new Error('إعدادات المحفظة الإلكترونية غير صحيحة. يرجى التواصل مع الدعم الفني.');
          } else if (error.message.includes('فشل في بدء')) {
             throw new Error('فشل في بدء عملية الدفع. قد يكون هناك مشكلة في الرصيد أو في الخدمة.');
          }
        }
        
        throw error; // Rethrow the error to be caught by the final handler
      }
    } else {
      // CREDIT CARD: Traditional iframe flow
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
        paymentKey: paymentKey.substring(0, 15) + '...'
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
    // This is a general catch-all for errors like authentication or order creation
    throw new Error(`فشل في تهيئة الدفع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

/**
 * Constructs the PayMob iframe URL for credit card payments.
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