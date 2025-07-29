// scripts/test-webhook-verification.ts
// Test PayMob webhook signature verification

import { payMobService } from '../src/lib/paymob';
import crypto from 'crypto';

async function testWebhookVerification() {
  console.log('🔍 Testing PayMob webhook signature verification...');
  
  // Sample webhook payload (structure based on PayMob documentation)
  const sampleWebhookData = {
    id: 123456789,
    pending: false,
    amount_cents: 19900,
    success: true,
    is_auth: false,
    is_capture: true,
    is_refunded: false,
    is_standalone_payment: true,
    is_voided: false,
    integration_id: 5113123,
    order_id: 362183333, // PayMob sends this at top level for HMAC
    order: {
      id: 362183333,
      merchant_order_id: 'course_test_user_test_1234567890',
      amount_cents: 19900,
      currency: 'EGP'
    },
    created_at: '2025-07-29T06:32:49.000000',
    currency: 'EGP',
    error_occured: false,
    has_parent_transaction: false,
    is_3d_secure: true,
    owner: 123456,
    // PayMob sends these as separate fields in webhook
    source_data_pan: '409000xxxxxx3626',
    source_data_type: 'card',
    source_data_sub_type: 'MasterCard'
  };
  
  // Generate a valid HMAC for testing
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET || '';
  if (!hmacSecret) {
    console.error('❌ PAYMOB_HMAC_SECRET not found in environment');
    return;
  }
  
  // Create the concatenated string for HMAC
  const concatenatedString = [
    sampleWebhookData.amount_cents,
    sampleWebhookData.created_at,
    sampleWebhookData.currency,
    sampleWebhookData.error_occured,
    sampleWebhookData.has_parent_transaction,
    sampleWebhookData.id,
    sampleWebhookData.integration_id,
    sampleWebhookData.is_3d_secure,
    sampleWebhookData.is_auth,
    sampleWebhookData.is_capture,
    sampleWebhookData.is_refunded,
    sampleWebhookData.is_standalone_payment,
    sampleWebhookData.is_voided,
    sampleWebhookData.order_id,
    sampleWebhookData.owner,
    sampleWebhookData.pending,
    sampleWebhookData.source_data_pan,
    sampleWebhookData.source_data_sub_type,
    sampleWebhookData.source_data_type,
    sampleWebhookData.success
  ].join('');
  
  console.log('Concatenated string for HMAC:', concatenatedString);
  
  // Generate valid HMAC
  const validHmac = crypto
    .createHmac('sha512', hmacSecret)
    .update(concatenatedString)
    .digest('hex');
  
  console.log('Generated HMAC:', validHmac);
  
  // Test 1: Valid signature
  const validPayload = {
    ...sampleWebhookData,
    hmac: validHmac
  };
  
  console.log('🔐 Testing valid signature...');
  
  // Debug: Let's see what the service generates
  console.log('Expected HMAC:', validHmac);
  
  const isValidSignature = payMobService.verifyWebhookSignature(validPayload);
  console.log('Valid signature test:', isValidSignature ? '✅ PASSED' : '❌ FAILED');
  
  // Test 2: Invalid signature
  console.log('🔐 Testing invalid signature...');
  const invalidPayload = {
    ...sampleWebhookData,
    hmac: 'invalid_hmac_signature'
  };
  
  const isInvalidSignature = payMobService.verifyWebhookSignature(invalidPayload);
  console.log('Invalid signature test:', !isInvalidSignature ? '✅ PASSED' : '❌ FAILED');
  
  // Test 3: Missing HMAC
  console.log('🔐 Testing missing HMAC...');
  const missingHmacPayload = {
    ...sampleWebhookData
    // No hmac field
  };
  
  const isMissingHmac = payMobService.verifyWebhookSignature(missingHmacPayload);
  console.log('Missing HMAC test:', !isMissingHmac ? '✅ PASSED' : '❌ FAILED');
  
  // Test 4: Payload validation
  console.log('📋 Testing payload validation...');
  const isValidPayload = payMobService.validateWebhookPayload(validPayload);
  console.log('Valid payload test:', isValidPayload ? '✅ PASSED' : '❌ FAILED');
  
  // Test 5: Invalid payload (missing required field)
  console.log('📋 Testing invalid payload...');
  const invalidStructurePayload = {
    id: 123,
    // Missing required fields
  };
  
  const isInvalidPayload = payMobService.validateWebhookPayload(invalidStructurePayload);
  console.log('Invalid payload test:', !isInvalidPayload ? '✅ PASSED' : '❌ FAILED');
  
  console.log('🎉 Webhook verification tests completed!');
}

testWebhookVerification();