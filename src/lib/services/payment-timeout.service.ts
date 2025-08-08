// src/lib/services/payment-timeout.service.ts

import prisma from '@/lib/prisma';
import { paymobConfig } from '@/lib/paymob/config';

export interface PaymentTimeoutConfig {
  abandonedCleanupMinutes: number;
  sessionExpiryMinutes: number;
  paymentTimeoutMinutes: number;
}

/**
 * Get payment timeout configuration
 */
export function getPaymentTimeoutConfig(): PaymentTimeoutConfig {
  return {
    abandonedCleanupMinutes: paymobConfig.abandonedPaymentCleanupMinutes,
    sessionExpiryMinutes: paymobConfig.sessionExpiryMinutes,
    paymentTimeoutMinutes: paymobConfig.paymentTimeoutMinutes,
  };
}

/**
 * Check if a payment is expired based on configuration
 */
export function isPaymentExpired(createdAt: Date, customTimeoutMinutes?: number): boolean {
  const timeoutMinutes = customTimeoutMinutes || paymobConfig.abandonedPaymentCleanupMinutes;
  const expiryTime = new Date(createdAt.getTime() + (timeoutMinutes * 60 * 1000));
  return new Date() > expiryTime;
}

/**
 * Get remaining time for a payment session
 */
export function getPaymentTimeRemaining(createdAt: Date, customTimeoutMinutes?: number): {
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const timeoutMinutes = customTimeoutMinutes || paymobConfig.paymentTimeoutMinutes;
  const expiryTime = new Date(createdAt.getTime() + (timeoutMinutes * 60 * 1000));
  const now = new Date();
  
  if (now > expiryTime) {
    return { minutes: 0, seconds: 0, expired: true };
  }
  
  const remainingMs = expiryTime.getTime() - now.getTime();
  const remainingMinutes = Math.floor(remainingMs / (60 * 1000));
  const remainingSeconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
  
  return {
    minutes: remainingMinutes,
    seconds: remainingSeconds,
    expired: false,
  };
}

/**
 * Clean up abandoned payments based on configuration
 */
export async function cleanupAbandonedPayments(): Promise<{
  cleaned: number;
  errors: number;
}> {
  try {
    const cutoffTime = new Date(
      Date.now() - (paymobConfig.abandonedPaymentCleanupMinutes * 60 * 1000)
    );

    console.log(`Cleaning up abandoned payments older than ${cutoffTime.toISOString()}`);

    const abandonedPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: cutoffTime,
        },
      },
    });

    let cleaned = 0;
    let errors = 0;

    for (const payment of abandonedPayments) {
      try {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'CANCELLED',
            failureReason: `Payment abandoned - exceeded ${paymobConfig.abandonedPaymentCleanupMinutes} minute limit`,
            updatedAt: new Date(),
          },
        });
        cleaned++;
        
        console.log(`Cancelled abandoned payment: ${payment.id}`);
      } catch (error) {
        console.error(`Failed to cancel payment ${payment.id}:`, error);
        errors++;
      }
    }

    console.log(`Cleanup completed: ${cleaned} payments cleaned, ${errors} errors`);
    return { cleaned, errors };
  } catch (error) {
    console.error('Error during payment cleanup:', error);
    return { cleaned: 0, errors: 1 };
  }
}

/**
 * Schedule automatic cleanup (for use in cron jobs or background tasks)
 */
export async function schedulePaymentCleanup(): Promise<void> {
  // Run cleanup every 15 minutes
  const cleanupInterval = 15 * 60 * 1000; // 15 minutes in milliseconds
  
  const runCleanup = async () => {
    try {
      const result = await cleanupAbandonedPayments();
      if (result.cleaned > 0 || result.errors > 0) {
        console.log(`Scheduled cleanup completed: ${result.cleaned} cleaned, ${result.errors} errors`);
      }
    } catch (error) {
      console.error('Scheduled cleanup failed:', error);
    }
  };

  // Run immediately
  await runCleanup();
  
  // Schedule recurring cleanup
  setInterval(runCleanup, cleanupInterval);
  
  console.log(`Payment cleanup scheduled to run every ${cleanupInterval / 60000} minutes`);
}
