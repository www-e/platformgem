// src/app/api/admin/webhooks/[webhookId]/retry/route.ts
import { NextRequest} from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';
import { processWebhookPayload } from '@/lib/webhook-processor';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { webhookId } = await params;

    // Find the webhook event using the correct model
    const webhook = await prisma.paymentWebhook.findUnique({
      where: { id: webhookId }
    });

    if (!webhook) {
      return createErrorResponse(
        'WEBHOOK_NOT_FOUND',
        'Webhook event not found',
        404
      );
    }

    // Check if webhook can be retried
    if (webhook.processedAt) {
      return createErrorResponse(
        'WEBHOOK_ALREADY_PROCESSED',
        'This webhook has already been processed successfully',
        400
      );
    }

    // Increment processing attempts
    await prisma.paymentWebhook.update({
      where: { id: webhookId },
      data: {
        processingAttempts: { increment: 1 },
        lastError: 'Retrying manually...',
        updatedAt: new Date()
      }
    });

    try {
      // Process the webhook payload
      // Note: processWebhookPayload needs a signature. We will assume for manual retry
      // that the payload is trusted and bypass signature checks within the processor.
      // This is a simplification; a more robust solution might store the signature.
      await processWebhookPayload(webhook.webhookPayload, "manual_retry_signature_bypass");

      // Update webhook status to processed
      await prisma.paymentWebhook.update({
        where: { id: webhookId },
        data: {
          processedAt: new Date(),
          lastError: null,
          updatedAt: new Date()
        }
      });

      return createSuccessResponse({
        message: 'Webhook processed successfully',
        webhookId: webhookId,
        attempts: webhook.processingAttempts + 1
      });

    } catch (processingError) {
      console.error('Webhook retry processing failed:', processingError);

      // Update webhook status to failed
      await prisma.paymentWebhook.update({
        where: { id: webhookId },
        data: {
          lastError: processingError instanceof Error ? processingError.message : 'Unknown error during retry',
          updatedAt: new Date()
        }
      });

      return createErrorResponse(
        'WEBHOOK_PROCESSING_FAILED',
        'Failed to process webhook during retry',
        500,
        processingError
      );
    }

  } catch (error) {
    console.error('Webhook retry API error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}