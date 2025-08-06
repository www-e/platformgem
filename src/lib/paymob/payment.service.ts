// src/lib/paymob/payment.service.ts

import * as paymob from './client';
import { paymobConfig } from './config';
import { PayMobOrderRequest } from './types';

/**
 * The response structure for a successful payment initiation.
 */
export interface PaymentInitiationResult {
  paymentKey: string;
  orderId: number;
  iframeUrl: string;
}

/**
 * Orchestrates the complete PayMob payment flow:
 * 1. Authenticates with PayMob.
 * 2. Creates an order.
 * 3. Generates a payment key for the iframe.
 * @param orderData - The data required to create the order.
 * @param courseId - The optional ID of the course for constructing the return URL.
 * @param paymentMethod - The payment method to use ('credit-card' or 'e-wallet').
 * @returns A promise that resolves to an object containing the payment key, order ID, and iframe URL.
 */
export async function initiatePayment(
  orderData: PayMobOrderRequest,
  courseId?: string,
  paymentMethod: 'credit-card' | 'e-wallet' = 'credit-card'
): Promise<PaymentInitiationResult> {
  try {
    // Step 1: Authenticate
    const authToken = await paymob.authenticate();

    // Step 2: Create order
    const order = await paymob.createOrder(authToken, orderData);

    // Step 3: Get payment key
    const paymentKey = await paymob.getPaymentKey(
      authToken,
      order.id,
      orderData.amount_cents,
      orderData.billing_data,
      paymentMethod
    );

    // Step 4: Generate iframe URL
    const iframeUrl = buildIframeUrl(paymentKey, courseId);

    return {
      paymentKey,
      orderId: order.id,
      iframeUrl,
    };
  } catch (error) {
    console.error('PayMob payment initiation error:', error);
    // Re-throw the original error to be handled by the calling function
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