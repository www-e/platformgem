// src/lib/paymob/webhook.service.ts

import crypto from "crypto";
import { paymobConfig } from "./config";
import { PayMobTransactionResponse } from "./types";

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Verifies the HMAC signature of a PayMob webhook payload.
 * @param webhookObject - The full object received from the webhook `obj` key.
 * @returns True if the signature is valid, otherwise false.
 */
export function verifyWebhookSignature(
  webhookObject: PayMobTransactionResponse
): boolean {
  try {
    const { hmac, ...data } = webhookObject;

    if (!hmac || typeof hmac !== "string") {
      console.error("HMAC verification failed: Missing or invalid HMAC");
      return false;
    }

    // The fields must be ordered alphabetically by key.
    const orderedKeys = [
      "amount_cents",
      "created_at",
      "currency",
      "error_occured",
      "has_parent_transaction",
      "id",
      "integration_id",
      "is_3d_secure",
      "is_auth",
      "is_capture",
      "is_refunded",
      "is_standalone_payment",
      "is_voided",
      "order",
      "owner",
      "pending",
      "source_data.pan",
      "source_data.sub_type",
      "source_data.type",
      "success",
    ];

    // Build the concatenated string from the data object
    const concatenatedString = orderedKeys
      .map((key) => {
        if (key.startsWith("source_data.")) {
          const subKey = key.split(".")[1];
          return (
            data.source_data?.[subKey as keyof typeof data.source_data] ??
            "false"
          );
        }
        if (key === "order") {
          return data.order?.id;
        }
        return data[key as keyof typeof data];
      })
      .join("");

    // Generate our own HMAC
    const calculatedHmac = crypto
      .createHmac("sha512", paymobConfig.hmacSecret)
      .update(concatenatedString)
      .digest("hex");

    // Compare safely
    return constantTimeCompare(calculatedHmac, hmac);
  } catch (error) {
    console.error("HMAC verification error:", error);
    return false;
  }
}

/**
 * Validates the structure of the incoming webhook payload.
 * @param data - The full webhook data object.
 * @returns True if the payload is valid, false otherwise.
 */
export function validateWebhookPayload(
  data: any
): data is PayMobTransactionResponse {
  if (!data || typeof data !== "object") return false;

  const requiredFields = [
    "id",
    "amount_cents",
    "success",
    "pending",
    "currency",
    "integration_id",
    "order",
    "created_at",
    "hmac",
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      console.error(
        `Webhook validation failed: Missing required field '${field}'`
      );
      return false;
    }
  }

  if (!data.order || typeof data.order !== "object" || !("id" in data.order)) {
    console.error(
      "Webhook validation failed: Invalid or missing order object/ID"
    );
    return false;
  }

  return true;
}

/**
 * A processed webhook response with a clear structure.
 */
export interface ProcessedWebhook {
  isValid: boolean;
  transactionId?: number;
  orderId?: number;
  isSuccess?: boolean;
  amountCents?: number;
  currency?: string;
  merchantOrderId?: string;
}

/**
 * Processes the raw webhook data, including signature validation and data extraction.
 * @param webhookObject - The `obj` from the webhook payload.
 * @returns A structured object with the processing result.
 */
export function processWebhook(webhookObject: unknown): ProcessedWebhook {
  if (!validateWebhookPayload(webhookObject)) {
    return { isValid: false };
  }

  const isValid = verifyWebhookSignature(webhookObject);
  if (!isValid) {
    return { isValid: false };
  }

  return {
    isValid: true,
    transactionId: webhookObject.id,
    orderId: webhookObject.order.id,
    isSuccess: webhookObject.success && !webhookObject.error_occured,
    amountCents: webhookObject.amount_cents,
    currency: webhookObject.currency,
    merchantOrderId: webhookObject.order.merchant_order_id,
  };
}
