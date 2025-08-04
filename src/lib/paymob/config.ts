// src/lib/paymob/config.ts

import { PayMobConfig } from './types';

/**
 * Loads and validates the PayMob configuration from environment variables.
 * Throws an error if critical configuration is missing.
 */
function loadPayMobConfig(): PayMobConfig {
  const config: PayMobConfig = {
    apiKey: process.env.PAYMOB_API_KEY || '',
    integrationIdOnlineCard:
      process.env.PAYMOB_INTEGRATION_ID_ONLINE_CARD || '',
    integrationIdMobileWallet:
      process.env.PAYMOB_INTEGRATION_ID_MOBILE_WALLET || '',
    iframeId: process.env.PAYMOB_IFRAME_ID || '',
    hmacSecret: process.env.PAYMOB_HMAC_SECRET || '',
    baseUrl: process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com/api',
    webhookUrl: process.env.PAYMOB_WEBHOOK_URL || '',
    returnUrl: process.env.PAYMOB_RETURN_URL || '',
  };

  if (
    !config.apiKey ||
    !config.integrationIdOnlineCard ||
    !config.hmacSecret ||
    !config.iframeId
  ) {
    // In a real application, you might want to log this more gracefully
    // But throwing an error on startup for missing critical config is a safe default.
    throw new Error(
      'PayMob configuration is incomplete. Please check environment variables: PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID_ONLINE_CARD, PAYMOB_HMAC_SECRET, PAYMOB_IFRAME_ID'
    );
  }

  return config;
}

export const paymobConfig = loadPayMobConfig();