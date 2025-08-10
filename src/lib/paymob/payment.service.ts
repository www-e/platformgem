// src/lib/paymob/payment.service.ts

import * as paymob from './client';
import { paymobConfig } from './config';
import { PayMobOrderRequest } from './types';
import { createPaymentIntention, buildUnifiedCheckoutUrl, extractPublicKey } from './intention.service';

/**
 * The response structure for a successful payment initiation.
 */
export interface PaymentInitiationResult {
  paymentKey?: string;
  orderId?: number;
  iframeUrl?: string;
  // E-wallet specific fields
  intentionId?: string;
  clientSecret?: string;
  checkoutUrl?: string;
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
      // Use Intention API for e-wallets (correct approach)
      try {
        const intention = await createPaymentIntention(orderData, courseId, userId);
        
        // Get public key for checkout URL
        const publicKey = extractPublicKey(paymobConfig.apiKey);
        const checkoutUrl = buildUnifiedCheckoutUrl(publicKey, intention.client_secret);

        console.log('E-wallet payment intention created:', {
          intentionId: intention.id,
          checkoutUrl: checkoutUrl,
          intentionOrderId: intention.intention_order_id
        });

        return {
          intentionId: intention.id,
          clientSecret: intention.client_secret,
          checkoutUrl: checkoutUrl,
          orderId: intention.intention_order_id ? parseInt(intention.intention_order_id) : undefined,
          paymentMethod: 'e-wallet'
        };
      } catch (error) {
        console.error('E-wallet payment intention failed:', error);
        
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes('API غير صحيح')) {
            throw new Error('مفتاح API الخاص بـ PayMob غير صحيح. يرجى التحقق من الإعدادات.');
          } else if (error.message.includes('PUBLIC_KEY')) {
            throw new Error('مفتاح PayMob العام غير مُعرَّف. يرجى إضافة PAYMOB_PUBLIC_KEY في ملف البيئة.');
          } else if (error.message.includes('بيانات الطلب')) {
            throw new Error('بيانات الدفع غير صحيحة. يرجى المحاولة مرة أخرى.');
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