// src/app/api/admin/webhooks/[webhookId]/retry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';
import { processWebhookPayload } from '@/lib/webhook-processor';

export async function POST(
  request: NextRequest,
  { params }: { params: { webhookId: string } }
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

    const { webhookId } = params;

    // Find the webhook event
    const webhook = await prisma.webhookEvent.findUnique({
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
    if (webhook.status === 'PROCESSED') {
      return createErrorResponse(
        'WEBHOOK_ALREADY_PROCESSED',
        'This webhook has already been processed successfully',
        400
      );
    }

    // Update webhook status to processing
    await prisma.webhookEvent.update({
      where: { id: webhookId },
      data: {
        status: 'PROCESSING',
        processingAttempts: webhook.processingAttempts + 1,
        updatedAt: new Date()
      }
    });

    try {
      // Process the webhook payload
      await processWebhookPayload(webhook.payload, webhook.signature);

      // Update webhook status to processed
      await prisma.webhookEvent.update({
        where: { id: webhookId },
        data: {
          status: 'PROCESSED',
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
      await prisma.webhookEvent.update({
        where: { id: webhookId },
        data: {
          status: 'FAILED',
          lastError: processingError instanceof Error ? processingError.message : 'Unknown error',
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
    console.error('Webhook retry error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}