// src/lib/paymob.ts
import crypto from 'crypto';

export interface PayMobConfig {
  apiKey: string;
  integrationIdOnlineCard: string;
  integrationIdMobileWallet: string;
  iframeId: string;
  hmacSecret: string;
  baseUrl: string;
}

export interface PayMobOrderRequest {
  amount_cents: number;
  currency: string;
  merchant_order_id: string;
  items: Array<{
    name: string;
    amount_cents: number;
    description: string;
    quantity: number;
  }>;
  billing_data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    country: string;
    state: string;
    city: string;
    street: string;
    building: string;
    floor: string;
    apartment: string;
  };
}

export interface PayMobAuthResponse {
  token: string;
}

export interface PayMobOrderResponse {
  id: number;
  created_at: string;
  delivery_needed: boolean;
  merchant: {
    id: number;
    created_at: string;
    phones: string[];
    company_emails: string[];
    company_name: string;
    state: string;
    country: string;
    city: string;
    postal_code: string;
    street: string;
  };
  collector: any;
  amount_cents: number;
  shipping_data: any;
  currency: string;
  is_payment_locked: boolean;
  is_return: boolean;
  is_cancel: boolean;
  is_returned: boolean;
  is_canceled: boolean;
  merchant_order_id: string;
  wallet_notification: any;
  paid_amount_cents: number;
  notify_user_with_email: boolean;
  items: Array<{
    name: string;
    description: string;
    amount_cents: number;
    quantity: number;
  }>;
  order_url: string;
  commission_fees: number;
  delivery_fees_cents: number;
  delivery_vat_cents: number;
  payment_method: string;
  merchant_staff_tag: any;
  api_source: string;
  data: any;
}

export interface PayMobPaymentKeyResponse {
  token: string;
}

export interface PayMobTransactionResponse {
  id: number;
  pending: boolean;
  amount_cents: number;
  success: boolean;
  is_auth: boolean;
  is_capture: boolean;
  is_standalone_payment: boolean;
  is_voided: boolean;
  is_refunded: boolean;
  is_3d_secure: boolean;
  integration_id: number;
  profile_id: number;
  has_parent_transaction: boolean;
  order: {
    id: number;
    created_at: string;
    delivery_needed: boolean;
    merchant: any;
    collector: any;
    amount_cents: number;
    shipping_data: any;
    currency: string;
    is_payment_locked: boolean;
    merchant_order_id: string;
    wallet_notification: any;
    paid_amount_cents: number;
    items: any[];
    order_url: string;
    commission_fees: number;
    delivery_fees_cents: number;
    delivery_vat_cents: number;
    payment_method: string;
    api_source: string;
    data: any;
  };
  created_at: string;
  transaction_processed_callback_responses: any[];
  currency: string;
  source_data: {
    pan: string;
    type: string;
    tenure: any;
    sub_type: string;
  };
  api_source: string;
  terminal_id: any;
  merchant_commission: number;
  installment: any;
  discount_details: any[];
  is_void: boolean;
  is_refund: boolean;
  data: any;
  is_hidden: boolean;
  payment_key_claims: {
    user_id: number;
    amount_cents: number;
    currency: string;
    integration_id: number;
    order_id: number;
    billing_data: any;
    extra: any;
    exp: number;
    pmk_ip: string;
    lock_order_when_paid: boolean;
  };
  error_occured: boolean;
  is_live: boolean;
  other_endpoint_reference: any;
  refunded_amount_cents: number;
  source_id: number;
  is_captured: boolean;
  captured_amount: number;
  merchant_staff_tag: any;
  updated_at: string;
  is_settled: boolean;
  bill_balanced: boolean;
  is_bill: boolean;
  owner: number;
  parent_transaction: any;
}

class PayMobService {
  private config: PayMobConfig;

  constructor() {
    this.config = {
      apiKey: process.env.PAYMOB_API_KEY || '',
      integrationIdOnlineCard: process.env.PAYMOB_INTEGRATION_ID_ONLINE_CARD || '',
      integrationIdMobileWallet: process.env.PAYMOB_INTEGRATION_ID_MOBILE_WALLET || '',
      iframeId: process.env.PAYMOB_IFRAME_ID || '',
      hmacSecret: process.env.PAYMOB_HMAC_SECRET || '',
      baseUrl: process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com/api'
    };

    if (!this.config.apiKey || !this.config.integrationIdOnlineCard || !this.config.hmacSecret) {
      throw new Error('PayMob configuration is incomplete. Please check environment variables.');
    }
  }

  /**
   * Step 1: Authenticate with PayMob and get auth token
   */
  async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.config.apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`PayMob authentication failed: ${response.statusText}`);
      }

      const data: PayMobAuthResponse = await response.json();
      return data.token;
    } catch (error) {
      console.error('PayMob authentication error:', error);
      throw new Error('فشل في الاتصال بنظام الدفع');
    }
  }

  /**
   * Step 2: Create order with PayMob
   */
  async createOrder(authToken: string, orderData: PayMobOrderRequest): Promise<PayMobOrderResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/ecommerce/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_token: authToken,
          delivery_needed: false,
          amount_cents: orderData.amount_cents,
          currency: orderData.currency,
          merchant_order_id: orderData.merchant_order_id,
          items: orderData.items,
          shipping_data: orderData.billing_data,
          billing_data: orderData.billing_data
        })
      });

      if (!response.ok) {
        throw new Error(`PayMob order creation failed: ${response.statusText}`);
      }

      const data: PayMobOrderResponse = await response.json();
      return data;
    } catch (error) {
      console.error('PayMob order creation error:', error);
      throw new Error('فشل في إنشاء طلب الدفع');
    }
  }

  /**
   * Step 3: Get payment key for iframe
   */
  async getPaymentKey(authToken: string, orderId: number, amountCents: number, billingData: any): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/acceptance/payment_keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: amountCents,
          expiration: 3600, // 1 hour
          order_id: orderId,
          billing_data: billingData,
          currency: 'EGP',
          integration_id: parseInt(this.config.integrationIdOnlineCard),
          lock_order_when_paid: true
        })
      });

      if (!response.ok) {
        throw new Error(`PayMob payment key generation failed: ${response.statusText}`);
      }

      const data: PayMobPaymentKeyResponse = await response.json();
      return data.token;
    } catch (error) {
      console.error('PayMob payment key error:', error);
      throw new Error('فشل في إنشاء مفتاح الدفع');
    }
  }

  /**
   * Complete payment flow: authenticate -> create order -> get payment key
   */
  async initiatePayment(orderData: PayMobOrderRequest): Promise<{
    paymentKey: string;
    orderId: number;
    iframeUrl: string;
  }> {
    try {
      // Step 1: Authenticate
      const authToken = await this.authenticate();

      // Step 2: Create order
      const order = await this.createOrder(authToken, orderData);

      // Step 3: Get payment key
      const paymentKey = await this.getPaymentKey(
        authToken,
        order.id,
        orderData.amount_cents,
        orderData.billing_data
      );

      // Step 4: Generate iframe URL
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`;

      return {
        paymentKey,
        orderId: order.id,
        iframeUrl
      };
    } catch (error) {
      console.error('PayMob payment initiation error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(data: any): boolean {
    try {
      const {
        amount_cents,
        created_at,
        currency,
        error_occured,
        has_parent_transaction,
        id,
        integration_id,
        is_3d_secure,
        is_auth,
        is_capture,
        is_refunded,
        is_standalone_payment,
        is_voided,
        order_id,
        owner,
        pending,
        source_data_pan,
        source_data_sub_type,
        source_data_type,
        success,
        hmac
      } = data;

      // Create the string to hash according to PayMob documentation
      const concatenatedString = [
        amount_cents,
        created_at,
        currency,
        error_occured,
        has_parent_transaction,
        id,
        integration_id,
        is_3d_secure,
        is_auth,
        is_capture,
        is_refunded,
        is_standalone_payment,
        is_voided,
        order_id,
        owner,
        pending,
        source_data_pan,
        source_data_sub_type,
        source_data_type,
        success
      ].join('');

      // Generate HMAC
      const calculatedHmac = crypto
        .createHmac('sha512', this.config.hmacSecret)
        .update(concatenatedString)
        .digest('hex');

      return calculatedHmac === hmac;
    } catch (error) {
      console.error('HMAC verification error:', error);
      return false;
    }
  }

  /**
   * Process webhook data
   */
  processWebhook(data: any): {
    isValid: boolean;
    transactionId: number;
    orderId: number;
    success: boolean;
    amountCents: number;
    currency: string;
    merchantOrderId: string;
  } {
    const isValid = this.verifyWebhookSignature(data);

    return {
      isValid,
      transactionId: data.id,
      orderId: data.order?.id,
      success: data.success && !data.error_occured,
      amountCents: data.amount_cents,
      currency: data.currency,
      merchantOrderId: data.order?.merchant_order_id
    };
  }

  /**
   * Format amount for PayMob (convert EGP to cents)
   */
  formatAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Parse amount from PayMob (convert cents to EGP)
   */
  parseAmount(amountCents: number): number {
    return amountCents / 100;
  }

  /**
   * Generate merchant order ID
   */
  generateMerchantOrderId(courseId: string, userId: string): string {
    const timestamp = Date.now();
    return `course_${courseId}_user_${userId}_${timestamp}`;
  }

  /**
   * Create billing data from user information
   */
  createBillingData(user: {
    name: string;
    email?: string;
    phone: string;
  }): PayMobOrderRequest['billing_data'] {
    const [firstName, ...lastNameParts] = user.name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    return {
      first_name: firstName,
      last_name: lastName,
      email: user.email || `${user.phone}@temp.com`,
      phone_number: user.phone,
      country: 'EG',
      state: 'Cairo',
      city: 'Cairo',
      street: 'N/A',
      building: 'N/A',
      floor: 'N/A',
      apartment: 'N/A'
    };
  }
}

export const payMobService = new PayMobService();