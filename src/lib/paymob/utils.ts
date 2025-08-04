// src/lib/paymob/utils.ts

import { PayMobBillingData } from './types';

/**
 * Formats an amount in a standard currency (e.g., EGP) to cents for PayMob.
 * @param amount - The amount in the base currency unit.
 * @returns The amount in cents, rounded to the nearest integer.
 */
export function formatAmountToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Parses an amount in cents from PayMob to a standard currency format.
 * @param amountCents - The amount in cents.
 * @returns The amount in the base currency unit.
 */
export function parseAmountFromCents(amountCents: number): number {
  return amountCents / 100;
}

/**
 * Generates a unique merchant order ID for a transaction.
 * @param courseId - The ID of the course being purchased.
 * @param userId - The ID of the user making the purchase.
 * @returns A unique string to be used as the merchant_order_id.
 */
export function generateMerchantOrderId(
  courseId: string,
  userId: string
): string {
  const timestamp = Date.now();
  // Using a more concise and URL-friendly format
  return `crs-${courseId}-usr-${userId}-${timestamp}`;
}

/**
 * Creates a PayMob-compatible billing data object from user information.
 * @param user - An object containing user details.
 * @returns A PayMobBillingData object with default values for non-essential fields.
 */
export function createBillingData(user: {
  name: string;
  email?: string | null;
  phone: string;
}): PayMobBillingData {
  const [firstName, ...lastNameParts] = user.name.split(' ');
  const lastName = lastNameParts.join(' ') || firstName;

  return {
    first_name: firstName,
    last_name: lastName,
    email: user.email || `${user.phone}@placeholder.email`, // A more descriptive placeholder
    phone_number: user.phone,
    // Providing sensible defaults as these are required by PayMob but may not be collected by you
    country: 'EG',
    state: 'Cairo',
    city: 'Cairo',
    street: 'N/A',
    building: 'N/A',
    floor: 'N/A',
    apartment: 'N/A',
  };
}