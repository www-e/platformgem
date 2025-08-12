// src/lib/paymob/config.ts

import { PayMobConfig } from "./types";

/**
 * Loads and validates the PayMob configuration from environment variables.
 * Throws an error if critical configuration is missing.
 */
function loadPayMobConfig(): PayMobConfig {
  const config: PayMobConfig = {
    apiKey: process.env.PAYMOB_API_KEY || "",
    integrationIdOnlineCard:
      process.env.PAYMOB_INTEGRATION_ID_ONLINE_CARD || "",
    integrationIdMobileWallet:
      process.env.PAYMOB_INTEGRATION_ID_MOBILE_WALLET || "",
    iframeId: process.env.PAYMOB_IFRAME_ID || "",
    hmacSecret: process.env.PAYMOB_HMAC_SECRET || "",
    baseUrl: process.env.PAYMOB_BASE_URL || "https://accept.paymob.com/api",
    webhookUrl: process.env.PAYMOB_WEBHOOK_URL || "",
    returnUrl: process.env.PAYMOB_RETURN_URL || "",
    // Payment session configuration
    paymentTimeoutMinutes: parseInt(
      process.env.PAYMOB_PAYMENT_TIMEOUT_MINUTES || "60"
    ),
    sessionExpiryMinutes: parseInt(
      process.env.PAYMOB_SESSION_EXPIRY_MINUTES || "60"
    ),
    abandonedPaymentCleanupMinutes: parseInt(
      process.env.PAYMOB_ABANDONED_CLEANUP_MINUTES || "30"
    ),
  };

  const requiredFields = {
    apiKey: "PAYMOB_API_KEY",
    integrationIdOnlineCard: "PAYMOB_INTEGRATION_ID_ONLINE_CARD",
    hmacSecret: "PAYMOB_HMAC_SECRET",
    iframeId: "PAYMOB_IFRAME_ID",
  };

  const missingFields = [];
  for (const [field, envVar] of Object.entries(requiredFields)) {
    if (!config[field as keyof PayMobConfig]) {
      missingFields.push(envVar);
    }
  }

  // Validate integration IDs are numbers
  if (
    config.integrationIdOnlineCard &&
    isNaN(parseInt(config.integrationIdOnlineCard))
  ) {
    missingFields.push("PAYMOB_INTEGRATION_ID_ONLINE_CARD (must be a number)");
  }

  if (
    config.integrationIdMobileWallet &&
    isNaN(parseInt(config.integrationIdMobileWallet))
  ) {
    console.warn(
      "PAYMOB_INTEGRATION_ID_MOBILE_WALLET is not a valid number - mobile wallet payments will fail"
    );
  }

  if (missingFields.length > 0) {
    throw new Error(
      `PayMob configuration is incomplete. Missing or invalid: ${missingFields.join(
        ", "
      )}`
    );
  }

  return config;
}

export const paymobConfig = loadPayMobConfig();
